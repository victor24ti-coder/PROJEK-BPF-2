import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, User, Table2, Bell, CreditCard,
  BookOpen, LogIn, UserPlus, X, Menu, ChevronRight
} from "lucide-react";

const navItems = [
  { title: "Dashboard", path: "/", icon: LayoutDashboard },
  { title: "Pelatihan", path: "/pelatihan", icon: BookOpen },
  { title: "Pemagangan", path: "/pemagangan", icon: User },
  { title: "Sertifikasi", path: "/sertifikasi", icon: CreditCard },
  { title: "LPK", path: "/lpk", icon: Table2 },
  { title: "Perusahaan", path: "/perusahaan", icon: User },
  { title: "Job Fair", path: "/jobfair", icon: Bell },
];

const authItems = [
  { title: "Sign In", path: "/sign-in", icon: LogIn },
  { title: "Sign Up", path: "/sign-up", icon: UserPlus },
];

const docsItem = { title: "Documentation", path: "/docs", icon: BookOpen };

/**
 * NavItem - Item navigasi sidebar menggunakan React Router Link
 */
function NavItem({ item, isActive }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      className={[
        "flex items-center text-sm font-normal rounded-lg px-3 py-2 cursor-pointer transition-all duration-200 border",
        isActive
          ? "bg-blue-600 text-white to-stone-800 border-stone-900 text-stone-50 shadow-sm"
          : "text-stone-700 hover:bg-stone-100 border-transparent",
      ].join(" ")}
    >
      <Icon className="mr-3 w-4 h-4 flex-shrink-0" />
      {item.title}
    </Link>
  );
}

/**
 * Sidebar - Komponen navigasi sidebar kiri menggunakan React Router
 * @param {Object} props
 * @param {function} [props.onClose] - Callback untuk mobile close
 */
export function Sidebar({ onClose }) {
  const location = useLocation();

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
            key={item.path}
            item={item}
            isActive={location.pathname === item.path}
          />
        ))}

        {/* Auth Section */}
        <div className="pt-4 border-t border-stone-200 mt-4 space-y-1">
          <p className="px-4 text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">
            Auth Pages
          </p>
          {authItems.map((item) => (
            <NavItem
              key={item.path}
              item={item}
              isActive={location.pathname === item.path}
            />
          ))}
        </div>

        {/* Docs */}
        <div className="pt-4 border-t border-stone-200 mt-4 space-y-1">
          <NavItem
            item={docsItem}
            isActive={location.pathname === docsItem.path}
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
 * MobileOverlay - Overlay sidebar untuk mobile dengan React Router
 */
export function MobileOverlay({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute left-0 top-0 bottom-0 w-60 shadow-xl">
        <Sidebar onClose={onClose} />
      </div>
    </div>
  );
}