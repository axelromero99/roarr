"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SwipeCard from "@/components/SwipeCard";
import { getSpeciesEmoji } from "@/lib/utils";
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

export default function SwipePage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [matchPopup, setMatchPopup] = useState<{
    name: string;
    species: string;
  } | null>(null);
  const [swipeCount, setSwipeCount] = useState(0);
  const { toast } = useToast();

  const fetchProfiles = useCallback(async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setProfiles(data);
        setCurrentIndex(0);
      } else {
        toast("Failed to load profiles", "error");
      }
    } catch {
      toast("Network error. Check your connection.", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleSwipe = async (direction: "left" | "right" | "up") => {
    const profile = profiles[currentIndex];
    if (!profile) return;

    const action =
      direction === "right"
        ? "like"
        : direction === "up"
        ? "superlike"
        : "dislike";

    setSwipeCount((prev) => prev + 1);

    try {
      const res = await fetch("/api/swipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUser: profile._id, action }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.match) {
          setMatchPopup({
            name: profile.displayName,
            species: profile.fursona.species,
          });
        }
      } else {
        toast("Swipe failed. Try again.", "error");
      }
    } catch {
      toast("Network error", "error");
    }

    setCurrentIndex((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-9rem)]">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-float" aria-hidden="true">{"\u{1F43E}"}</div>
          <p className="text-foreground/40 text-sm">
            Finding furries near you...
          </p>
          <div className="flex gap-1 justify-center mt-3" aria-hidden="true">
            <div className="w-2 h-2 rounded-full bg-neon-purple animate-bounce [animation-delay:0ms]" />
            <div className="w-2 h-2 rounded-full bg-neon-purple animate-bounce [animation-delay:150ms]" />
            <div className="w-2 h-2 rounded-full bg-neon-purple animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    );
  }

  const remainingProfiles = profiles.slice(currentIndex);

  return (
    <div className="h-[calc(100vh-9rem)] flex flex-col">
      {/* Match popup */}
      <AnimatePresence>
        {matchPopup && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMatchPopup(null)}
            role="dialog"
            aria-label="New match"
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", duration: 0.6 }}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 bg-neon-purple/20 rounded-full blur-[80px]" />
              </div>

              <motion.div
                className="text-7xl mb-6"
                initial={{ rotate: -20 }}
                animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                transition={{ duration: 0.8, delay: 0.3 }}
                aria-hidden="true"
              >
                {getSpeciesEmoji(matchPopup.species)}
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-4xl font-black gradient-text mb-3">
                  It&apos;s a Match!
                </h2>
                <p className="text-foreground/60 mb-6">
                  You and <span className="text-neon-purple font-bold">{matchPopup.name}</span> liked each other
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setMatchPopup(null)}
                    className="bg-surface border border-border text-foreground px-6 py-2.5 rounded-full text-sm hover:border-neon-purple/50 transition-colors"
                  >
                    Keep Swiping
                  </button>
                  <a
                    href="/matches"
                    className="gradient-bg text-white px-6 py-2.5 rounded-full text-sm glow-button"
                  >
                    Send a Message
                  </a>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swipe counter */}
      {swipeCount > 0 && (
        <div className="text-center py-1">
          <span className="text-xs text-foreground/20">
            {remainingProfiles.length} profiles remaining
          </span>
        </div>
      )}

      {/* Cards */}
      <div className="flex-1 relative">
        {remainingProfiles.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-7xl mb-6" aria-hidden="true">{"\u{1F319}"}</div>
              <h3 className="text-xl font-bold mb-2">No more profiles</h3>
              <p className="text-foreground/40 text-sm mb-6 max-w-xs mx-auto">
                You&apos;ve seen everyone for now. Come back later for new faces!
              </p>
              <button
                onClick={fetchProfiles}
                className="gradient-bg text-white px-8 py-3 rounded-full glow-button text-sm font-bold"
              >
                Refresh Profiles
              </button>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {remainingProfiles.slice(0, 2).map((profile, i) => (
              <SwipeCard
                key={profile._id}
                profile={profile}
                onSwipe={handleSwipe}
                isTop={i === 0}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Action buttons */}
      {remainingProfiles.length > 0 && (
        <div className="flex justify-center items-center gap-5 py-4" role="group" aria-label="Swipe actions">
          <button
            onClick={() => handleSwipe("left")}
            aria-label="Dislike"
            className="w-16 h-16 rounded-full bg-surface border-2 border-border flex items-center justify-center text-2xl hover:border-danger hover:bg-danger/10 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all active:scale-75 duration-200"
          >
            <span aria-hidden="true">{"\u2715"}</span>
          </button>
          <button
            onClick={() => handleSwipe("up")}
            aria-label="Superlike"
            className="w-12 h-12 rounded-full bg-surface border-2 border-border flex items-center justify-center text-xl hover:border-neon-blue hover:bg-neon-blue/10 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all active:scale-75 duration-200"
          >
            <span aria-hidden="true">{"\u2B50"}</span>
          </button>
          <button
            onClick={() => handleSwipe("right")}
            aria-label="Like"
            className="w-16 h-16 rounded-full bg-surface border-2 border-border flex items-center justify-center text-2xl hover:border-success hover:bg-success/10 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all active:scale-75 duration-200"
          >
            <span aria-hidden="true">{"\u{1F49C}"}</span>
          </button>
        </div>
      )}

      {/* Swipe hint */}
      {swipeCount === 0 && remainingProfiles.length > 0 && (
        <motion.div
          className="text-center pb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <p className="text-xs text-foreground/20">
            Drag cards or use the buttons below
          </p>
        </motion.div>
      )}
    </div>
  );
}
