# Discord Bot Integration (LLM task watcher)

## 概要
- 特定のチャンネルに投稿されたメッセージを監視
- LLM (GPT-4o-mini) でタスクかどうかを判定
- タスクと判定された場合のみ、Holoplax の「未分類メモ」(IntakeItem) に自動登録

## 必要な環境変数

### Bot 側
- `DISCORD_BOT_TOKEN`：Bot トークン
- `DISCORD_WATCH_CHANNEL_ID`：監視対象のチャンネルID
- `DISCORD_INTEGRATION_TOKEN`：共有トークン（Next/API と Bot で一致させる）
- `DISCORD_INTEGRATION_URL`：API URL（例: http://localhost:3000/api/integrations/discord）
- `OPENAI_API_KEY`：OpenAI API キー（タスク判定用）

### Next.js 側
- `DISCORD_INTEGRATION_TOKEN`：共有トークン
- `DISCORD_WORKSPACE_ID`：タスクを入れるワークスペース

## 動作の流れ

1. 監視チャンネルにメッセージが投稿される
2. Bot が OpenAI API でメッセージを分析
3. タスクと判定された場合:
   - 📝 リアクションを付与
   - IntakeItem (未分類メモ) として保存
4. タスクではないと判定された場合:
   - ログに `[Skip]` と出力して無視

## Bot の実行
```bash
# 依存インストール
npm install discord.js

# 起動
node scripts/discord-bot.js
```

## Discord Developer Portal での設定

1. [Discord Developer Portal](https://discord.com/developers/applications) で Bot を作成
2. **Bot** タブで以下を有効化：
   - `MESSAGE CONTENT INTENT` (必須)
3. **OAuth2 > URL Generator** で以下を選択：
   - Scopes: `bot`
   - Bot Permissions: `Read Messages/View Channels`, `Send Messages`, `Add Reactions`
4. 生成された URL でサーバーに Bot を招待

## リアクションの意味
- 📝 タスクとして登録された
- ❌ エラーが発生した
- (無反応) タスクではないと判定された

## 注意
- `MESSAGE CONTENT INTENT` が有効でないとメッセージ内容を取得できません
- OpenAI API の利用料金がかかります（1メッセージあたり約0.001円）
- 監視チャンネルは専用チャンネル（例: `#task-inbox`）を推奨
