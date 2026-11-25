"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// tab-bar from DESIGN.md: surface, 1 px border on top, four tabs with 24 px line icons and text.
// The active tab is primary with a 3 px stroke above the icon and aria-current="page".

const iconProps = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

const TABS: { href: string; label: string; icon: ReactNode }[] = [
  {
    href: "/uke",
    label: "Uke",
    icon: (
      <svg {...iconProps}>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </svg>
    ),
  },
  {
    href: "/coach",
    label: "Coach",
    icon: (
      <svg {...iconProps}>
        <path d="M21 12a8 8 0 0 1-11.7 7.1L4 20.5l1.4-4.6A8 8 0 1 1 21 12z" />
      </svg>
    ),
  },
  {
    href: "/historikk",
    label: "Historikk",
    icon: (
      <svg {...iconProps}>
        <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
        <path d="M3 3v5h5M12 7v5l3 2" />
      </svg>
    ),
  },
  {
    href: "/profil",
    label: "Profil",
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </svg>
    ),
  },
];

export function TabBar() {
  const pathname = usePathname();
  return (
    <nav aria-label="Hovedmeny" className="sticky bottom-0 border-t border-border bg-surface">
      <ul className="mx-auto flex min-h-tap-button max-w-content">
        {TABS.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="flex min-w-0 flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative flex min-h-tap-min min-w-0 flex-1 flex-col items-center justify-start gap-1 px-1 py-2 text-center text-label hyphens-auto [overflow-wrap:anywhere] ${
                  active ? "text-primary" : "text-text-muted"
                }`}
              >
                {active ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-[30%] top-0 h-[3px] rounded-b-[3px] bg-primary"
                  />
                ) : null}
                {icon}
                <span className="max-w-full">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
