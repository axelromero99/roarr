"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SPECIES_OPTIONS } from "@/lib/constants";
import { getSpeciesEmoji, getTypeColor } from "@/lib/utils";
import { useToast } from "@/components/Toast";

interface Profile {
  _id: string;
  displayName: string;
  avatar: string;
  fursona: {
    name: string;
    species: string;
    fursonaType: string;
    description: string;
  };
  age: number;
  gender: string;
  location: string;
  bio: string;
  interests: string[];
  online: boolean;
}

export default function ExplorePage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  const [filters, setFilters] = useState({
    species: "",
    fursonaType: "",
    minAge: "",
    maxAge: "",
    gender: "",
  });

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.species) params.set("species", filters.species);
      if (filters.fursonaType) params.set("fursonaType", filters.fursonaType);
      if (filters.minAge) params.set("minAge", filters.minAge);
      if (filters.maxAge) params.set("maxAge", filters.maxAge);
      if (filters.gender) params.set("gender", filters.gender);

      const res = await fetch(`/api/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setProfiles(data);
      } else {
        toast("Failed to load profiles", "error");
      }
    } catch {
      toast("Network error", "error");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    fetchProfiles();
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({ species: "", fursonaType: "", minAge: "", maxAge: "", gender: "" });
  };

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold gradient-text">Explore</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          aria-expanded={showFilters}
          aria-controls="filter-panel"
          className={`px-4 py-2 rounded-full text-sm border transition-all ${
            showFilters
              ? "border-neon-purple bg-neon-purple/20 text-neon-purple"
              : "border-border text-foreground/60 hover:border-neon-purple/50"
          }`}
        >
          Filters {showFilters ? "\u25B2" : "\u25BC"}
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div id="filter-panel" className="bg-surface border border-border rounded-2xl p-4 mb-6 space-y-4 card-shadow" role="search" aria-label="Profile filters">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="filter-species" className="block text-xs text-foreground/60 mb-1">Species</label>
              <select
                id="filter-species"
                value={filters.species}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, species: e.target.value }))
                }
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-neon-purple"
              >
                <option value="">All</option>
                {SPECIES_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="filter-type" className="block text-xs text-foreground/60 mb-1">Type</label>
              <select
                id="filter-type"
                value={filters.fursonaType}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, fursonaType: e.target.value }))
                }
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-neon-purple"
              >
                <option value="">All</option>
                <option value="furry">Furry</option>
                <option value="therian">Therian</option>
                <option value="otherkin">Otherkin</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="filter-min-age" className="block text-xs text-foreground/60 mb-1">Min Age</label>
              <input
                id="filter-min-age"
                type="number"
                value={filters.minAge}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, minAge: e.target.value }))
                }
                min={18}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-neon-purple"
                placeholder="18"
              />
            </div>
            <div>
              <label htmlFor="filter-max-age" className="block text-xs text-foreground/60 mb-1">Max Age</label>
              <input
                id="filter-max-age"
                type="number"
                value={filters.maxAge}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, maxAge: e.target.value }))
                }
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-neon-purple"
                placeholder="99"
              />
            </div>
            <div>
              <label htmlFor="filter-gender" className="block text-xs text-foreground/60 mb-1">Gender</label>
              <select
                id="filter-gender"
                value={filters.gender}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, gender: e.target.value }))
                }
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-neon-purple"
              >
                <option value="">All</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={clearFilters}
              className="flex-1 bg-background border border-border text-foreground/60 py-2 rounded-xl text-sm hover:border-neon-purple/50"
            >
              Clear
            </button>
            <button
              onClick={applyFilters}
              className="flex-1 gradient-bg text-white py-2 rounded-xl text-sm glow-button"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-foreground/40 animate-pulse">Searching...</div>
        </div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4" aria-hidden="true">{"\u{1F50D}"}</div>
          <h3 className="text-lg font-bold mb-2">No profiles found</h3>
          <p className="text-foreground/40 text-sm">
            Try adjusting your filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3" role="list" aria-label="User profiles">
          {profiles.map((profile) => (
            <Link
              key={profile._id}
              href={`/user/${profile._id}`}
              role="listitem"
              className="bg-surface border border-border rounded-2xl overflow-hidden hover:border-neon-purple/50 transition-all card-shadow"
            >
              <div className="h-28 bg-gradient-to-br from-neon-purple/20 to-neon-pink/20 flex items-center justify-center relative">
                <span className="text-5xl" aria-hidden="true">
                  {getSpeciesEmoji(profile.fursona.species)}
                </span>
                {profile.online && (
                  <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-success border border-surface" aria-label="Online" />
                )}
              </div>
              <div className="p-3">
                <h3 className="font-bold text-sm truncate">
                  {profile.displayName}, {profile.age}
                </h3>
                <p
                  className={`text-xs capitalize ${getTypeColor(profile.fursona.fursonaType)}`}
                >
                  {profile.fursona.fursonaType} - {profile.fursona.species}
                </p>
                {profile.location && (
                  <p className="text-xs text-foreground/30 mt-1 truncate">
                    <span aria-hidden="true">{"\u{1F4CD}"}</span> {profile.location}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
