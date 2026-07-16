export function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function timeUntil(iso) {
  const diff = new Date(iso) - new Date();
  if (diff <= 0) return "now";
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 1) return "today";
  if (days === 1) return "tomorrow";
  if (days < 30) return `in ${days} days`;
  if (days < 365) return `in ${Math.round(days / 30)} months`;
  return `in ${Math.round(days / 365)} year${days >= 730 ? "s" : ""}`;
}
