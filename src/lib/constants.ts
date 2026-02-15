export const SPECIES_OPTIONS = [
  "Wolf", "Fox", "Cat", "Dog", "Dragon", "Deer", "Bear", "Rabbit",
  "Bird", "Shark", "Otter", "Raccoon", "Lion", "Tiger", "Horse",
  "Bat", "Snake", "Lizard", "Hybrid", "Other",
] as const;

export const INTEREST_OPTIONS = [
  "Art", "Music", "Gaming", "Cosplay", "Writing", "Fursuiting",
  "Photography", "Hiking", "Anime", "Movies", "Cooking", "Dancing",
  "Technology", "Nature", "Conventions", "Crafting",
] as const;

export const LOOKING_FOR_OPTIONS = [
  "Friends", "Dating", "Relationship", "Chat Buddy",
] as const;

export const SPECIES_EMOJI: Record<string, string> = {
  Wolf: "\u{1F43A}", Fox: "\u{1F98A}", Cat: "\u{1F431}", Dog: "\u{1F436}", Dragon: "\u{1F409}",
  Deer: "\u{1F98C}", Bear: "\u{1F43B}", Rabbit: "\u{1F430}", Bird: "\u{1F426}", Shark: "\u{1F988}",
  Otter: "\u{1F9A6}", Raccoon: "\u{1F99D}", Lion: "\u{1F981}", Tiger: "\u{1F42F}", Horse: "\u{1F434}",
  Bat: "\u{1F987}", Snake: "\u{1F40D}", Lizard: "\u{1F98E}",
};

export const TYPE_COLORS: Record<string, string> = {
  furry: "text-neon-purple",
  therian: "text-neon-pink",
  otherkin: "text-neon-blue",
};
