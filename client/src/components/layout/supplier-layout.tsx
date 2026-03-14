import { SupplierSidebar } from "./supplier-sidebar";
import { useSupplierAuth } from "@/hooks/use-supplier-auth";
import { WavyBackground } from "@/components/ui/wavy-background";

interface SupplierLayoutProps {
  children: React.ReactNode;
}

export function SupplierLayout({ children }: SupplierLayoutProps) {
  const { user } = useSupplierAuth();

  return (
    <div className="flex min-h-screen w-full bg-slate-50 selection:bg-blue-500 selection:text-white font-sans overflow-hidden relative text-slate-900 transition-colors duration-500">
      {/* Animated Wavy Background — fixed, behind everything */}
      <WavyBackground />

      <SupplierSidebar username={user?.username} supplierCode={user?.supplierCode} />

      <div className="flex flex-col flex-1 min-w-0 relative z-10">
        <header className="flex items-center justify-between px-8 py-4 border-b border-slate-200/60 sticky top-0 z-40 bg-white/60 backdrop-blur-xl">
          <div className="flex flex-col">
            <h2 className="text-[9px] font-black text-blue-500/80 uppercase tracking-[0.4em] leading-none mb-1 shadow-sm">Partner Hub</h2>
            <p className="text-[13px] font-black text-slate-800 capitalize tracking-tight">Supplier Operations</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-white/50 rounded-full border border-slate-200/60">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Status: <span className="text-emerald-500">Live</span></span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

