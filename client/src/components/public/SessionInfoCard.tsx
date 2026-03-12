import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Copy, CheckCircle2 } from "lucide-react";
import { SessionParams } from "@/lib/page-params";
import { Badge } from "@/components/ui/badge";

interface SessionInfoCardProps extends SessionParams {
  accentColor: string;
  statusVariant?: "default" | "destructive" | "outline" | "secondary" | "success" | "warning" | "info";
}

export function SessionInfoCard(props: SessionInfoCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    if (text === "-") return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const statusColors: Record<string, string> = {
    green: "bg-emerald-500",
    red: "bg-rose-500",
    amber: "bg-amber-500",
    yellow: "bg-yellow-500",
    blue: "bg-blue-500",
    grey: "bg-slate-500",
    cyan: "bg-cyan-500",
    orange: "bg-orange-500",
  };

  return (
    <Card className="overflow-hidden border border-white/10 shadow-2xl bg-white/5 backdrop-blur-2xl rounded-3xl text-white">
      <div 
        className="h-1.5 w-full opacity-80" 
        style={{ backgroundColor: props.accentColor }} 
      />
      <div className="p-8 md:p-10">
        <h2 className="text-xl font-semibold mb-8 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: props.accentColor }} />
          Session Insights
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
          <InfoRow 
            label="Project ID" 
            value={props.pid} 
            onCopy={() => handleCopy(props.pid, "pid")}
            isCopied={copiedField === "pid"}
            isMono
          />
          <InfoRow 
            label="Respondent ID" 
            value={props.uid} 
            onCopy={() => handleCopy(props.uid, "uid")}
            isCopied={copiedField === "uid"}
            isMono
          />
          <InfoRow label="IP Address" value={props.ip} isMono />
          <InfoRow label="Country" value={props.country} />
          
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Status</span>
            <div className="flex items-center gap-3 pt-1">
               <div className={`h-2.5 w-2.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)] ${statusColors[props.status.toLowerCase()] || "bg-primary"}`} />
               <span className="text-sm font-medium tracking-wide capitalize">{props.status}</span>
            </div>
          </div>

          <InfoRow label="Entry Time" value={props.entryTime} />
          <InfoRow label="Exit Time" value={props.exitTime} />
          <InfoRow label="Duration" value={props.duration} />
          <InfoRow label="Page Loaded" value={props.currentTime} />
          
          {props.reason !== "-" && (
            <div className="md:col-span-2 p-4 rounded-xl bg-white/[0.03] border border-white/5 mt-2">
               <InfoRow label="Reason Code" value={props.reason} />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function InfoRow({ 
  label, 
  value, 
  onCopy, 
  isCopied, 
  isMono 
}: { 
  label: string; 
  value: string; 
  onCopy?: () => void;
  isCopied?: boolean;
  isMono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 group">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">{label}</span>
        {onCopy && value !== "-" && (
          <button 
            onClick={onCopy}
            className="opacity-0 group-hover:opacity-100 transition-all p-1.5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white"
            title={`Copy ${label}`}
          >
            {isCopied ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />}
          </button>
        )}
      </div>
      <span className={`text-sm font-medium tracking-wide ${isMono ? "font-mono text-white/90" : "text-white/80"}`}>
        {value}
      </span>
    </div>
  );
}

