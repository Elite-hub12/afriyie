import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Ruler, ArrowRightLeft } from "lucide-react";
import { ToolShell } from "@/components/ToolShell";
import { RequireAuth } from "@/components/RequireAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/units")({
  head: () => ({
    meta: [
      { title: "Unit Converter — Afriyie Tools" },
      { name: "description", content: "Convert length, weight, and temperature instantly." },
      { property: "og:title", content: "Unit Converter — Afriyie Tools" },
      { property: "og:description", content: "Length, weight, and temperature conversions in real time." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <UnitsPage />
    </RequireAuth>
  ),
});

// Length: factor to meters
const LENGTH: Record<string, { label: string; toBase: number }> = {
  mm: { label: "Millimeter (mm)", toBase: 0.001 },
  cm: { label: "Centimeter (cm)", toBase: 0.01 },
  m: { label: "Meter (m)", toBase: 1 },
  km: { label: "Kilometer (km)", toBase: 1000 },
  in: { label: "Inch (in)", toBase: 0.0254 },
  ft: { label: "Foot (ft)", toBase: 0.3048 },
  yd: { label: "Yard (yd)", toBase: 0.9144 },
  mi: { label: "Mile (mi)", toBase: 1609.344 },
};

// Weight: factor to grams
const WEIGHT: Record<string, { label: string; toBase: number }> = {
  mg: { label: "Milligram (mg)", toBase: 0.001 },
  g: { label: "Gram (g)", toBase: 1 },
  kg: { label: "Kilogram (kg)", toBase: 1000 },
  t: { label: "Tonne (t)", toBase: 1_000_000 },
  oz: { label: "Ounce (oz)", toBase: 28.3495 },
  lb: { label: "Pound (lb)", toBase: 453.592 },
};

const TEMP = ["C", "F", "K"] as const;
type TempUnit = (typeof TEMP)[number];

function convertTemp(value: number, from: TempUnit, to: TempUnit) {
  let c: number;
  if (from === "C") c = value;
  else if (from === "F") c = (value - 32) * (5 / 9);
  else c = value - 273.15;
  if (to === "C") return c;
  if (to === "F") return c * (9 / 5) + 32;
  return c + 273.15;
}

function formatNum(n: number) {
  if (!isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (abs !== 0 && (abs < 0.0001 || abs >= 1e9)) return n.toExponential(4);
  return Number(n.toFixed(6)).toString();
}

function UnitsPage() {
  return (
    <ToolShell title="Unit Converter" description="Length, weight & temperature — converted instantly." Icon={Ruler}>
      <Tabs defaultValue="length">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="length">Length</TabsTrigger>
          <TabsTrigger value="weight">Weight</TabsTrigger>
          <TabsTrigger value="temp">Temperature</TabsTrigger>
        </TabsList>

        <TabsContent value="length">
          <FactorConverter map={LENGTH} initialFrom="m" initialTo="ft" />
        </TabsContent>
        <TabsContent value="weight">
          <FactorConverter map={WEIGHT} initialFrom="kg" initialTo="lb" />
        </TabsContent>
        <TabsContent value="temp">
          <TempConverter />
        </TabsContent>
      </Tabs>
    </ToolShell>
  );
}

function FactorConverter({
  map,
  initialFrom,
  initialTo,
}: {
  map: Record<string, { label: string; toBase: number }>;
  initialFrom: string;
  initialTo: string;
}) {
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [value, setValue] = useState("1");

  const result = useMemo(() => {
    const v = parseFloat(value);
    if (isNaN(v)) return "";
    const base = v * map[from].toBase;
    return formatNum(base / map[to].toBase);
  }, [value, from, to, map]);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <div className="space-y-4">
      <Pair label="From" value={value} onValueChange={setValue} unit={from} onUnitChange={setFrom} options={map} />
      <div className="flex justify-center">
        <Button variant="outline" size="icon" onClick={swap} aria-label="Swap units" className="rounded-full">
          <ArrowRightLeft className="h-4 w-4" />
        </Button>
      </div>
      <Pair label="To" value={result} onValueChange={() => {}} unit={to} onUnitChange={setTo} options={map} readOnly />
    </div>
  );
}

function Pair({
  label,
  value,
  onValueChange,
  unit,
  onUnitChange,
  options,
  readOnly,
}: {
  label: string;
  value: string;
  onValueChange: (v: string) => void;
  unit: string;
  onUnitChange: (u: string) => void;
  options: Record<string, { label: string }>;
  readOnly?: boolean;
}) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="mt-1 grid grid-cols-[1fr_auto] gap-2">
        <Input
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          readOnly={readOnly}
          inputMode="decimal"
          className="font-mono text-lg h-12"
        />
        <Select value={unit} onValueChange={onUnitChange}>
          <SelectTrigger className="h-12 min-w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(options).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function TempConverter() {
  const [from, setFrom] = useState<TempUnit>("C");
  const [to, setTo] = useState<TempUnit>("F");
  const [value, setValue] = useState("100");

  const result = useMemo(() => {
    const v = parseFloat(value);
    if (isNaN(v)) return "";
    return formatNum(convertTemp(v, from, to));
  }, [value, from, to]);

  const tempMap = { C: { label: "Celsius (°C)" }, F: { label: "Fahrenheit (°F)" }, K: { label: "Kelvin (K)" } };

  return (
    <div className="space-y-4">
      <Pair label="From" value={value} onValueChange={setValue} unit={from} onUnitChange={(u) => setFrom(u as TempUnit)} options={tempMap} />
      <div className="flex justify-center">
        <Button variant="outline" size="icon" onClick={() => { setFrom(to); setTo(from); }} aria-label="Swap" className="rounded-full">
          <ArrowRightLeft className="h-4 w-4" />
        </Button>
      </div>
      <Pair label="To" value={result} onValueChange={() => {}} unit={to} onUnitChange={(u) => setTo(u as TempUnit)} options={tempMap} readOnly />
    </div>
  );
}
