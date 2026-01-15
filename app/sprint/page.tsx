import { Sidebar } from "../components/sidebar";

const sprintItems = [
  { title: "自動化ルールの整理", points: 5, status: "Planned" },
  { title: "分解UIの調整", points: 3, status: "Planned" },
  { title: "ベロシティカードの実データ接続", points: 2, status: "Ready" },
];

export default function SprintPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-10 lg:px-6 lg:py-14">
      <Sidebar splitThreshold={8} />
      <main className="flex-1 space-y-6">
        <header className="border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
                Sprint
              </p>
              <h1 className="text-3xl font-semibold text-slate-900">スプリント</h1>
              <p className="text-sm text-slate-600">
                キャパはポイントベース（例: 24pt）。バックログから選んでコミットするモック。
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="border border-slate-200 bg-slate-50 px-3 py-1 text-slate-700">
                キャパ 24 pt
              </span>
              <button className="bg-[#2323eb] px-4 py-2 text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-[#2323eb]/30">
                スプリント開始
              </button>
            </div>
          </div>
        </header>

        <section className="border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-3">
            {sprintItems.map((item) => (
              <div
                key={item.title}
                className="flex items-center justify-between border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800"
              >
                <div>
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-600">ステータス: {item.status}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700">
                    {item.points} pt
                  </span>
                  <button className="border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 transition hover:border-[#2323eb]/50 hover:text-[#2323eb]">
                    外す
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
