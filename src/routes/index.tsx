import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { ArrowDown, ArrowUpRight, FileText, Mail } from "lucide-react";
import { TearablePaper } from "@/components/TearablePaper";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aarav Mehta — Software & AI Engineer Portfolio" },
      {
        name: "description",
        content:
          "Portfolio of Aarav Mehta, a software and AI engineer building fast, thoughtful products, applied ML systems and delightful interfaces.",
      },
      { property: "og:title", content: "Aarav Mehta — Software & AI Engineer" },
      {
        property: "og:description",
        content:
          "Software and AI engineer building fast, thoughtful products, applied ML systems and delightful interfaces.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const stats = [
  { value: "6+", label: "Years shipping software" },
  { value: "20+", label: "Products & ML systems" },
  { value: "3", label: "Patents & papers" },
];

const projects = [
  {
    title: "Retrieval platform",
    year: "2025",
    body: "Hybrid vector + lexical search with an evaluation harness, serving sub-120ms answers over millions of documents.",
    tags: ["Python", "pgvector", "Rust"],
  },
  {
    title: "Agent workbench",
    year: "2024",
    body: "Tool-calling agent runtime with deterministic replay, tracing and cost budgets baked into every run.",
    tags: ["TypeScript", "LLMs", "OTel"],
  },
  {
    title: "Realtime edge API",
    year: "2024",
    body: "Globally distributed streaming API handling bursty traffic with a typed end-to-end contract.",
    tags: ["Go", "Edge", "gRPC"],
  },
  {
    title: "Vision QA pipeline",
    year: "2023",
    body: "On-device inference plus an active-learning loop that cut manual labelling effort by two thirds.",
    tags: ["PyTorch", "ONNX", "MLOps"],
  },
];

const navLinks = [
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects" },
];

function Index() {
  const [revealed, setRevealed] = useState(false);
  const onRevealed = useCallback(() => setRevealed(true), []);

  return (
    <>
      <TearablePaper onRevealed={onRevealed} />

      <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
        <div className="aurora pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="noise pointer-events-none absolute inset-0" aria-hidden="true" />

        <header className="sticky top-0 z-30 w-full">
          <nav
            aria-label="Primary"
            className="mx-auto mt-4 flex max-w-5xl items-center justify-between gap-4 px-6"
          >
            <a
              href="#top"
              className="glass rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.25em]"
            >
              AM
            </a>
            <div className="glass flex items-center gap-1 rounded-full p-1">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors duration-200 hover:bg-white/5 hover:text-foreground"
                >
                  {l.label}
                </a>
              ))}
              <a
                href="mailto:hello@aaravmehta.dev"
                className="rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors duration-200 hover:bg-white/5 hover:text-foreground"
              >
                Contact
              </a>
            </div>
          </nav>
        </header>

        <section
          id="top"
          className={`relative mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-24 ${
            revealed ? "animate-fade-in" : ""
          }`}
        >
          <span className="glass inline-flex w-fit items-center gap-2 rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-accent" />
            Available for select work
          </span>

          <h1 className="mt-8 text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl">
            Aarav Mehta
          </h1>
          <p className="gradient-text mt-4 text-xl font-medium sm:text-2xl">
            Software Engineer / AI Engineer
          </p>

          <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            I design and build production systems where solid engineering meets applied AI — from
            low-latency backends and retrieval pipelines to interfaces that feel physical, quick and
            considered.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a
              href="/resume.pdf"
              className="btn-primary group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium"
            >
              <FileText className="size-4" aria-hidden="true" />
              Resume
              <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <a
              href="mailto:hello@aaravmehta.dev"
              className="btn-ghost group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium"
            >
              <Mail className="size-4" aria-hidden="true" />
              Contact
            </a>
          </div>

          <dl className="mt-16 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="glass rounded-2xl px-5 py-4 transition-transform duration-300 hover:-translate-y-1"
              >
                <dt className="text-2xl font-semibold tracking-tight">{s.value}</dt>
                <dd className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-20 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            <ArrowDown className="size-4 animate-bounce" aria-hidden="true" />
            Scroll
          </div>
        </section>

        <section id="about" className="relative mx-auto max-w-5xl scroll-mt-24 px-6 pb-24">
          <h2 className="text-sm uppercase tracking-[0.3em] text-muted-foreground">About</h2>
          <div className="mt-8 grid gap-10 sm:grid-cols-[1.4fr_1fr]">
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
              <p className="text-pretty">
                I'm a software and AI engineer who likes the unglamorous parts: latency budgets,
                evaluation harnesses, migration plans — the work that makes a product feel
                effortless once it ships.
              </p>
              <p className="text-pretty">
                Most of my time goes to systems that sit between models and users: retrieval,
                orchestration, observability, and the interfaces that make all of it legible. I
                care about craft in the details and about shipping things that survive real
                traffic.
              </p>
            </div>
            <ul className="glass space-y-3 rounded-3xl p-6 text-sm">
              {[
                ["Currently", "Building applied AI systems"],
                ["Based in", "Bengaluru, remote-friendly"],
                ["Toolkit", "TypeScript, Python, Go, Postgres"],
                ["Interests", "Retrieval, evals, interface craft"],
              ].map(([k, v]) => (
                <li key={k} className="flex flex-col gap-0.5">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">
                    {k}
                  </span>
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="projects" className="relative mx-auto max-w-5xl scroll-mt-24 px-6 pb-24">
          <h2 className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Projects</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {projects.map((p) => (
              <article
                key={p.title}
                className="glass group rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-lg font-medium">{p.title}</h3>
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">
                    {p.year}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <li
                      key={t}
                      className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="relative mx-auto max-w-5xl px-6 pb-32">
          <h2 className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
            Selected focus
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "Applied AI systems",
                body: "Retrieval, evaluation harnesses and agent workflows built to survive real traffic, not demos.",
              },
              {
                title: "Product engineering",
                body: "Typed end-to-end stacks, tight feedback loops and interfaces with real craft in the details.",
              },
            ].map((c) => (
              <article
                key={c.title}
                className="glass rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40"
              >
                <h3 className="text-lg font-medium">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
