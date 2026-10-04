import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowUpRight, FileText, Mail, Moon, SunMedium } from "lucide-react";
import {
  SiDocker,
  SiFastapi,
  SiJavascript,
  SiKubernetes,
  SiMongodb,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiPython,
  SiReact,
  SiTailwindcss,
  SiTypescript,
  SiDotnet,
} from "react-icons/si";
import { GrOracle } from "react-icons/gr";
import { TbBrandAws, TbBrandCSharp } from "react-icons/tb";
import DodgeField from "@/components/DodgeField";
import LogoLoop from "@/components/LogoLoop";
import ShinyText from "@/components/ShinyText";
import { TearablePaper } from "@/components/TearablePaper";
import { ProjectModal, type Project } from "@/components/ProjectModal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vishwaraj Surthi" },
      {
        name: "description",
        content:
          "Portfolio of Vishwaraj Surthi, a software and AI engineer building fast, thoughtful products, applied AI systems and delightful interfaces.",
      },
      { property: "og:title", content: "Vishwaraj Surthi — Software & AI Engineer" },
      {
        property: "og:description",
        content:
          "Software and AI engineer building fast, thoughtful products, applied AI systems and delightful interfaces.",
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

const techLogos = [
  { node: <SiReact />, title: "React", href: "https://react.dev" },
  { node: <SiNextdotjs />, title: "Next.js", href: "https://nextjs.org" },
  { node: <SiTypescript />, title: "TypeScript", href: "https://www.typescriptlang.org" },
  {
    node: <SiJavascript />,
    title: "JavaScript",
    href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
  },
  { node: <SiNodedotjs />, title: "Node.js", href: "https://nodejs.org" },
  { node: <SiPython />, title: "Python", href: "https://www.python.org" },
  { node: <SiFastapi />, title: "FastAPI", href: "https://fastapi.tiangolo.com" },
  { node: <SiDotnet />, title: ".NET", href: "https://dotnet.microsoft.com" },
  {
    node: <TbBrandCSharp />,
    title: "C#",
    href: "https://learn.microsoft.com/en-us/dotnet/csharp/",
  },
  { node: <SiPostgresql />, title: "PostgreSQL", href: "https://www.postgresql.org" },
  { node: <GrOracle />, title: "Oracle DB", href: "https://www.oracle.com/database/" },
  { node: <SiMongodb />, title: "MongoDB", href: "https://www.mongodb.com" },
  { node: <SiTailwindcss />, title: "Tailwind CSS", href: "https://tailwindcss.com" },
  { node: <SiDocker />, title: "Docker", href: "https://www.docker.com" },
  { node: <SiKubernetes />, title: "Kubernetes", href: "https://kubernetes.io" },
  { node: <TbBrandAws />, title: "AWS S3", href: "https://aws.amazon.com/s3/" },
];

const projects: Project[] = [
  {
    title: "Retrieval platform",
    year: "2025",
    role: "Applied AI engineering",
    body: "Hybrid vector + lexical search with an evaluation harness, serving sub-120ms answers over millions of documents.",
    tags: ["Python", "pgvector", "Rust"],
    details: [
      "Retrieval-Augmented Generation pipeline on Azure OpenAI and Azure AI Search with grounded citations.",
      "Hybrid ranking blending dense vectors with BM25, tuned against a regression-tested eval harness.",
      "Caching and query-plan optimisation held p95 latency under 120ms at millions of documents.",
    ],
  },
  {
    title: "Agent workbench",
    year: "2024",
    role: "Platform engineering",
    body: "Tool-calling agent runtime with deterministic replay, tracing and cost budgets baked into every run.",
    tags: ["TypeScript", "LLMs", "OTel"],
    details: [
      "Deterministic replay of every tool call, so failures can be reproduced exactly from a trace ID.",
      "OpenTelemetry spans plus per-run token and cost budgets surfaced in Datadog dashboards.",
      "NestJS control plane with a typed React 18 + TanStack Query console.",
    ],
  },
  {
    title: "Realtime edge API",
    year: "2024",
    role: "Distributed systems",
    body: "Globally distributed streaming API handling bursty traffic with a typed end-to-end contract.",
    tags: ["Go", "Edge", "gRPC"],
    details: [
      "WebSocket fan-out backed by Kafka topics with at-least-once delivery and idempotent consumers.",
      "Deployed across AWS Lambda, EKS and CloudFront with autoscaling for 10x traffic spikes.",
      "OpenAPI-first contract shared by every client, validated in CI on each pull request.",
    ],
  },
  {
    title: "Vision QA pipeline",
    year: "2023",
    role: "ML systems",
    body: "On-device inference plus an active-learning loop that cut manual labelling effort by two thirds.",
    tags: ["PyTorch", "ONNX", "MLOps"],
    details: [
      "ONNX-exported models running on-device with a quantised fallback path for low-end hardware.",
      "Active-learning loop surfacing only uncertain samples, cutting labelling effort by ~66%.",
      "Containerised training and evaluation jobs orchestrated through GitHub Actions and Kubernetes.",
    ],
  },
];

const skillGroups: { title: string; skills: string[]; key: string[] }[] = [
  {
    title: "Languages & runtimes",
    key: ["TypeScript", "Python", "C# / .NET"],
    skills: ["JavaScript", "ASP.NET Core", "Node.js", "Java"],
  },
  {
    title: "Frontend",
    key: ["React 18", "Next.js"],
    skills: [
      "Redux Toolkit",
      "React Query / TanStack Query",
      "Apollo Client",
      "Angular",
      "Material UI",
      "HTML5",
      "CSS3",
    ],
  },
  {
    title: "Backend & APIs",
    key: ["NestJS", "GraphQL"],
    skills: [
      "Express.js",
      "FastAPI",
      "Spring Boot",
      "REST",
      "SOAP / WSDL",
      "Microservices",
      "API design",
      "OpenAPI / Swagger",
    ],
  },
  {
    title: "AI & intelligent apps",
    key: ["Azure OpenAI", "RAG"],
    skills: [
      "Azure AI Search",
      "AI-assisted patient summarisation",
      "Context-aware recommendations",
    ],
  },
  {
    title: "Data & messaging",
    key: ["PostgreSQL", "Apache Kafka"],
    skills: [
      "MySQL",
      "MongoDB",
      "Redis",
      "WebSockets",
      "Data modeling",
      "Caching",
      "Query optimization",
    ],
  },
  {
    title: "Cloud & DevOps",
    key: ["AWS", "Kubernetes"],
    skills: [
      "Lambda",
      "EKS",
      "S3",
      "CloudFront",
      "CloudWatch",
      "API Gateway",
      "Azure Container Apps",
      "Docker",
      "GitHub Actions",
      "Jenkins",
      "CI/CD",
    ],
  },
  {
    title: "Security",
    key: ["OAuth 2.0", "Zero Trust"],
    skills: ["OpenID Connect", "JWT", "Azure Entra ID", "RBAC"],
  },
  {
    title: "Testing & observability",
    key: ["Playwright", "OpenTelemetry"],
    skills: [
      "Jest",
      "JUnit",
      "React Testing Library",
      "Cypress",
      "Datadog",
      "CloudWatch",
      "Structured logging",
      "Monitoring",
      "Incident response",
    ],
  },
  {
    title: "System design",
    key: ["Distributed systems", "Scalability"],
    skills: [
      "Data structures",
      "Algorithms",
      "Caching strategies",
      "Performance optimization",
      "Resource optimization",
    ],
  },
];

const navLinks = [
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#projects", label: "Projects" },
];

function Index() {
  const [revealed, setRevealed] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    const introShown = sessionStorage.getItem("introShown");
    return introShown === "true";
  });
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") {
      return "dark";
    }

    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark" || storedTheme === "light") {
      return storedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const [active, setActive] = useState<Project | null>(null);
  const [catchOpen, setCatchOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const onRevealed = useCallback(() => {
    sessionStorage.setItem("introShown", "true");
    setRevealed(true);
  }, []);
  const closeModal = useCallback(() => setActive(null), []);

  return (
    <>
      {!revealed && <TearablePaper onRevealed={onRevealed} />}

      {catchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-xl rounded-[32px] border border-white/10 bg-background/90 p-4 shadow-2xl">
            <button
              type="button"
              aria-label="Close Catch me game"
              onClick={() => setCatchOpen(false)}
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-lg text-foreground"
            >
              ×
            </button>
            <div className="pt-8">
              <DodgeField
                inkColor={theme === "dark" ? "#f5f5f5" : "#111827"}
                contrastColor={theme === "dark" ? "#18181b" : "#ffffff"}
                fieldHeight={240}
                reach={72}
                radius={120}
                falloff={2}
                fleeDuration={130}
                returnDuration={620}
                returnBounce={0.1}
                axis="both"
                wall="clamp"
                patience={4}
                onCatch={() => console.log("caught")}
              >
                {({ dodges, gave }) => (
                  <button
                    type="button"
                    className="dodge-field__pill"
                    aria-label={gave ? "Okay, okay" : dodges ? `Nope x${dodges}` : "Catch me"}
                  >
                    {gave ? "Okay, okay" : dodges ? `Nope x${dodges}` : "Catch me"}
                  </button>
                )}
              </DodgeField>
            </div>
          </div>
        </div>
      )}

      <main className="relative min-h-screen overflow-hidden bg-background text-foreground transition-colors duration-300">
        <div className="aurora pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="noise pointer-events-none absolute inset-0" aria-hidden="true" />

        <header className="sticky top-0 z-30 w-full px-3 pt-3 sm:px-6">
          <nav
            aria-label="Primary"
            className="mx-auto flex max-w-5xl items-center justify-between gap-3 rounded-full border border-white/10 bg-background/60 px-2 py-2 backdrop-blur-xl sm:px-3"
          >
            <a
              href="#top"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-[10px] font-medium uppercase tracking-[0.25em] text-foreground"
            >
              VS
            </a>
            <div className="flex flex-wrap items-center justify-center gap-1">
              <button
                type="button"
                onClick={() => setCatchOpen(true)}
                className="rounded-full border border-blue-400/40 bg-blue-500/10 px-3 py-1.5 text-[10px] font-medium text-blue-700 transition-colors duration-200 hover:bg-blue-500/15 hover:text-blue-600 dark:text-blue-200 dark:hover:text-blue-100 sm:px-3 sm:text-xs"
              >
                Catch me
              </button>
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="rounded-full px-2.5 py-1.5 text-[10px] text-muted-foreground transition-colors duration-200 hover:bg-white/5 hover:text-foreground sm:px-3 sm:text-xs"
                >
                  {l.label}
                </a>
              ))}
              <button
                type="button"
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                aria-pressed={theme === "dark"}
                onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
                className="relative inline-flex h-8 w-14 items-center rounded-full border border-border bg-secondary p-1 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span
                  className={
                    theme === "dark"
                      ? "absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background text-foreground shadow-sm transition-transform duration-200 translate-x-6"
                      : "absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background text-foreground shadow-sm transition-transform duration-200 translate-x-0"
                  }
                >
                  {theme === "dark" ? (
                    <SunMedium className="size-3.5" aria-hidden="true" />
                  ) : (
                    <Moon className="size-3.5" aria-hidden="true" />
                  )}
                </span>
                <span className="relative flex w-full items-center justify-between px-1.5 text-[10px] text-muted-foreground">
                  <SunMedium className="size-3 opacity-70" aria-hidden="true" />
                  <Moon className="size-3 opacity-70" aria-hidden="true" />
                </span>
              </button>
            </div>
          </nav>
        </header>

        <section
          id="top"
          className={
            revealed
              ? "relative mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-4 py-20 sm:px-6 sm:py-24 animate-fade-in"
              : "relative mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-4 py-20 sm:px-6 sm:py-24"
          }
        >
          <span className="glass inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground sm:px-4 sm:text-xs">
            <span className="size-1.5 rounded-full bg-accent" />
            Available for select work
          </span>

          <div className="mt-6 sm:mt-8">
            <div className="overflow-hidden bg-transparent">
              <ShinyText
                text="Vishwaraj Surthi"
                speed={2.4}
                color={theme === "dark" ? "#edf3fb" : "#111827"}
                shineColor={theme === "dark" ? "rgba(255,255,255,0.85)" : "rgba(17,24,39,0.5)"}
                spread={82}
                direction="left"
                yoyo={false}
                pauseOnHover={false}
                disabled={false}
                className="block text-[clamp(2.6rem,7vw,7.2rem)] font-[300] leading-[0.82] tracking-[-0.08em]"
              />
            </div>

            <div className="mt-4 max-w-3xl space-y-3 sm:mt-5 sm:space-y-4">
              <ShinyText
                text="Software Engineer / AI Engineer"
                speed={3}
                color={theme === "dark" ? "#dfe7f2" : "#1f2937"}
                shineColor={theme === "dark" ? "rgba(255,255,255,0.82)" : "rgba(31,41,55,0.48)"}
                spread={90}
                className="text-sm font-light tracking-[0.14em] uppercase sm:text-xl"
                pauseOnHover
              />

              <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-lg">
                I design and build production systems where solid engineering meets applied AI —
                from low-latency backends and retrieval pipelines to interfaces that feel physical,
                quick and considered.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary group inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium sm:w-auto"
            >
              <FileText className="size-4" aria-hidden="true" />
              Resume
              <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <a
              href="mailto:vishwarajsurthi@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost group inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium sm:w-auto"
            >
              <Mail className="size-4" aria-hidden="true" />
              Contact
            </a>
          </div>

          <div className="mt-12 w-full max-w-3xl">
            <div className="mb-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground/80">
              Built with
            </div>
            <LogoLoop
              logos={techLogos}
              speed={100}
              direction="left"
              logoHeight={52}
              gap={36}
              hoverSpeed={0}
              scaleOnHover
              fadeOut
              fadeOutColor="rgba(10, 10, 15, 0.96)"
              ariaLabel="Technology partners"
              style={{ height: 72, width: "100%" }}
            />
          </div>

          <dl className="mt-16 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
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

        <section id="about" className="relative mx-auto max-w-5xl scroll-mt-24 px-4 pb-24 sm:px-6">
          <h2 className="text-sm uppercase tracking-[0.3em] text-muted-foreground">About</h2>
          <div className="mt-8 grid gap-10 md:grid-cols-[1.4fr_1fr]">
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
              <p className="text-pretty">
                I'm a software and AI engineer who likes the unglamorous parts: latency budgets,
                evaluation harnesses, migration plans — the work that makes a product feel
                effortless once it ships.
              </p>
              <p className="text-pretty">
                Most of my time goes to systems that sit between models and users: retrieval,
                orchestration, observability, and the interfaces that make all of it legible. I care
                about craft in the details and about shipping things that survive real traffic.
              </p>
            </div>
            <ul className="space-y-3 rounded-3xl border border-black/10 bg-transparent p-6 text-sm transition-colors duration-200 dark:border-white/10">
              {[
                ["Currently", "Building applied AI systems"],
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

        <section id="skills" className="relative mx-auto max-w-5xl scroll-mt-24 px-4 pb-24 sm:px-6">
          <h2 className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Skills</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {skillGroups.map((g) => (
              <article
                key={g.title}
                className="rounded-3xl border border-black/10 bg-transparent p-6 transition-all duration-200 hover:-translate-y-1 hover:border-blue-400/60 hover:bg-white/[0.02] hover:shadow-[0_0_0_1px_rgba(96,165,250,0.2)] dark:border-white/10 dark:hover:border-blue-300/60 dark:hover:bg-white/[0.02]"
              >
                <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {g.title}
                </h3>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {g.key.map((s) => (
                    <li
                      key={s}
                      className="rounded-full border border-black/10 bg-background/40 px-3 py-1 text-xs font-medium text-foreground transition-colors duration-200 hover:border-blue-400/70 hover:text-blue-600 dark:border-white/10 dark:hover:border-blue-300/60 dark:hover:text-blue-200"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {g.skills.join(" · ")}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="projects"
          className="relative mx-auto max-w-5xl scroll-mt-24 px-4 pb-24 sm:px-6"
        >
          <h2 className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Projects</h2>
          <p className="mt-3 text-sm text-muted-foreground">Select a project for the details.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {projects.map((p) => (
              <button
                key={p.title}
                type="button"
                onClick={() => setActive(p)}
                aria-haspopup="dialog"
                className="group rounded-3xl border border-black/10 bg-transparent p-7 text-left transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/60 hover:bg-white/[0.02] hover:shadow-[0_0_0_1px_rgba(96,165,250,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-white/10 dark:hover:border-blue-300/60 dark:hover:bg-white/[0.02]"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-lg font-medium transition-colors duration-200 group-hover:text-blue-600 dark:group-hover:text-blue-200">
                    {p.title}
                  </h3>
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">
                    {p.year}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <li
                      key={t}
                      className="rounded-full border border-black/10 bg-background/40 px-3 py-1 text-xs text-muted-foreground transition-colors duration-200 hover:border-blue-400/70 hover:text-blue-600 dark:border-white/10 dark:hover:border-blue-300/60 dark:hover:text-blue-200"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>
        </section>

        <section className="relative mx-auto max-w-5xl px-4 pb-32 sm:px-6">
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
                className="rounded-3xl border border-black/10 bg-transparent p-7 transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/60 hover:bg-white/[0.02] hover:shadow-[0_0_0_1px_rgba(96,165,250,0.18)] dark:border-white/10 dark:hover:border-blue-300/60 dark:hover:bg-white/[0.02]"
              >
                <h3 className="text-lg font-medium transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-200">
                  {c.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <ProjectModal project={active} onClose={closeModal} />
    </>
  );
}
