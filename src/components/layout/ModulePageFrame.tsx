import { ReactNode } from "react";
import { ModulePageFrameProps } from "../../../types";

export function ModulePageFrame({
  kicker,
  title,
  subtitle,
  chips = [],
  actions,
  children,
  contentClassName,
}: ModulePageFrameProps) {
  return (
    <div className="mx-auto flex max-w-[1520px] flex-col gap-6 px-0 animate-fade-in">
      <section className="enterprise-panel overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="enterprise-kicker">{kicker}</div>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                {title}
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                {subtitle}
              </p>
            </div>
          </div>

          {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
        </div>

        {chips.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-3">
            {chips.map((chip) => (
              <div
                key={chip}
                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600"
              >
                {chip}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={contentClassName || "enterprise-panel p-6 sm:p-8"}>
        {children}
      </section>
    </div>
  );
}