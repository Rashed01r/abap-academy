import { Fragment } from "react";
// Keep spaces outside the isolate so mixed Arabic/ABAP prose reads naturally.
export function TechnicalText({ children }: { children: string }) {
  return children.split(/([\x20-\x7E]*[A-Za-z0-9_][\x20-\x7E]*)/g).map((part, index) => {
    if (!/[A-Za-z0-9_]/.test(part)) return part;
    const [, before, content, after] = part.match(/^(\s*)(.*?)(\s*)$/)!;
    return <Fragment key={index}>{before}<bdi dir="ltr">{content}</bdi>{after}</Fragment>;
  });
}
