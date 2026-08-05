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
    <div className="mx-auto flex max-w-[1520px] flex-col gap-4 sm:gap-6 px-0 animate-fade-in">
      <section className="enterprise-panel overflow-hidden p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-2 sm:space-y-3">
            <div className="enterprise-kicker">{kicker}</div>
            <div className="space-y-1.5 sm:space-y-2">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-slate-950">
                {title}
              </h1>
              <p className="max-w-2xl text-xs sm:text-sm lg:text-base leading-5 sm:leading-6 text-slate-600">
                {subtitle}
              </p>
            </div>
          </div>

          {actions && <div className="flex flex-wrap gap-2.5 sm:gap-3">{actions}</div>}
        </div>

        {chips.length > 0 && (
          <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 sm:gap-3">
            {chips.map((chip) => (
              <div
                key={chip}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-slate-600"
              >
                {chip}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={contentClassName || "enterprise-panel p-4 sm:p-6 lg:p-8"}>
        {children}
      </section>
    </div>
  );
}