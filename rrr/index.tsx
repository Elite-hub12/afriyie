import { createFileRoute, Link } from "@tanstack/react-router";
import { KeyRound, Ruler, HeartPulse, PiggyBank, FileText, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Afriyie Tools — All your everyday utilities, one place" },
      { name: "description", content: "Free online multi-tool: password generator, unit converter, BMI checker, simple interest calculator and word counter." },
      { property: "og:title", content: "Afriyie Tools — All your everyday utilities" },
      { property: "og:description", content: "Password, units, BMI and interest — fast, clean and free." },
    ],
  }),
  component: Index,
});

const tools = [
  {
    to: "/password",
    title: "Password Generator",
    desc: "Strong, customizable passwords with one click.",
    Icon: KeyRound,
  },
  {
    to: "/units",
    title: "Unit Converter",
    desc: "Length, weight and temperature — instantly.",
    Icon: Ruler,
  },
  {
    to: "/bmi",
    title: "BMI Checker",
    desc: "Know your body mass index in seconds.",
    Icon: HeartPulse,
  },
  {
    to: "/interest",
    title: "Simple Interest",
    desc: "Calculate interest, total and growth.",
    Icon: PiggyBank,
  },
  {
    to: "/wordcount",
    title: "Word Counter",
    desc: "Count words, characters and reading time.",
    Icon: FileText,
  },
] as const;

function Index() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 opacity-[0.08]"
          style={{ background: "var(--gradient-brand)" }}
          aria-hidden
        />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-16 sm:pt-24 pb-12 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-[var(--shadow-soft)]">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> 5 tools · 0 sign-ups
          </span>
          <h1 className="mt-6 text-4xl sm:text-6xl font-bold tracking-tight">
            Everyday utilities,{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-brand)" }}
            >
              beautifully simple
            </span>
            .
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-muted-foreground">
            Afriyie Tools brings together the small things you do every day — into one fast, clean and friendly toolbox.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              to="/password"
              className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elevated)] transition-transform hover:scale-[1.02]"
              style={{ background: "var(--gradient-brand)" }}
            >
              Try it now <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#tools"
              className="inline-flex items-center rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-semibold hover:bg-muted"
            >
              Explore tools
            </a>
          </div>
        </div>
      </section>

      {/* Tools grid */}
      <section id="tools" className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="grid gap-5 sm:grid-cols-2">
          {tools.map(({ to, title, desc, Icon }) => (
            <Link
              key={to}
              to={to}
              className="group relative rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]"
            >
              <div className="flex items-start gap-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-primary-foreground"
                  style={{ background: "var(--gradient-brand)" }}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
