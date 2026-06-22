import { useState } from "react";
  import { NavLink } from "react-router-dom";
  import { useAuth } from "../../context/AuthContext";
  import {
    LayoutDashboard, User, Table2, Bell, CreditCard,
    BookOpen, LogIn, UserPlus, X, Menu, ChevronRight, LogOut, Compass
  } from "lucide-react";

  const navItems = [
    { title: "Dashboard", path: "/", icon: LayoutDashboard },
    { title: "Pelatihan", path: "/pelatihan", icon: BookOpen },
    { title: "Pemagangan", path: "/pemagangan", icon: User },
    { title: "Sertifikasi", path: "/sertifikasi", icon: CreditCard },
    { title: "LPK", path: "/lpk", icon: Table2 },
    { title: "Perusahaan", path: "/perusahaan", icon: User },
    { title: "Job Fair", path: "/jobfair", icon: Bell },
    { title: "Tracer Study", path: "/tracer-study", icon: Compass },
  ];

  const authItems = [
    { title: "Sign In", path: "/sign-in", icon: LogIn },
    { title: "Sign Up", path: "/sign-up", icon: UserPlus },
  ];

  const docsItem = { title: "Documentation", path: "/docs", icon: BookOpen };

  /**
   * NavItem - Item navigasi sidebar menggunakan React Router NavLink
   */
  function NavItem({ item }) {
    const Icon = item.icon;
    return (
      <NavLink
        to={item.path}
        className={({ isActive }) => [
          "flex items-center text-sm font-normal rounded-lg px-3 py-2 cursor-pointer transition-all duration-200 border",
          isActive
            ? "bg-blue-600 text-white to-stone-800 border-stone-900 text-stone-50 shadow-sm"
            : "text-stone-700 hover:bg-stone-100 border-transparent",
        ].join(" ")}
      >
        <Icon className="mr-3 w-4 h-4 flex-shrink-0" />
        {item.title}
      </NavLink>
    );
  }

  /**
   * Sidebar - Komponen navigasi sidebar kiri menggunakan React Router dan Auth Context
   * @param {Object} props
   * @param {function} [props.onClose] - Callback untuk mobile close
   */
  export function Sidebar({ onClose }) {
    const { isAuthenticated, user, logout } = useAuth();

    const handleLogout = async () => {
      await logout();
    };

    return (
      <aside className="w-60 bg-white flex flex-col relative z-10 h-full border-r border-stone-200">
        {/* Brand */}
        <div className="p-6 pb-0 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-stone-900">
            <span className="text-blue-600 font-bold">SIMANDAT </span>
            <span className="text-green-500 font-bold">DISNAKER</span>
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
          {isAuthenticated && navItems.map((item) => (
            <NavItem
              key={item.path}
              item={item}
            />
          ))}

          {/* Auth Section - Hanya tampil jika tidak authenticated */}
          {!isAuthenticated && (
            <div className="pt-4 border-t border-stone-200 mt-4 space-y-1">
              <p className="px-4 text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">
                Auth Pages
              </p>
              {authItems.map((item) => (
                <NavItem
                  key={item.path}
                  item={item}
                />
              ))}
            </div>
          )}

          {/* Docs */}
          {isAuthenticated && (
            <div className="pt-4 border-t border-stone-200 mt-4 space-y-1">
              <NavItem
                item={docsItem}
              />
            </div>
          )}
        </nav>

        {/* User Info & Logout - Tampil jika authenticated */}
        {isAuthenticated && (
          <div className="p-4 border-t border-stone-200 bg-stone-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 flex-1">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900 truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-stone-500 truncate">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </aside>
    );
  }

  /**
   * TopBar - Navbar atas dengan judul halaman, tombol hamburger mobile, dan user info
   */
  export function TopBar({ title, onMenuOpen }) {
    const { user, isAuthenticated, logout } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogout = async () => {
      await logout();
      setShowUserMenu(false);
    };

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
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 text-sm text-stone-700 hover:text-stone-900 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:block">{user.name || 'User'}</span>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-stone-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-stone-200">
                    <p className="font-medium text-stone-900 text-sm">{user.name}</p>
                    <p className="text-xs text-stone-500">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="flex items-center gap-2 text-sm text-stone-700 hover:text-stone-900 transition-colors">
              <div className="w-7 h-7 rounded-full bg-stone-800 text-white flex items-center justify-center text-xs font-semibold">
                A
              </div>
              <span className="hidden sm:block">Guest</span>
            </button>
          )}
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