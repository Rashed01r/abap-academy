"use client";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

// Transient learning state lasts for this browser session; earned progress still
// belongs exclusively to the existing version 2 progress store.
const sessions = new Map<string, unknown>();
export function useTopicSession<T>(key: string | undefined, initial: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => key && typeof window !== "undefined" && sessions.has(key) ? sessions.get(key) as T : initial);
  useEffect(() => {if (key) sessions.set(key, value);}, [key, value]);
  return [value, setValue];
}
