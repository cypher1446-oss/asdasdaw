import { useQuery } from "@tanstack/react-query";
import { SupplierLayout } from "@/components/layout/supplier-layout";
import {
  CloudDownload,
  CloudUpload,
  Search,
  RotateCcw,
  Building2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";
import type { Respondent, DashboardStats } from "@shared/schema";
import { cn } from "@/lib/utils";

interface SupplierDashboardData extends DashboardStats {
  assignedProjects: Array<{
    id: string;
    projectCode: string;
    projectName: string;
    supplierLink: string;
    status: string;
  }>;
}

export default function SupplierDashboardPage() {
  const [pidSearch, setPidSearch] = useState("");
  const [ridSearch, setRidSearch] = useState("");
  const [ipSearch, setIpSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState("25");

  const { data: stats } = useQuery<SupplierDashboardData>({
    queryKey: ["/api/supplier/dashboard"],
    refetchInterval: 30000,
  });

  const { data: responses } = useQuery<Respondent[]>({
    queryKey: ["/api/supplier/responses"],
    refetchInterval: 30000,
  });

  const countryMap: Record<string, string> = {
    "US": "United States",
    "GB": "United Kingdom",
    "IN": "India",
    "DE": "Germany",
    "FR": "France",
    "CA": "Canada",
    "AU": "Australia",
    "BR": "Brazil",
    "JP": "Japan"
  };

  const responsesList = Array.isArray(responses) ? responses : [];

  const filteredResponses = useMemo(() => {
    if (!responsesList.length) return [];
    return responsesList.filter((r) => {
      const matchesPid = r.projectCode.toLowerCase().includes(pidSearch.toLowerCase());
      const matchesRid = (r.supplierRid || "").toLowerCase().includes(ridSearch.toLowerCase());
      const matchesIp = (r.ipAddress || "").toLowerCase().includes(ipSearch.toLowerCase());
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      return matchesPid && matchesRid && matchesIp && matchesStatus;
    });
  }, [responsesList, pidSearch, ridSearch, ipSearch, statusFilter]);

  const paginatedResponses = useMemo(() => {
    const start = (currentPage - 1) * parseInt(entriesPerPage);
    return filteredResponses.slice(start, start + parseInt(entriesPerPage));
  }, [filteredResponses, currentPage, entriesPerPage]);

  const dashboardStats = stats || {
    totalRespondents: 0,
    completes: 0,
    terminates: 0,
    quotafulls: 0,
    securityTerminates: 0,
    totalProjects: 0,
    activityData: [],
    assignedProjects: [],
  };

  const StatCard = ({ title, value, color, icon: Icon }: any) => (
    <div className="bg-white p-4 flex items-center justify-between shadow-sm border border-slate-200 rounded-sm flex-1">
      <div className={cn("w-14 h-14 rounded-full flex items-center justify-center border-2", {
        "border-green-500 bg-green-50 text-green-500": color === "green",
        "border-orange-400 bg-orange-50 text-orange-400": color === "orange",
        "border-blue-400 bg-blue-50 text-blue-400": color === "blue",
        "border-red-500 bg-red-50 text-red-500": color === "red",
      })}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="text-right">
        <div className="text-[28px] font-normal text-slate-700 leading-none mb-1">{value}</div>
        <div className={cn("text-[14px] font-medium uppercase tracking-tight", {
          "text-green-600": color === "green",
          "text-orange-600": color === "orange",
          "text-blue-600": color === "blue",
          "text-red-600": color === "red",
        })}>{title}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-[24px] font-normal text-slate-700">Today statistics</h2>

      <div className="flex flex-wrap gap-4">
        <StatCard title="Completed" value={dashboardStats.completes} color="green" icon={CloudDownload} />
        <StatCard title="DisQualified" value={dashboardStats.terminates} color="orange" icon={CloudUpload} />
        <StatCard title="Quotafull" value={dashboardStats.quotafulls} color="blue" icon={CloudDownload} />
        <StatCard title="Security Term" value={dashboardStats.securityTerminates} color="red" icon={CloudDownload} />
      </div>

      {/* Filter Section */}
      <Card className="border-none shadow-sm rounded-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Input 
              placeholder="Project ID" 
              value={pidSearch}
              onChange={(e) => setPidSearch(e.target.value)}
              className="bg-white border-slate-200 h-[40px] rounded-sm text-sm"
            />
            <Input 
              placeholder="Respondent ID" 
              value={ridSearch}
              onChange={(e) => setRidSearch(e.target.value)}
              className="bg-white border-slate-200 h-[40px] rounded-sm text-sm"
            />
            <Input 
              placeholder="IP Address" 
              value={ipSearch}
              onChange={(e) => setIpSearch(e.target.value)}
              className="bg-white border-slate-200 h-[40px] rounded-sm text-sm"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-white border-slate-200 h-[40px] rounded-sm text-slate-500 text-sm">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Select Status</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="terminate">Terminate</SelectItem>
                <SelectItem value="quotafull">Quota Full</SelectItem>
                <SelectItem value="started">Started</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button className="bg-[#007bff] hover:bg-[#0069d9] px-6 h-[34px] rounded-sm text-[13px]">Submit</Button>
            <Button 
              variant="outline" 
              className="border-slate-300 text-slate-600 hover:bg-slate-50 px-4 h-[34px] rounded-sm text-[13px] flex items-center gap-2"
              onClick={() => {
                setPidSearch("");
                setRidSearch("");
                setIpSearch("");
                setStatusFilter("all");
              }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table Section */}
      <Card className="border-none shadow-sm rounded-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 flex items-center justify-between bg-white border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Select value={entriesPerPage} onValueChange={setEntriesPerPage}>
                <SelectTrigger className="w-16 h-8 bg-white border-slate-200 text-xs text-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs text-slate-600">entries per page</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 font-medium">Search:</span>
              <Input className="w-[180px] h-8 bg-white border-slate-200 text-xs" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-white border-b border-slate-200">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-[13px] font-bold text-slate-800 h-12 whitespace-nowrap">Project ID</TableHead>
                  <TableHead className="text-[13px] font-bold text-slate-800 h-12 whitespace-nowrap text-center">Parent ID</TableHead>
                  <TableHead className="text-[13px] font-bold text-slate-800 h-12 whitespace-nowrap">Country</TableHead>
                  <TableHead className="text-[13px] font-bold text-slate-800 h-12 whitespace-nowrap">PannellistID</TableHead>
                  <TableHead className="text-[13px] font-bold text-slate-800 h-12 whitespace-nowrap">Respondent ID</TableHead>
                  <TableHead className="text-[13px] font-bold text-slate-800 h-12 whitespace-nowrap text-center">LOI</TableHead>
                  <TableHead className="text-[13px] font-bold text-slate-800 h-12 whitespace-nowrap">Start Time</TableHead>
                  <TableHead className="text-[13px] font-bold text-slate-800 h-12 whitespace-nowrap">End Time</TableHead>
                  <TableHead className="text-[13px] font-bold text-slate-800 h-12 whitespace-nowrap">Start IP</TableHead>
                  <TableHead className="text-[13px] font-bold text-slate-800 h-12 whitespace-nowrap">End IP</TableHead>
                  <TableHead className="text-[13px] font-bold text-slate-800 h-12 whitespace-nowrap text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedResponses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="h-40 text-center text-slate-400 text-sm italic bg-white">
                      No matching records found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedResponses.map((r, i) => {
                    const getLOI = (start?: string | Date, end?: string | Date | null) => {
                      if (!start || !end) return "0";
                      const s = new Date(start).getTime();
                      const e = new Date(end).getTime();
                      return Math.floor((e - s) / 60000);
                    };

                    const statusColors: any = {
                      "complete": "bg-[#6c757d] text-white",
                      "terminate": "bg-[#6c757d] text-white",
                      "quotafull": "bg-[#6c757d] text-white",
                      "security-terminate": "bg-[#f8f9fa] border border-[#f5c6cb] text-[#721c24]",
                      "started": "bg-[#6c757d] text-white"
                    };

                    const statusLabels: any = {
                      "complete": "Redirected",
                      "terminate": "Disqualified",
                      "quotafull": "Quotafull",
                      "security-terminate": "Rejected - failed SECURITY",
                      "started": "Redirected"
                    };

                    return (
                      <TableRow key={r.id} className={cn("border-b border-slate-100 transition-colors", i % 2 === 0 ? "bg-[#f9f9f9]" : "bg-white")}>
                        <TableCell className="py-3 text-[12px] font-normal text-slate-600">{r.projectCode}</TableCell>
                        <TableCell className="py-3 text-[12px] font-normal text-slate-600 text-center">0</TableCell>
                        <TableCell className="py-3 text-[12px] font-normal text-slate-600 truncate max-w-[120px]">
                          {countryMap[r.countryCode || "US"] || r.countryCode || "Global"}
                        </TableCell>
                        <TableCell className="py-3 text-[12px] font-normal text-slate-600">7766{622 - i}</TableCell>
                        <TableCell className="py-3 text-[12px] font-normal text-slate-600 font-mono">{r.supplierRid || "—"}</TableCell>
                        <TableCell className="py-3 text-[12px] font-normal text-slate-600 text-center">{getLOI(r.startedAt, r.completedAt)}</TableCell>
                        <TableCell className="py-3 text-[12px] font-normal text-slate-600 whitespace-nowrap">
                          {r.startedAt ? new Date(r.startedAt).toLocaleString("sv-SE", { hour12: false }).replace("T", " ") : "—"}
                        </TableCell>
                        <TableCell className="py-3 text-[12px] font-normal text-slate-600 whitespace-nowrap">
                          {r.completedAt ? new Date(r.completedAt).toLocaleString("sv-SE", { hour12: false }).replace("T", " ") : "—"}
                        </TableCell>
                        <TableCell className="py-3 text-[12px] font-normal text-slate-600 font-mono whitespace-nowrap">{r.ipAddress || "—"}</TableCell>
                        <TableCell className="py-3 text-[12px] font-normal text-slate-600 font-mono whitespace-nowrap">{r.ipAddress || "—"}</TableCell>
                        <TableCell className="py-3 text-center">
                          <span className={cn("inline-block px-2 py-0.5 rounded-sm text-[10px] uppercase font-bold min-w-[80px]", statusColors[r.status || "started"])}>
                            {statusLabels[r.status || "started"]}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
