import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { KeyRound, Copy, RefreshCw, Check } from "lucide-react";
import { ToolShell } from "@/components/ToolShell";
import { RequireAuth } from "@/components/RequireAuth";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/password")({
  head: () => ({
    meta: [
      { title: "Password Generator — Afriyie Tools" },
      { name: "description", content: "Generate strong, random passwords with custom length and character sets." },
      { property: "og:title", content: "Password Generator — Afriyie Tools" },
      { property: "og:description", content: "Strong, customizable passwords in one click." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <PasswordPage />
    </RequireAuth>
  ),
});

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const NUMS = "0123456789";
const SYMS = "!@#$%^&*()-_=+[]{};:,.?/";

function generate(length: number, opts: { upper: boolean; lower: boolean; nums: boolean; syms: boolean }) {
  let pool = "";
  if (opts.upper) pool += UPPER;
  if (opts.lower) pool += LOWER;
  if (opts.nums) pool += NUMS;
  if (opts.syms) pool += SYMS;
  if (!pool) return "";
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  let out = "";
  for (let i = 0; i < length; i++) out += pool[arr[i] % pool.length];
  return out;
}

function strength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (pw.length >= 16) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ["Very weak", "Weak", "Fair", "Good", "Strong", "Excellent", "Excellent"];
  return { score, label: labels[Math.min(score, 6)] };
}

function PasswordPage() {
  const [length, setLength] = useState(16);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [nums, setNums] = useState(true);
  const [syms, setSyms] = useState(true);
  const [pw, setPw] = useState("");
  const [copied, setCopied] = useState(false);

  const regen = () => setPw(generate(length, { upper, lower, nums, syms }));

  useEffect(() => {
    regen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length, upper, lower, nums, syms]);

  const s = useMemo(() => strength(pw), [pw]);

  const copy = async () => {
    if (!pw) return;
    await navigator.clipboard.writeText(pw);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const strengthColor = ["bg-destructive", "bg-destructive", "bg-accent", "bg-accent", "bg-primary", "bg-primary", "bg-primary"][s.score];

  return (
    <ToolShell title="Password Generator" description="Strong, random passwords — generated in your browser." Icon={KeyRound}>
      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-muted/40 p-4 font-mono text-base sm:text-lg break-all min-h-[64px] flex items-center">
          {pw || <span className="text-muted-foreground">Select at least one option</span>}
        </div>

        <div className="flex gap-2">
          <Button onClick={regen} className="flex-1" variant="default">
            <RefreshCw className="h-4 w-4 mr-2" /> Generate
          </Button>
          <Button onClick={copy} variant="outline" disabled={!pw}>
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Strength</Label>
            <span className="text-sm font-medium">{s.label}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div className={`h-full ${strengthColor} transition-all`} style={{ width: `${(s.score / 6) * 100}%` }} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <Label>Length</Label>
            <span className="text-sm font-mono">{length}</span>
          </div>
          <Slider value={[length]} min={6} max={48} step={1} onValueChange={(v) => setLength(v[0])} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Toggle label="Uppercase (A-Z)" checked={upper} onChange={setUpper} />
          <Toggle label="Lowercase (a-z)" checked={lower} onChange={setLower} />
          <Toggle label="Numbers (0-9)" checked={nums} onChange={setNums} />
          <Toggle label="Symbols (!@#)" checked={syms} onChange={setSyms} />
        </div>
      </div>
    </ToolShell>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5 cursor-pointer">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}
