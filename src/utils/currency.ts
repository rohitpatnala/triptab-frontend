const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatINR(paise: number): string {
  return inrFormatter.format(paise / 100);
}

/** Convert a rupee input into integer paise without floating point drift. */
export function rupeesToPaise(value: string): number | null {
  const normalized = value.trim().replace(/,/g, "");
  if (!/^\d+(?:\.\d{0,2})?$/.test(normalized)) return null;

  const [rupees, paise = ""] = normalized.split(".");
  const result = Number(rupees) * 100 + Number(paise.padEnd(2, "0"));
  return Number.isSafeInteger(result) && result > 0 ? result : null;
}

export function paiseToRupees(paise: number): string {
  return (paise / 100).toFixed(2);
}

export function formatDate(date: string): string {
  if (!date) return "Date not set";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
