# 学習ループ設計

## 目的
Beyond Agency の実現には、ユーザーの反応から学習して提案を改善する仕組みが必要。
「先回り」が的を射ているかを測定し、外れていれば調整する。

## 現状の問題

### 1. 反応の粒度が粗い
現状は「適用したか否か」しか分からない。
- 見たが無視した → 追跡なし
- 修正して適用した → 追跡なし
- 明示的に拒否した → 追跡なし

### 2. 提案タイプが混在
SCORE、SPLIT、TIP、PREP を全部混ぜて `ai_trust_state` を計算している。
タイプ別の受容率が分からないと、どの提案を改善すべきか分からない。

### 3. コンテキストがない
「いつ、どんなタスクに対して、どんな状況で」提案が受け入れられたか不明。
バンディットで最適化するには、コンテキスト特徴量が必要。

---

## 設計

### Phase 1: 反応の詳細トラッキング

#### AiSuggestionReaction テーブル追加
```prisma
model AiSuggestionReaction {
  id            String   @id @default(uuid())
  suggestionId  String
  suggestion    AiSuggestion @relation(fields: [suggestionId], references: [id])

  // 反応の種類
  reaction      SuggestionReaction  // VIEWED | ACCEPTED | MODIFIED | REJECTED | IGNORED

  // コンテキスト
  taskType      TaskType?
  taskPoints    Int?
  hourOfDay     Int?      // 0-23
  dayOfWeek     Int?      // 0-6
  wipCount      Int?      // 反応時のWIP数
  flowState     Float?    // 反応時のflow_state

  // 修正の詳細（MODIFIEDの場合）
  modification  Json?     // { field: "points", before: 8, after: 5 }

  // タイミング
  viewedAt      DateTime?
  reactedAt     DateTime?
  latencyMs     Int?      // 表示から反応までの時間

  userId        String
  workspaceId   String?
  createdAt     DateTime  @default(now())
}

enum SuggestionReaction {
  VIEWED      // 表示された（ボタンクリックまたは自動表示）
  ACCEPTED    // そのまま適用
  MODIFIED    // 修正して適用
  REJECTED    // 明示的に却下
  IGNORED     // 表示後、別の操作をした（暗黙の却下）
}
```

#### フロントエンドでのトラッキング
```typescript
// 提案表示時
const trackSuggestionViewed = (suggestionId: string, context: SuggestionContext) => {
  fetch('/api/ai/reaction', {
    method: 'POST',
    body: JSON.stringify({
      suggestionId,
      reaction: 'VIEWED',
      context,
      viewedAt: new Date().toISOString(),
    }),
  });
};

// 適用時
const trackSuggestionAccepted = (suggestionId: string, modification?: object) => {
  fetch('/api/ai/reaction', {
    method: 'POST',
    body: JSON.stringify({
      suggestionId,
      reaction: modification ? 'MODIFIED' : 'ACCEPTED',
      modification,
      reactedAt: new Date().toISOString(),
    }),
  });
};

// 却下時（明示的に「却下」ボタンを押した場合）
const trackSuggestionRejected = (suggestionId: string) => {
  fetch('/api/ai/reaction', {
    method: 'POST',
    body: JSON.stringify({
      suggestionId,
      reaction: 'REJECTED',
      reactedAt: new Date().toISOString(),
    }),
  });
};

// モーダルを閉じた・別の操作をした場合
const trackSuggestionIgnored = (suggestionId: string) => {
  // VIEWED から一定時間後に ACCEPTED/MODIFIED/REJECTED がなければ IGNORED
};
```

---

### Phase 2: タイプ別メトリクス

#### MemoryType 追加
```python
METRICS = [
    # 既存...

    # 提案タイプ別の受容率
    MetricSpec("ai_score_accept_rate_30d", "USER", "RATIO", "daily", 30),
    MetricSpec("ai_split_accept_rate_30d", "USER", "RATIO", "daily", 30),
    MetricSpec("ai_tip_accept_rate_30d", "USER", "RATIO", "daily", 30),
    MetricSpec("ai_prep_accept_rate_30d", "USER", "RATIO", "daily", 30),

    # 修正率（適用したうち修正が入った割合）
    MetricSpec("ai_score_modify_rate_30d", "USER", "RATIO", "daily", 30),
    MetricSpec("ai_split_modify_rate_30d", "USER", "RATIO", "daily", 30),

    # 反応速度（提案表示から反応までの中央値）
    MetricSpec("ai_reaction_latency_p50_30d", "USER", "DURATION_MS", "daily", 30),
]
```

#### 計算ロジック追加 (metrics_job.py)
```python
def compute_suggestion_metrics_by_type(conn, user_id: str) -> dict:
    cutoff = now_utc() - timedelta(days=30)

    with conn.cursor() as cur:
        cur.execute("""
            SELECT
                s.type,
                r.reaction,
                COUNT(*) as count
            FROM "AiSuggestionReaction" r
            JOIN "AiSuggestion" s ON r."suggestionId" = s.id
            WHERE r."userId" = %s AND r."createdAt" >= %s
            GROUP BY s.type, r.reaction
        """, (user_id, cutoff))

        rows = cur.fetchall()

    # タイプ別に集計
    by_type = {}
    for suggestion_type, reaction, count in rows:
        if suggestion_type not in by_type:
            by_type[suggestion_type] = {'viewed': 0, 'accepted': 0, 'modified': 0, 'rejected': 0, 'ignored': 0}
        by_type[suggestion_type][reaction.lower()] = count

    # 受容率 = (accepted + modified) / viewed
    results = {}
    for stype, counts in by_type.items():
        viewed = counts['viewed']
        if viewed > 0:
            accept_rate = (counts['accepted'] + counts['modified']) / viewed
            modify_rate = counts['modified'] / (counts['accepted'] + counts['modified']) if (counts['accepted'] + counts['modified']) > 0 else 0
            results[f'ai_{stype.lower()}_accept_rate_30d'] = accept_rate
            results[f'ai_{stype.lower()}_modify_rate_30d'] = modify_rate

    return results
```

---

### Phase 3: 即時フィードバック

日次バッチだけでなく、反応があったらすぐにMemoryClaimを更新する。

#### API: `/api/ai/reaction`
```typescript
// app/api/ai/reaction/route.ts
export async function POST(request: Request) {
  const { suggestionId, reaction, context, modification, viewedAt, reactedAt } = await request.json();

  // 1. AiSuggestionReaction を記録
  await prisma.aiSuggestionReaction.create({
    data: {
      suggestionId,
      reaction,
      taskType: context?.taskType,
      taskPoints: context?.taskPoints,
      hourOfDay: context?.hourOfDay,
      dayOfWeek: context?.dayOfWeek,
      wipCount: context?.wipCount,
      flowState: context?.flowState,
      modification,
      viewedAt: viewedAt ? new Date(viewedAt) : null,
      reactedAt: reactedAt ? new Date(reactedAt) : null,
      latencyMs: viewedAt && reactedAt
        ? new Date(reactedAt).getTime() - new Date(viewedAt).getTime()
        : null,
      userId,
      workspaceId,
    },
  });

  // 2. 即時でMemoryClaimをEMA更新（オプション）
  if (reaction !== 'VIEWED') {
    await updateAcceptRateEMA(userId, suggestion.type, reaction);
  }

  return ok({ recorded: true });
}

async function updateAcceptRateEMA(userId: string, suggestionType: string, reaction: string) {
  const typeKey = `ai_${suggestionType.toLowerCase()}_accept_rate_30d`;
  const memoryType = await prisma.memoryType.findFirst({ where: { key: typeKey, scope: 'USER' } });
  if (!memoryType) return;

  const claim = await prisma.memoryClaim.findFirst({
    where: { typeId: memoryType.id, userId, status: 'ACTIVE' },
  });

  const alpha = 1 - Math.pow(2, -1 / (memoryType.decayDays || 30));
  const newValue = (reaction === 'ACCEPTED' || reaction === 'MODIFIED') ? 1 : 0;
  const prevValue = claim?.valueNum ?? 0.5; // 初期値は50%
  const nextValue = alpha * newValue + (1 - alpha) * prevValue;

  if (claim) {
    await prisma.memoryClaim.update({
      where: { id: claim.id },
      data: { valueNum: nextValue, updatedAt: new Date() },
    });
  } else {
    await prisma.memoryClaim.create({
      data: {
        typeId: memoryType.id,
        userId,
        valueNum: nextValue,
        source: 'INFERRED',
        status: 'ACTIVE',
      },
    });
  }
}
```

---

### Phase 4: 提案への反映

学習した受容率を「先回り」の判断に使う。

#### 例: 自動表示の判断
```typescript
// lib/ai-proactive.ts
export async function shouldShowSuggestionAutomatically(
  userId: string,
  suggestionType: 'SCORE' | 'SPLIT' | 'TIP',
  context: { taskPoints: number; flowState: number }
): Promise<boolean> {
  const acceptRate = await getAcceptRate(userId, suggestionType);

  // 受容率が低い（< 30%）なら自動表示しない
  if (acceptRate < 0.3) return false;

  // SPLITは8pt以上のタスクのみ
  if (suggestionType === 'SPLIT' && context.taskPoints < 8) return false;

  // flow_stateが低い（詰まってる）時はTIPを優先
  if (context.flowState < 0.3 && suggestionType !== 'TIP') return false;

  return true;
}
```

#### 例: 提案の優先順位
```typescript
// 受容率が高い提案タイプを優先して表示
const suggestionPriority = await Promise.all([
  getAcceptRate(userId, 'SCORE'),
  getAcceptRate(userId, 'SPLIT'),
  getAcceptRate(userId, 'TIP'),
]).then(([score, split, tip]) => {
  return [
    { type: 'SCORE', rate: score },
    { type: 'SPLIT', rate: split },
    { type: 'TIP', rate: tip },
  ].sort((a, b) => b.rate - a.rate);
});
```

---

## 実装順序

### Step 1: データ基盤（今すぐ）
1. `AiSuggestionReaction` テーブル追加
2. `/api/ai/reaction` API追加
3. フロントエンドでVIEWED/ACCEPTED/REJECTEDを送信

### Step 2: メトリクス拡張（1週間以内）
1. タイプ別受容率のMemoryType追加
2. `metrics_job.py` にタイプ別計算を追加
3. 即時EMA更新をAPI側に実装

### Step 3: 先回りへの反映（2週間以内）
1. 受容率に基づく自動表示判断
2. 提案の優先順位付け
3. 低受容率の提案タイプを抑制

### Step 4: バンディット（将来）
1. コンテキスト特徴量の蓄積
2. Thompson Sampling または LinUCB
3. 安全制約の実装

---

## メトリクス一覧（更新後）

| key | scope | 用途 |
|-----|-------|------|
| ai_score_accept_rate_30d | USER | SCORE提案の受容率 |
| ai_split_accept_rate_30d | USER | SPLIT提案の受容率 |
| ai_tip_accept_rate_30d | USER | TIP提案の受容率 |
| ai_prep_accept_rate_30d | USER | PREP提案の受容率 |
| ai_score_modify_rate_30d | USER | SCORE適用時の修正率 |
| ai_split_modify_rate_30d | USER | SPLIT適用時の修正率 |
| ai_reaction_latency_p50_30d | USER | 反応速度の中央値 |
| ai_trust_state | WORKSPACE | 全体の信頼度（既存） |

---

## Beyond Agency との接続

この学習ループにより:

1. **先回りの精度が上がる**
   - 受容率が高い提案は自動表示
   - 受容率が低い提案はボタン経由のみ

2. **個人最適化が実現する**
   - Aさんは SCORE を好む → SCORE を優先表示
   - Bさんは SPLIT を好む → SPLIT を優先表示

3. **主体性は保持される**
   - 提案は常に「提案」として表示
   - 最終決定権はユーザー
   - 拒否/修正も学習に反映される
