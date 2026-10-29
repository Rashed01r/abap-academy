"use client";
import dynamic from "next/dynamic";
import { loader, OnMount } from "@monaco-editor/react";
import { useEffect, useRef } from "react";
import type { editor, IDisposable } from "monaco-editor";
import { ExecutionEvent, SimulationError, Range, Locale } from "@/lib/engine";
import { ui, errors } from "@/lib/i18n";
loader.config({ paths: { vs: "/monaco/vs" } });
const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });
export function CodeEditor({
  code,
  onChange,
  event,
  error,
  theme,
  lang,
  onField,
}: {
  code: string;
  onChange: (code: string) => void;
  event?: ExecutionEvent;
  error?: SimulationError;
  theme: "light" | "dark";
  lang: Locale;
  onField: (name: string) => void;
}) {
  const ref = useRef<editor.IStandaloneCodeEditor | null>(null),
    monacoRef = useRef<Parameters<OnMount>[1] | null>(null),
    decorations = useRef<editor.IEditorDecorationsCollection | null>(null),
    disposable = useRef<IDisposable | null>(null);
  const synchronize = useRef<() => void>(() => {});
  const t = ui[lang];
  const apply = () => {
    const ed = ref.current,
      m = monacoRef.current;
    if (!ed || !m) return;
    const range = (r: Range) =>
      new m.Range(r.startLine, r.startColumn, r.endLine, r.endColumn);
    const list: editor.IModelDeltaDecoration[] = [];
    if (event) {
      list.push({
        range: range(event.range),
        options: {
          isWholeLine: true,
          className: "execution-line",
          glyphMarginHoverMessage: { value: t.active },
        },
      });
      list.push({
        range: new m.Range(event.range.startLine, 1, event.range.startLine, 1),
        options: {
          glyphMarginClassName: "execution-pointer",
          glyphMarginHoverMessage: { value: t.active },
        },
      });
      for (const r of event.skippedRanges)
        list.push({
          range: range(r),
          options: {
            className: "skipped-code",
            hoverMessage: { value: t.skipped },
          },
        });
      ed.revealRangeInCenterIfOutsideViewport(range(event.range));
    }
    if (error)
      list.push({
        range: range(error.range),
        options: { className: "error-range", isWholeLine: true },
      });
    decorations.current?.set(list);
    const model = ed.getModel();
    if (model)
      m.editor.setModelMarkers(
        model,
        "academy",
        error
          ? [
              {
                startLineNumber: error.range.startLine,
                startColumn: error.range.startColumn,
                endLineNumber: error.range.endLine,
                endColumn: error.range.endColumn,
                severity: m.MarkerSeverity.Error,
                message: errors[lang][error.code],
              },
            ]
          : [],
      );
  };
  useEffect(() => {
    synchronize.current = apply;
    apply();
  });
  useEffect(
    () => () => {
      disposable.current?.dispose();
      decorations.current?.clear();
    },
    [],
  );
  return (
    <div className="editor-shell" dir="ltr" data-editor-theme={theme}>
      <div className="editor-top">
        <span>
          <span className="dot" /> mission.abap
        </span>
        <span>ABAP</span>
      </div>
      <Editor
        height="410px"
        language="abap"
        theme={theme === "dark" ? "vs-dark" : "vs"}
        value={code}
        loading={<p>{t.loading}</p>}
        onChange={(v) => onChange(v || "")}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          glyphMargin: true,
          wordWrap: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          autoIndent: "none",
          formatOnPaste: false,
          ariaLabel: t.editor,
          tabSize: 2,
          padding: { top: 16 },
          accessibilitySupport: "on",
          renderLineHighlight: "none",
        }}
        beforeMount={(m) => {
          if (
            !m.languages
              .getLanguages()
              .some((l: { id: string }) => l.id === "abap")
          ) {
            m.languages.register({ id: "abap" });
            m.languages.setMonarchTokensProvider("abap", {
              tokenizer: {
                root: [
                  [
                    /\b(DATA|TYPES|BEGIN|END|OF|TYPE|VALUE|WRITE|IF|ELSE|ENDIF)\b/i,
                    "keyword",
                  ],
                  [/'([^']|'')*'/, "string"],
                  [/\b\d+\b/, "number"],
                  [/^\*.*/, "comment"],
                  [/".*/, "comment"],
                ],
              },
            });
          }
        }}
        onMount={(ed, m) => {
          ref.current = ed;
          monacoRef.current = m;
          decorations.current = ed.createDecorationsCollection();
          disposable.current = ed.onMouseDown((e) => {
            if (!e.target.position) return;
            const { lineNumber, column } = e.target.position;
            const line = ed.getModel()?.getLineContent(lineNumber) || "";
            for (const match of line.matchAll(/[a-z_]\w*-[a-z_]\w*/gi))
              if (
                column >= (match.index || 0) + 1 &&
                column <= (match.index || 0) + match[0].length + 1
              )
                onField(match[0].toLowerCase());
          });
          synchronize.current();
        }}
      />
      <div className="editor-help" dir={lang === "ar" ? "rtl" : "ltr"}>
        {t.editorHelp}
      </div>
    </div>
  );
}
