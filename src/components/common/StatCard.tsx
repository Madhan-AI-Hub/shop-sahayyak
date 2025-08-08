import { ReactNode } from "react";

export default function StatCard({ title, value, subtitle, tone = "default" }: { title: string; value: ReactNode; subtitle?: string; tone?: "default" | "success" | "danger" }) {
  const toneClasses =
    tone === "success" ? "border-accent/40" : tone === "danger" ? "border-destructive/40" : "border-border";
  return (
    <div className={`rounded-lg border ${toneClasses} p-4 shadow-sm bg-card`}> 
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
      {subtitle && <div className="mt-1 text-xs text-muted-foreground">{subtitle}</div>}
    </div>
  );
}
