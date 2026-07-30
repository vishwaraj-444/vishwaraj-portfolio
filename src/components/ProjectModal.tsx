import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export type Project = {
  title: string;
  year: string;
  body: string;
  tags: string[];
  role?: string;
  details?: string[];
};

export function ProjectModal({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey, true);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey, true);
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="presentation"
      onClick={onClose}
    >
      <div className="animate-fade-in absolute inset-0 bg-background/70 backdrop-blur-xl" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="glass animate-scale-in relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl p-7 sm:p-9"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close project details"
          className="absolute right-5 top-5 rounded-full border border-border p-2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-4" aria-hidden="true" />
        </button>

        <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          {project.year}
        </span>
        <h3 id="project-modal-title" className="mt-3 text-2xl font-semibold tracking-tight">
          {project.title}
        </h3>
        {project.role && <p className="gradient-text mt-1 text-sm font-medium">{project.role}</p>}

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{project.body}</p>

        {project.details && (
          <ul className="mt-5 space-y-2.5">
            {project.details.map((d) => (
              <li key={d} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                {d}
              </li>
            ))}
          </ul>
        )}

        <ul className="mt-6 flex flex-wrap gap-2">
          {project.tags.map((t) => (
            <li
              key={t}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
            >
              {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
