"use client";
import { useEffect, useRef } from "react";
import { ui } from "@/lib/i18n";
import { Locale } from "@/lib/engine";
export function ResetDialog({
  lang,
  onCancel,
  onConfirm,
}: {
  lang: Locale;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null),
    t = ui[lang];
  useEffect(() => {
    const d = ref.current!,
      previous = document.activeElement as HTMLElement | null;
    d.showModal();
    return () => {
      d.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby="reset-title"
      className="modal"
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
    >
      <h2 id="reset-title">{t.resetQuestion}</h2>
      <div className="toolbar">
        <button autoFocus className="secondary" onClick={onCancel}>
          {t.cancel}
        </button>
        <button className="primary" onClick={onConfirm}>
          {t.confirm}
        </button>
      </div>
    </dialog>
  );
}
