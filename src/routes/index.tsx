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

function Index() {
  const [revealed, setRevealed] = useState(false);
  const onRevealed = useCallback(() => setRevealed(true), []);

  return (
    <>
      <TearablePaper onRevealed={onRevealed} />

      <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
        <div className="aurora pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="noise pointer-events-none absolute inset-0" aria-hidden="true" />

        <section
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
              <div key={s.label} className="glass rounded-2xl px-5 py-4 transition-transform duration-300 hover:-translate-y-1">
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

        <section className="relative mx-auto max-w-5xl px-6 pb-32">
          <h2 className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Selected focus</h2>
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
