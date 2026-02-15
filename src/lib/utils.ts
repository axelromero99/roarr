import { SPECIES_EMOJI, TYPE_COLORS } from "./constants";

export function getSpeciesEmoji(species: string): string {
  return SPECIES_EMOJI[species] || "\u{1F43E}";
}

export function getTypeColor(fursonaType: string): string {
  return TYPE_COLORS[fursonaType] || "text-foreground/60";
}

export function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}
