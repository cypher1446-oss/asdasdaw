import { useLocation, Link } from "wouter";
import {
  LayoutDashboard,
  Building2
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", url: "/supplier/dashboard", icon: LayoutDashboard },
  { title: "Project", url: "/supplier/projects", icon: Building2 },
];

export function SupplierSidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-[200px] border-r border-slate-200 bg-white flex flex-col h-full sticky top-[60px] z-40 shrink-0">
      <div className="px-4 py-4">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">NAVIGATION</span>
      </div>

      <nav className="flex-1 px-0 space-y-0 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location === item.url;
          return (
            <Link
              key={item.title}
              href={item.url}
              className={cn(
                "flex items-center gap-4 px-6 py-3 text-[14px] font-medium transition-all duration-200 group relative",
                isActive
                  ? "text-[#007bff] bg-[#f4f7f6]"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5",
                isActive ? "text-[#007bff]" : "text-slate-400 group-hover:text-slate-600"
              )} />
              <span>{item.title}</span>
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#007bff]" />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
