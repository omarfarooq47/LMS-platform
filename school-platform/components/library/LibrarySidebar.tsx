"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, BookMarked, Library, BookCopy } from "lucide-react";

const NAV_ITEMS = [
  {
    href: "/library/subscriptions",
    label: "Current Subscriptions",
    icon: BookMarked,
  },
  {
    href: "/library/borrow",
    label: "Borrow",
    icon: BookCopy,
  },
  {
    href: "/library/my-books",
    label: "My Books",
    icon: Library,
  },
];

export function LibrarySidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-60 shrink-0">
      <nav className="bg-card border border-border rounded-2xl p-2 shadow-sm">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-3 py-2 flex items-center gap-2">
          <BookOpen className="size-3.5" />
          Library
        </p>
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
