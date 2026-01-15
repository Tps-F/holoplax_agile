import { Sidebar } from "../components/sidebar";

export default function SettingsPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-10 lg:px-6 lg:py-14">
      <Sidebar splitThreshold={8} />
      <main className="flex-1 space-y-6">
        <header className="border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
                Settings
              </p>
              <h1 className="text-3xl font-semibold text-slate-900">設定</h1>
              <p className="text-sm text-slate-600">
                しきい値、通知、ストレージなどの設定（モック）。
              </p>
            </div>
            <span className="border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">
              coming soon
            </span>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">AI しきい値</h3>
            <p className="text-sm text-slate-600">
              低・中・高の分岐ポイントを設定（現在: 35 / 70）。
            </p>
            <div className="mt-3 flex items-center gap-2 text-sm">
              <input
                type="number"
                defaultValue={35}
                className="w-20 border border-slate-200 px-3 py-2 text-slate-800 outline-none focus:border-[#2323eb]"
              />
              <input
                type="number"
                defaultValue={70}
                className="w-20 border border-slate-200 px-3 py-2 text-slate-800 outline-none focus:border-[#2323eb]"
              />
              <button className="border border-slate-200 bg-slate-50 px-4 py-2 text-slate-700 transition hover:border-[#2323eb]/60 hover:text-[#2323eb]">
                保存
              </button>
            </div>
          </div>

          <div className="border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">通知</h3>
            <p className="text-sm text-slate-600">MVPでは通知オフ。後で Slack/メールを追加。</p>
            <div className="mt-3 flex items-center gap-2 text-sm">
              <button className="border border-slate-200 bg-white px-4 py-2 text-slate-700 transition hover:border-[#2323eb]/60 hover:text-[#2323eb]">
                通知を有効化
              </button>
            </div>
          </div>

          <div className="border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">ストレージ</h3>
            <p className="text-sm text-slate-600">MinIO (S3互換) を利用中。後で AWS S3 に切替可。</p>
            <div className="mt-3 flex items-center gap-2 text-sm">
              <button className="border border-slate-200 bg-white px-4 py-2 text-slate-700 transition hover:border-[#2323eb]/60 hover:text-[#2323eb]">
                バケットを確認
              </button>
              <button className="border border-slate-200 bg-white px-4 py-2 text-slate-700 transition hover:border-[#2323eb]/60 hover:text-[#2323eb]">
                接続情報を更新
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
