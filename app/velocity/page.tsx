import { Sidebar } from "../components/sidebar";

const velocityHistory = [
  { name: "Sprint-10", points: 22, range: "20-26" },
  { name: "Sprint-11", points: 24, range: "21-27" },
  { name: "Sprint-12", points: 23, range: "21-25" },
];

export default function VelocityPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-10 lg:px-6 lg:py-14">
      <Sidebar splitThreshold={8} />
      <main className="flex-1 space-y-6">
        <header className="border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
                Velocity
              </p>
              <h1 className="text-3xl font-semibold text-slate-900">ベロシティ</h1>
              <p className="text-sm text-slate-600">
                過去スプリントのポイント履歴とレンジを確認（モック）。
              </p>
            </div>
            <span className="border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">
              coming soon
            </span>
          </div>
        </header>

        <section className="border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-3">
            {velocityHistory.map((item) => (
              <div
                key={item.name}
                className="border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800"
              >
                <p className="text-slate-500">{item.name}</p>
                <p className="text-2xl font-semibold text-slate-900">{item.points} pt</p>
                <p className="text-xs text-slate-500">レンジ: {item.range}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
