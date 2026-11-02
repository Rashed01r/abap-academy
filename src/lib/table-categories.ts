// A finite conceptual comparison, intentionally independent from the ABAP executor.
export function categorySnapshot(category: "standard" | "sorted" | "hashed", count: number) {
  const input = [30, 10, 30].slice(0, Math.max(0, Math.min(3, Math.floor(count))));
  return {
    rows: category === "sorted" ? [...input].sort((a,b) => a-b) : category === "hashed" ? Array.from(new Set(input)) : input,
    duplicate: category === "hashed" && input.length !== new Set(input).size,
  };
}
