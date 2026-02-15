"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { getSpeciesEmoji, timeAgo } from "@/lib/utils";
import { useToast } from "@/components/Toast";

interface MatchUser {
  _id: string;
  displayName: string;
  avatar: string;
  fursona: { name: string; species: string };
  online: boolean;
}

interface MatchData {
  _id: string;
  users: MatchUser[];
  lastMessage: string;
  lastMessageAt: string;
  createdAt: string;
}

export default function MatchesPage() {
  const { data: session } = useSession();
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const res = await fetch("/api/matches");
      if (res.ok) {
        const data = await res.json();
        setMatches(data);
      } else {
        toast("Failed to load matches", "error");
      }
    } catch {
      toast("Network error", "error");
    } finally {
      setLoading(false);
    }
  };

  const getOtherUser = (match: MatchData) => {
    const userId = (session?.user as { id: string })?.id;
    return match.users.find((u) => u._id !== userId) || match.users[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-9rem)]">
        <div className="text-xl animate-pulse text-foreground/40">
          Loading matches...
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <h1 className="text-2xl font-bold mb-6 gradient-text">Your Matches</h1>

      {matches.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4" aria-hidden="true">{"\u{1F49C}"}</div>
          <h3 className="text-lg font-bold mb-2">No matches yet</h3>
          <p className="text-foreground/40 text-sm">
            Keep swiping to find your pack!
          </p>
          <Link
            href="/swipe"
            className="inline-block mt-4 gradient-bg text-white px-6 py-2 rounded-full glow-button text-sm"
          >
            Start Swiping
          </Link>
        </div>
      ) : (
        <div className="space-y-3" role="list" aria-label="Your matches">
          {matches.map((match) => {
            const other = getOtherUser(match);
            return (
              <Link
                key={match._id}
                href={`/chat/${match._id}`}
                role="listitem"
                className="flex items-center gap-4 bg-surface border border-border rounded-2xl p-4 hover:border-neon-purple/50 transition-all card-shadow"
              >
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-neon-purple/20 flex items-center justify-center text-2xl" aria-hidden="true">
                    {getSpeciesEmoji(other.fursona.species)}
                  </div>
                  {other.online && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-success border-2 border-surface" aria-label="Online" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold truncate">{other.displayName}</h3>
                    <span className="text-xs text-foreground/30">
                      {timeAgo(match.lastMessageAt || match.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/40 truncate">
                    {match.lastMessage || "Say hello! \u{1F44B}"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
