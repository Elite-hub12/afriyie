import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FileText } from "lucide-react";
import { ToolShell } from "@/components/ToolShell";
import { RequireAuth } from "@/components/RequireAuth";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/wordcount")({
  head: () => ({
    meta: [
      { title: "Word Counter — Afriyie Tools" },
      { name: "description", content: "Count words, characters, sentences and estimated reading time for any text or essay." },
      { property: "og:title", content: "Word Counter — Afriyie Tools" },
      { property: "og:description", content: "Instantly count words, characters and reading time." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <WordCountPage />
    </RequireAuth>
  ),
});

function WordCountPage() {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;
    const sentences = trimmed.length === 0 ? 0 : (trimmed.match(/[^.!?]+[.!?]+/g) || [trimmed]).length;
    const paragraphs = trimmed.length === 0 ? 0 : trimmed.split(/\n+/).filter((p) => p.trim().length > 0).length;
    // Average reading speed ~ 200 words per minute
    const readingMinutes = words / 200;
    return { words, characters, charactersNoSpaces, sentences, paragraphs, readingMinutes };
  }, [text]);

  const formatReadTime = (mins: number) => {
    if (mins === 0) return "0 min";
    if (mins < 1) {
      const seconds = Math.max(1, Math.round(mins * 60));
      return `${seconds} sec`;
    }
    const rounded = Math.round(mins * 10) / 10;
    return `${rounded} min`;
  };

  return (
    <ToolShell
      title="Word Counter"
      description="Count words, characters and estimate reading time."
      Icon={FileText}
    >
      <div className="space-y-5">
        <div>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type your text, essay, article…"
            className="min-h-[260px] font-mono text-sm leading-relaxed resize-y"
          />
          <div className="mt-2 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setText("")}
              disabled={text.length === 0}
            >
              Clear
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard label="Words" value={stats.words.toLocaleString()} highlight />
          <StatCard label="Characters" value={stats.characters.toLocaleString()} />
          <StatCard label="No spaces" value={stats.charactersNoSpaces.toLocaleString()} />
          <StatCard label="Sentences" value={stats.sentences.toLocaleString()} />
          <StatCard label="Paragraphs" value={stats.paragraphs.toLocaleString()} />
          <StatCard label="Reading time" value={formatReadTime(stats.readingMinutes)} highlight />
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Reading time is based on an average pace of 200 words per minute.
        </p>
      </div>
    </ToolShell>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-xl border p-4 text-center ${
        highlight ? "border-primary/30 bg-primary/5" : "border-border bg-muted/40"
      }`}
    >
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-2xl font-bold tabular-nums">{value}</div>
    </div>
  );
}
