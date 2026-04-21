import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { HeartPulse } from "lucide-react";
import { ToolShell } from "@/components/ToolShell";
import { RequireAuth } from "@/components/RequireAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/bmi")({
  head: () => ({
    meta: [
      { title: "BMI Calculator — Afriyie Tools" },
      { name: "description", content: "Calculate your Body Mass Index in metric or imperial units." },
      { property: "og:title", content: "BMI Calculator — Afriyie Tools" },
      { property: "og:description", content: "Know your BMI in seconds." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <BmiPage />
    </RequireAuth>
  ),
});

interface BmiResult {
  bmi: number;
  category: string;
  color: string;
}

function classify(bmi: number): { category: string; color: string } {
  if (bmi < 18.5) return { category: "Underweight", color: "text-accent" };
  if (bmi < 25) return { category: "Normal weight", color: "text-primary" };
  if (bmi < 30) return { category: "Overweight", color: "text-accent" };
  return { category: "Obese", color: "text-destructive" };
}

function BmiPage() {
  return (
    <ToolShell title="BMI Checker" description="A quick gauge of your body mass index." Icon={HeartPulse}>
      <Tabs defaultValue="metric">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="metric">Metric</TabsTrigger>
          <TabsTrigger value="imperial">Imperial</TabsTrigger>
        </TabsList>
        <TabsContent value="metric"><MetricForm /></TabsContent>
        <TabsContent value="imperial"><ImperialForm /></TabsContent>
      </Tabs>
    </ToolShell>
  );
}

function ResultCard({ result }: { result: BmiResult | null }) {
  if (!result) {
    return (
      <div className="mt-6 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        Enter your details to see your BMI.
      </div>
    );
  }
  return (
    <div className="mt-6 rounded-xl border border-border bg-muted/40 p-6 text-center">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">Your BMI</div>
      <div className="mt-1 font-display text-5xl font-bold tabular-nums">{result.bmi.toFixed(1)}</div>
      <div className={`mt-2 text-base font-semibold ${result.color}`}>{result.category}</div>
      <p className="mt-3 text-xs text-muted-foreground">
        BMI is a general indicator and not a diagnostic tool. Consult a professional for personal advice.
      </p>
    </div>
  );
}

function MetricForm() {
  const [h, setH] = useState("170");
  const [w, setW] = useState("65");

  const result = useMemo<BmiResult | null>(() => {
    const hn = parseFloat(h);
    const wn = parseFloat(w);
    if (!hn || !wn || hn <= 0 || wn <= 0) return null;
    const bmi = wn / Math.pow(hn / 100, 2);
    if (!isFinite(bmi)) return null;
    return { bmi, ...classify(bmi) };
  }, [h, w]);

  return (
    <div className="space-y-4">
      <Field label="Height (cm)" value={h} onChange={setH} />
      <Field label="Weight (kg)" value={w} onChange={setW} />
      <ResultCard result={result} />
    </div>
  );
}

function ImperialForm() {
  const [ft, setFt] = useState("5");
  const [inch, setInch] = useState("7");
  const [lb, setLb] = useState("145");

  const result = useMemo<BmiResult | null>(() => {
    const f = parseFloat(ft) || 0;
    const i = parseFloat(inch) || 0;
    const p = parseFloat(lb) || 0;
    const totalIn = f * 12 + i;
    if (totalIn <= 0 || p <= 0) return null;
    const bmi = (p / Math.pow(totalIn, 2)) * 703;
    if (!isFinite(bmi)) return null;
    return { bmi, ...classify(bmi) };
  }, [ft, inch, lb]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Height (ft)" value={ft} onChange={setFt} />
        <Field label="Height (in)" value={inch} onChange={setInch} />
      </div>
      <Field label="Weight (lb)" value={lb} onChange={setLb} />
      <ResultCard result={result} />
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode="decimal"
        className="mt-1 h-12 font-mono text-lg"
      />
    </div>
  );
}
