import { useState } from "react";
import {
  LayoutDashboard, User, Table2, Bell, CreditCard,
  BookOpen, LogIn, UserPlus, X, Menu, ChevronRight
} from "lucide-react";

const navItems = [
  { title: "Dashboard", href: "#dashboard", icon: LayoutDashboard },
  { title: "Pelatihan", href: "#pelatihan", icon: BookOpen },
  { title: "Pemagangan", href: "#pemagangan", icon: User },
  { title: "Sertifikasi", href: "#sertifikasi", icon: CreditCard },
  { title: "LPK", href: "#lpk", icon: Table2 },
  { title: "Perusahaan", href: "#perusahaan", icon: User },
  { title: "Job Fair", href: "#jobfair", icon: Bell },
];

const authItems = [
  { title: "Sign In", href: "#sign-in", icon: LogIn },
  { title: "Sign Up", href: "#sign-up", icon: UserPlus },
];

const docsItem = { title: "Documentation", href: "#docs", icon: BookOpen };

/**
 * NavItem - Item navigasi sidebar
 */
function NavItem({ item, isActive, onClick }) {
  const Icon = item.icon;
  return (
    <a
      href={item.href}
      onClick={(e) => { e.preventDefault(); onClick && onClick(item.href); }}
      className={[
        "flex items-center text-sm font-normal rounded-lg px-3 py-2 cursor-pointer transition-all duration-200 border",
        isActive
          ? "bg-blue-600 text-white to-stone-800 border-stone-900 text-stone-50 shadow-sm"
          : "text-stone-700 hover:bg-stone-100 border-transparent",
      ].join(" ")}
    >
      <Icon className="mr-3 w-4 h-4 flex-shrink-0" />
      {item.title}
    </a>
  );
}

/**
 * Sidebar - Komponen navigasi sidebar kiri
 * @param {Object} props
 * @param {function} [props.onClose] - Callback untuk mobile close
 * @param {string} props.activePath - Path aktif saat ini
 * @param {function} props.onNavigate - Callback navigasi
 */
export function Sidebar({ onClose, activePath, onNavigate }) {
  return (
    <aside className="w-60 bg-white flex flex-col relative z-10 h-full border-r border-stone-200">
      {/* Brand */}
      <div className="p-6 pb-0 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-stone-900">
          <span className="text-blue-600 font-bold">SIMANDAT </span>
          <span className="text-green-500 font-bold">DISNAKER</span>{" "}
          </h1>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            isActive={activePath === item.href}
            onClick={onNavigate}
          />
        ))}

        {/* Auth Section */}
        <div className="pt-4 border-t border-stone-200 mt-4 space-y-1">
          <p className="px-4 text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">
            Auth Pages
          </p>
          {authItems.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              isActive={activePath === item.href}
              onClick={onNavigate}
            />
          ))}
        </div>

        {/* Docs */}
        <div className="pt-4 border-t border-stone-200 mt-4 space-y-1">
          <NavItem
            item={docsItem}
            isActive={activePath === docsItem.href}
            onClick={onNavigate}
          />
        </div>
      </nav>
    </aside>
  );
}

/**
 * TopBar - Navbar atas dengan judul halaman dan tombol hamburger mobile
 */
export function TopBar({ title, onMenuOpen }) {
  return (
    <header className="h-14 bg-white/80 backdrop-blur-sm border-b border-stone-200 px-4 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuOpen}
          className="lg:hidden p-1 hover:bg-stone-100 rounded-md text-stone-600"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-1 text-sm text-stone-500">
          <span>Pages</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-stone-900 font-medium">{title}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 text-sm text-stone-700 hover:text-stone-900 transition-colors">
          <div className="w-7 h-7 rounded-full bg-stone-800 text-white flex items-center justify-center text-xs font-semibold">
            A
          </div>
          <span className="hidden sm:block">Admin</span>
        </button>
        <Bell className="w-4 h-4 text-stone-500 cursor-pointer hover:text-stone-900 transition-colors" />
      </div>
    </header>
  );
}

/**
 * MobileOverlay - Overlay sidebar untuk mobile
 */
export function MobileOverlay({ isOpen, onClose, activePath, onNavigate }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute left-0 top-0 bottom-0 w-60 shadow-xl">
        <Sidebar onClose={onClose} activePath={activePath} onNavigate={(href) => { onNavigate(href); onClose(); }} />
      </div>
    </div>
  );
}