import { Sidebar } from "../components/sidebar";

const rules = [
  { name: "低スコア自動委任", range: "< 35", status: "On" },
  { name: "中スコア分解提案", range: "35-70", status: "On" },
  { name: "高スコア分割必須", range: "> 70", status: "On" },
];

export default function AutomationPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-10 lg:px-6 lg:py-14">
      <Sidebar splitThreshold={8} />
      <main className="flex-1 space-y-6">
        <header className="border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
                Automation
              </p>
              <h1 className="text-3xl font-semibold text-slate-900">自動化</h1>
              <p className="text-sm text-slate-600">
                スコアしきい値ごとの挙動を管理（モック）。MVPでは固定ルール。
              </p>
            </div>
            <button className="border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 transition hover:border-[#2323eb]/60 hover:text-[#2323eb]">
              しきい値を編集
            </button>
          </div>
        </header>

        <section className="border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-3">
            {rules.map((rule) => (
              <div
                key={rule.name}
                className="border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800"
              >
                <p className="text-slate-500">{rule.name}</p>
                <p className="text-xl font-semibold text-slate-900">{rule.range}</p>
                <p className="text-xs text-slate-600">ステータス: {rule.status}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
