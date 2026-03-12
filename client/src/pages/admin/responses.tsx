import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Download, FileSpreadsheet, Search, Filter, Database, ArrowUpDown, Globe, ShieldCheck, ShieldAlert, Clock } from "lucide-react";
import type { Respondent } from "@shared/schema";
import { GlassButton } from "@/components/ui/glass-button";

export default function ResponsesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isExporting, setIsExporting] = useState(false);

  const { data: responses, isLoading } = useQuery<Respondent[]>({
    queryKey: ["/api/admin/responses"],
  });

  const { data: projects } = useQuery<any[]>({
    queryKey: ["/api/admin/projects"],
  });

  const { data: suppliers } = useQuery<any[]>({
    queryKey: ["/api/admin/suppliers"],
  });

  const { data: s2sLogs } = useQuery<any[]>({
    queryKey: ["/api/s2s/alerts"], // Reusing security alerts or we could add a dedicated endpoint if needed
    enabled: isExporting, 
  });

  const filteredResponses = responses?.filter((r) => {
    const matchesSearch =
      r.projectCode.toLowerCase().includes(search.toLowerCase()) ||
      (r.supplierCode || "").toLowerCase().includes(search.toLowerCase()) ||
      String(r.id).toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExcelExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch("/api/admin/responses/export-excel");
      if (!response.ok) throw new Error("Export failed");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `OpinionInsights_Analytics_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Excel Export Error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-10 pb-12">
      <div className="flex items-center justify-between gap-4 flex-wrap pb-6 border-b border-slate-200/60">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Respondent Stream</h1>
          <p className="text-sm text-slate-400 mt-1 font-bold">Transaction ledger for all incoming traffic nodes</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search by SID, PID or Hub..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-14 bg-white/40 border-slate-200/60 rounded-2xl backdrop-blur-xl focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-slate-800 placeholder:text-slate-300 font-bold"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-56 h-14 bg-white/40 border-slate-200/60 rounded-2xl backdrop-blur-xl text-slate-600 font-bold px-5 focus:ring-4 focus:ring-primary/5 transition-all">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <SelectValue placeholder="All Status" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-white/90 backdrop-blur-2xl border-slate-200 rounded-2xl p-1 shadow-2xl">
            <SelectItem value="all" className="rounded-xl font-bold text-slate-600 focus:bg-primary focus:text-white transition-colors">All Transitions</SelectItem>
            <SelectItem value="complete" className="rounded-xl font-bold text-slate-600 focus:bg-primary focus:text-white transition-colors">Complete</SelectItem>
            <SelectItem value="terminate" className="rounded-xl font-bold text-slate-600 focus:bg-primary focus:text-white transition-colors">Terminate</SelectItem>
            <SelectItem value="quotafull" className="rounded-xl font-bold text-slate-600 focus:bg-primary focus:text-white transition-colors">Quota Full</SelectItem>
            <SelectItem value="security" className="rounded-xl font-bold text-slate-600 focus:bg-primary focus:text-white transition-colors">Security</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-white/40 border-slate-200/60 rounded-[2.5rem] backdrop-blur-2xl shadow-xl shadow-slate-200/10 overflow-hidden group">
        <CardHeader className="p-8 border-b border-slate-100 flex flex-row items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-xl group-hover:bg-primary/10 transition-colors">
              <Database className="w-4 h-4 text-slate-500 group-hover:text-primary transition-colors" />
            </div>
            <div>
              <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Transaction Registry</CardTitle>
              <CardDescription className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">
                {filteredResponses?.length || 0} Records found in current partition
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <GlassButton
              className="bg-emerald-600 text-white hover:bg-emerald-700 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-emerald-200"
              onClick={handleExcelExport}
              disabled={isExporting}
            >
              <FileSpreadsheet className="h-4 w-4" />
              {isExporting ? 'Preparing...' : 'Export Excel Pro'}
            </GlassButton>
            <GlassButton
              className="bg-slate-800 text-white hover:bg-slate-900 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-slate-200"
              onClick={() => window.open("/api/admin/responses/export", "_blank")}
            >
              <Download className="h-4 w-4" />
              CSV
            </GlassButton>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-2xl bg-slate-50" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-slate-100 bg-slate-50/50">
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 px-4 py-5 h-auto">S-ID</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 px-4 py-5 h-auto">P-ID</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 px-4 py-5 h-auto">HUB</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 px-4 py-5 h-auto">IP-ADDRESS</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 px-4 py-5 h-auto">COUNTRY</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 px-4 py-5 h-auto text-center">S2S-HASH</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 px-4 py-5 h-auto">STATUS</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 px-4 py-5 h-auto">OS/TECH</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 px-4 py-5 h-auto text-center">LOI</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 px-4 py-5 h-auto text-right">TIMESTAMP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100">
                  {filteredResponses?.map((r) => {
                    const getLOI = (start?: string | Date, end?: string | Date | null) => {
                      if (!start || !end) return "—";
                      const s = new Date(start).getTime();
                      const e = new Date(end).getTime();
                      const diff = Math.floor((e - s) / 60000);
                      return `${diff}m`;
                    };

                    const getOS = (ua?: string | null) => {
                      if (!ua) return "Unknown";
                      if (ua.includes("Windows")) return "Windows";
                      if (ua.includes("Mac OS")) return "macOS";
                      if (ua.includes("Linux")) return "Linux";
                      if (ua.includes("Android")) return "Android";
                      if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
                      return "Other";
                    };

                    return (
                      <TableRow key={r.id} className="group hover:bg-slate-50/80 transition-all border-none">
                        <TableCell className="px-4 py-6">
                          <code className="text-[10px] font-mono font-bold text-slate-400">{r.id}</code>
                        </TableCell>
                        <TableCell className="px-4">
                          <span className="font-black text-[12px] text-slate-800 tracking-tight">{r.projectCode}</span>
                        </TableCell>
                        <TableCell className="px-4">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">
                            {r.supplierCode}
                          </span>
                        </TableCell>
                        <TableCell className="px-4">
                          <span className="text-[10px] font-mono font-bold text-slate-400">{r.ipAddress || "0.0.0.0"}</span>
                        </TableCell>
                        <TableCell className="px-4 text-center">
                          <div className="flex items-center gap-1.5">
                            <Globe className="w-3 h-3 text-slate-300" />
                            <span className="text-[10px] font-black text-slate-600 uppercase">{r.countryCode || "GLB"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 text-center">
                          {r.s2sVerified ? (
                            <div className="inline-flex items-center gap-1 text-emerald-500 font-black text-[9px] uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full">
                              <ShieldCheck className="w-3 h-3" />
                              VERIFIED
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1 text-slate-300 font-black text-[9px] uppercase tracking-widest">
                              <ShieldAlert className="w-3 h-3" />
                              UNSET
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="px-4">
                          <StatusBadge status={r.status || "started"} />
                        </TableCell>
                        <TableCell className="px-4">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate max-w-[80px] block">
                            {getOS(r.userAgent)}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 text-center">
                          <div className="flex items-center justify-center gap-1 text-slate-400 font-bold text-[10px]">
                            <Clock className="w-3 h-3" />
                            {getLOI(r.startedAt, r.completedAt)}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 text-right font-bold text-[10px] text-slate-400">
                          {new Date(r.startedAt || Date.now()).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                          })}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {!isLoading && filteredResponses?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center space-y-3 opacity-30">
                          <Database className="w-10 h-10" />
                          <p className="text-sm font-black uppercase tracking-[0.2em]">No Synchronized Records</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
