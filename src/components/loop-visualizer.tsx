import type { ExecutionEvent, Locale } from "@/lib/engine";
import { ui } from "@/lib/i18n";

export function LoopVisualizer({ event, lang }: { event: ExecutionEvent; lang: Locale }) {
  const loop = event.loop;
  if (!loop) return null;
  const t = ui[lang];
  return <section className="loop-visualizer" aria-label={t.loopCounter} data-testid="loop-counter">
    <div><h3>{t.loopCounter}</h3><code dir="ltr">{loop.kind === "loop" ? "LOOP AT" : loop.kind.toUpperCase()}</code></div>
    <p><span>{t.iteration}</span><strong key={`${loop.kind}-${loop.iteration}`} className="iteration-value" dir="ltr">{loop.iteration}{loop.count !== undefined && <small> / {loop.count}</small>}</strong></p>
    <small>{t.repeatedStatement}</small>
  </section>;
}
