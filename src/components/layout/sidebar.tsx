"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { Avatar } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Package,
  Folder,
  Code,
  Terminal,
  Link as LinkIcon,
  StickyNote,
  Image,
  FileText,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const generalNav = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/assets", icon: Package, label: "All Items" },
  { href: "/collections", icon: Folder, label: "All Collections" },
];

const assetNav = [
  { href: "/assets?type=SNIPPET", icon: Code, label: "Snippets", type: "SNIPPET" },
  { href: "/assets?type=PROMPT", icon: Terminal, label: "Prompts", type: "PROMPT" },
  { href: "/assets?type=LINK", icon: LinkIcon, label: "Links", type: "LINK" },
  { href: "/assets?type=NOTE", icon: StickyNote, label: "Notes", type: "NOTE" },
  { href: "/assets?type=IMAGE", icon: Image, label: "Images", type: "IMAGE" },
  { href: "/assets?type=FILE", icon: FileText, label: "Files", type: "FILE" },
];

function SidebarContent({
  collapsed,
  onToggle,
  user,
}: {
  collapsed: boolean;
  onToggle: () => void;
  user: { name: string; email: string; image?: string | null };
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentType = searchParams.get("type");

  function isActive(href: string, type?: string) {
    if (type) {
      return pathname === "/assets" && currentType === type;
    }
    if (href === "/assets") {
      return pathname === "/assets" && !currentType;
    }
    return pathname === href;
  }

  async function handleSignOut() {
    await signOut();
    router.push("/sign-in");
  }

  return (
    <aside
      className={`${
        collapsed ? "hidden" : "flex"
      } flex-col h-full py-6 bg-surface-container-low contrast-125 w-64 border-r border-white/5 shrink-0 md:flex`}
    >
      {/* Logo */}
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
            <Package className="h-4 w-4" />
          </div>
          <h1 className="text-xl font-black uppercase tracking-tighter text-slate-100">
            Cellar
          </h1>
          <button
            onClick={onToggle}
            className="ml-auto hidden md:flex p-1 text-slate-400 hover:bg-surface-bright hover:text-slate-100 rounded transition-colors"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* General nav */}
      <nav className="flex-1 overflow-y-auto space-y-1">
        <div className="px-4 py-2">
          <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-widest text-outline">
            General
          </p>
          {generalNav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 text-xs font-bold uppercase tracking-tight transition-all duration-150 ${
                  active
                    ? "text-primary bg-primary/10 border-r-2 border-primary"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
                }`}
              >
                <item.icon className="h-[18px] w-[18px]" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Assets nav */}
        <div className="px-4 py-2 mt-4">
          <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-widest text-outline">
            Assets
          </p>
          {assetNav.map((item) => {
            const active = isActive(item.href, item.type);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 text-xs font-bold uppercase transition-all ${
                  active
                    ? "text-primary bg-primary/10 border-r-2 border-primary"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
                }`}
              >
                <item.icon className="h-[18px] w-[18px]" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="px-4 mt-auto">
        <div className="border-t border-white/5 pt-3 mb-2 px-4">
          <Link
            href="/settings"
            className={`flex items-center gap-3 py-2 text-xs font-bold uppercase transition-all ${
              pathname === "/settings"
                ? "text-primary"
                : "text-slate-400 hover:text-slate-100"
            }`}
          >
            <Settings className="h-[18px] w-[18px]" />
            <span>Settings</span>
          </Link>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 bg-surface-container rounded-lg">
          <Avatar src={user.image} name={user.name} size="sm" />
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-xs font-bold text-slate-100">
              {user.name}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="text-slate-400 hover:text-error transition-colors"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export function Sidebar({
  collapsed,
  onToggle,
  user,
}: {
  collapsed: boolean;
  onToggle: () => void;
  user: { name: string; email: string; image?: string | null };
}) {
  return (
    <Suspense fallback={null}>
      <SidebarContent collapsed={collapsed} onToggle={onToggle} user={user} />
    </Suspense>
  );
}

export function SidebarCollapsedToggle({ onToggle }: { onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="hidden md:flex p-2 text-slate-400 hover:bg-surface-bright hover:text-slate-100 rounded transition-colors"
    >
      <PanelLeftOpen className="h-5 w-5" />
    </button>
  );
}
