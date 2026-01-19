"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type DropdownItem = {
  label: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
};

type DropdownMenuProps = {
  label: string;
  items: DropdownItem[];
  className?: string;
};

export function DropdownMenu({ label, items, className = "" }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const visibleItems = items.filter((item) => !item.disabled);
  if (visibleItems.length === 0) return null;

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        className={`flex items-center gap-1 border border-slate-200 bg-white px-3 py-1 text-slate-700 transition hover:border-[#2323eb]/50 hover:text-[#2323eb] ${className}`}
        onClick={() => setOpen(!open)}
      >
        {label}
        <ChevronDown size={12} className={`transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-[160px] border border-slate-200 bg-white shadow-lg">
          {visibleItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className="flex w-full items-center px-3 py-2 text-left text-slate-700 transition hover:bg-slate-50 hover:text-[#2323eb] disabled:opacity-50"
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
              disabled={item.loading}
            >
              {item.loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 animate-spin rounded-full border border-slate-300 border-t-[#2323eb]" />
                  {item.label}
                </span>
              ) : (
                item.label
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
