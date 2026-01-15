import Image from "next/image";
import Link from "next/link";
import {
  BarChart3,
  Inbox,
  KanbanSquare,
  LayoutDashboard,
  Settings,
  Zap,
} from "lucide-react";

export const navItems = [
  { label: "ダッシュボード", href: "/", icon: LayoutDashboard },
  { label: "バックログ", href: "/backlog", icon: Inbox },
  { label: "スプリント", href: "/sprint", icon: KanbanSquare },
  { label: "ベロシティ", href: "/velocity", icon: BarChart3 },
  { label: "自動化", href: "/automation", icon: Zap },
  { label: "設定", href: "/settings", icon: Settings },
];

type SidebarProps = {
  splitThreshold?: number;
};

export function Sidebar({ splitThreshold }: SidebarProps) {
  return (
    <aside className="sticky top-0 hidden min-h-screen w-60 flex-col border border-slate-200 bg-white p-4 shadow-sm lg:flex">
      <div className="border-b border-slate-200 pb-4">
        <Image
          src="/logo_holoplax.png"
          alt="Holoplax logo"
          width={180}
          height={56}
          className="h-auto w-full"
          priority
        />
      </div>
      <nav className="mt-4 flex flex-col gap-1">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-2 border border-transparent px-3 py-2 text-sm text-slate-700 transition hover:border-[#2323eb]/40 hover:bg-[#2323eb]/10 hover:text-[#2323eb]"
          >
            <item.icon size={16} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      {splitThreshold ? (
        <div className="mt-auto border-t border-slate-200 pt-4 text-xs text-slate-600">
          スプリント上限 <span className="font-semibold">{splitThreshold}pt</span>
        </div>
      ) : null}
    </aside>
  );
}
