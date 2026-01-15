"use client";

import { useCallback, useEffect, useState } from "react";
import { Sidebar } from "../components/sidebar";

export default function SettingsPage() {
  const [low, setLow] = useState(35);
  const [high, setHigh] = useState(70);
  const [notifications, setNotifications] = useState(false);
  const [dirty, setDirty] = useState(false);

  const fetchThresholds = useCallback(async () => {
    const res = await fetch("/api/automation");
    const data = await res.json();
    setLow(data.low ?? 35);
    setHigh(data.high ?? 70);
    setDirty(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchThresholds();
  }, [fetchThresholds]);

  const saveThresholds = async () => {
    await fetch("/api/automation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ low, high }),
    });
    setDirty(false);
  };

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
                低・中・高の分岐ポイントを設定（現在: {low} / {high}）。
              </p>
              <div className="mt-3 flex items-center gap-2 text-sm">
                <input
                  type="number"
                  value={low}
                  onChange={(e) => {
                    setLow(Number(e.target.value) || 0);
                    setDirty(true);
                  }}
                  className="w-20 border border-slate-200 px-3 py-2 text-slate-800 outline-none focus:border-[#2323eb]"
                />
                <input
                  type="number"
                  value={high}
                  onChange={(e) => {
                    setHigh(Number(e.target.value) || 0);
                    setDirty(true);
                  }}
                  className="w-20 border border-slate-200 px-3 py-2 text-slate-800 outline-none focus:border-[#2323eb]"
                />
                <button
                  onClick={saveThresholds}
                  disabled={!dirty}
                  className="border border-slate-200 bg-slate-50 px-4 py-2 text-slate-700 transition hover:border-[#2323eb]/60 hover:text-[#2323eb] disabled:opacity-50"
                >
                  保存
                </button>
              </div>
            </div>

          <div className="border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">通知</h3>
            <p className="text-sm text-slate-600">MVPでは通知オフ。後で Slack/メールを追加。</p>
            <div className="mt-3 flex items-center gap-2 text-sm">
              <button
                onClick={() => setNotifications((v) => !v)}
                className="border border-slate-200 bg-white px-4 py-2 text-slate-700 transition hover:border-[#2323eb]/60 hover:text-[#2323eb]"
              >
                通知を{notifications ? "無効化" : "有効化"}
              </button>
              <span className="text-xs text-slate-600">
                現在: {notifications ? "オン" : "オフ"}
              </span>
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
