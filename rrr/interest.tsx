import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PiggyBank } from "lucide-react";
import { ToolShell } from "@/components/ToolShell";
import { RequireAuth } from "@/components/RequireAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/interest")({
  head: () => ({
    meta: [
      { title: "Simple Interest Calculator — Afriyie Tools" },
      { name: "description", content: "Calculate simple interest, total amount, and growth in any currency." },
      { property: "og:title", content: "Simple Interest Calculator — Afriyie Tools" },
      { property: "og:description", content: "Compute interest, total and growth in seconds." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <InterestPage />
    </RequireAuth>
  ),
});

const CURRENCIES = [
  { code: "USD", symbol: "$", label: "USD — US Dollar" },
  { code: "EUR", symbol: "€", label: "EUR — Euro" },
  { code: "GBP", symbol: "£", label: "GBP — British Pound" },
  { code: "GHS", symbol: "₵", label: "GHS — Ghanaian Cedi" },
  { code: "NGN", symbol: "₦", label: "NGN — Nigerian Naira" },
  { code: "ZAR", symbol: "R", label: "ZAR — South African Rand" },
  { code: "JPY", symbol: "¥", label: "JPY — Japanese Yen" },
  { code: "INR", symbol: "₹", label: "INR — Indian Rupee" },
  { code: "CAD", symbol: "C$", label: "CAD — Canadian Dollar" },
  { code: "AUD", symbol: "A$", label: "AUD — Australian Dollar" },
] as const;

function format(n: number) {
  if (!isFinite(n)) return "—";
  return n.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}

function InterestPage() {
  const [principal, setPrincipal] = useState("1000");
  const [rate, setRate] = useState("5");
  const [time, setTime] = useState("3");
  const [unit, setUnit] = useState<"years" | "months">("years");
  const [currency, setCurrency] = useState<string>("USD");

  const symbol = CURRENCIES.find((c) => c.code === currency)?.symbol ?? "$";

  const { interest, total, valid } = useMemo(() => {
    const p = parseFloat(principal);
    const r = parseFloat(rate);
    const t = parseFloat(time);
    if (isNaN(p) || isNaN(r) || isNaN(t) || p < 0 || r < 0 || t < 0) {
      return { interest: 0, total: 0, valid: false };
    }
    const years = unit === "years" ? t : t / 12;
    const interest = (p * r * years) / 100;
    return { interest, total: p + interest, valid: true };
  }, [principal, rate, time, unit]);

  return (
    <ToolShell title="Simple Interest" description="Calculate interest using P × R × T ÷ 100." Icon={PiggyBank}>
      <div className="space-y-4">
        <div>
          <Label className="text-xs text-muted-foreground">Currency</Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="mt-1 h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  <span className="font-mono mr-2">{c.symbol}</span>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Field label="Principal amount" value={principal} onChange={setPrincipal} prefix={symbol} />
        <Field label="Annual rate (%)" value={rate} onChange={setRate} suffix="%" />
        <div>
          <Label className="text-xs text-muted-foreground">Time period</Label>
          <div className="mt-1 grid grid-cols-[1fr_auto] gap-2">
            <Input
              value={time}
              onChange={(e) => setTime(e.target.value)}
              inputMode="decimal"
              className="h-12 font-mono text-lg"
            />
            <Select value={unit} onValueChange={(v) => setUnit(v as "years" | "months")}>
              <SelectTrigger className="h-12 min-w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="years">Years</SelectItem>
                <SelectItem value="months">Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <ResultBox label="Interest earned" value={valid ? format(interest) : "—"} prefix={symbol} highlight />
          <ResultBox label="Total amount" value={valid ? format(total) : "—"} prefix={symbol} />
        </div>

        <p className="text-xs text-muted-foreground pt-2">
          Formula: <span className="font-mono">Interest = P × R × T ÷ 100</span>
        </p>
      </div>
    </ToolShell>
  );
}

function Field({
  label,
  value,
  onChange,
  prefix,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="mt-1 relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">{prefix}</span>
        )}
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          inputMode="decimal"
          className={`h-12 font-mono text-lg ${prefix ? "pl-9" : ""} ${suffix ? "pr-8" : ""}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{suffix}</span>
        )}
      </div>
    </div>
  );
}

function ResultBox({ label, value, prefix, highlight }: { label: string; value: string; prefix?: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-xl border p-4 ${highlight ? "border-transparent text-primary-foreground shadow-[var(--shadow-elevated)]" : "border-border bg-muted/40"}`}
      style={highlight ? { background: "var(--gradient-brand)" } : undefined}
    >
      <div className={`text-xs ${highlight ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{label}</div>
      <div className="mt-1 font-display text-2xl font-bold tabular-nums">
        {prefix && <span className="opacity-70 mr-1">{prefix}</span>}
        {value}
      </div>
    </div>
  );
}
