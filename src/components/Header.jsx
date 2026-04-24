import { Search, Bell } from "lucide-react";

export default function Header() {
  return (
   <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
      
      {/* Search */}
      <div className="flex items-center gap-2 border rounded-lg px-3 py-2 w-64">
        <Search size={14} className="text-slate-400" />
        <input
          placeholder="Cari data pelatihan..."
          className="outline-none w-full text-sm"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        
        <Bell className="text-slate-500" />

        <img
          src="https://randomuser.me/api/portraits/men/32.jpg"
          className="w-8 h-8 rounded-full"
        />

      </div>
    </header>
  );
}