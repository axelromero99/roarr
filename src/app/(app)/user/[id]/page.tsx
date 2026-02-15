"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSpeciesEmoji, getTypeColor } from "@/lib/utils";
import { useToast } from "@/components/Toast";

interface UserProfile {
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
  lookingFor: string[];
  online: boolean;
}

export default function UserProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const { toast } = useToast();

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch(`/api/users/${id}`);
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        toast("User not found", "error");
      }
    } catch {
      toast("Network error", "error");
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleSwipe = async (action: "like" | "superlike") => {
    if (!user || swiping) return;
    setSwiping(true);

    try {
      const res = await fetch("/api/swipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUser: user._id, action }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.match) {
          toast("It's a match!", "success");
          router.push("/matches");
        } else {
          toast(action === "superlike" ? "Superliked!" : "Liked!", "success");
          router.back();
        }
      } else {
        toast("Action failed", "error");
      }
    } catch {
      toast("Network error", "error");
    } finally {
      setSwiping(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-9rem)]">
        <div className="text-5xl animate-float" aria-hidden="true">{"\u{1F43E}"}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-9rem)]">
        <div className="text-center">
          <div className="text-6xl mb-4" aria-hidden="true">{"\u{1F63F}"}</div>
          <h3 className="text-lg font-bold mb-2">User not found</h3>
          <button
            onClick={() => router.back()}
            className="text-neon-purple hover:text-neon-pink transition-colors text-sm"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="text-foreground/60 hover:text-foreground mb-4 flex items-center gap-1 transition-colors"
        aria-label="Go back"
      >
        {"\u2190"} Back
      </button>

      {/* Avatar */}
      <div className="bg-gradient-to-br from-neon-purple/20 to-neon-pink/20 rounded-3xl h-56 flex items-center justify-center relative mb-6">
        <span className="text-[100px]" aria-hidden="true">
          {getSpeciesEmoji(user.fursona.species)}
        </span>
        {user.online && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-background/60 backdrop-blur-sm rounded-full px-3 py-1">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-success">Online</span>
          </div>
        )}
      </div>

      {/* Name and basics */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-3xl font-black">{user.displayName}</h1>
          <span className="text-xl text-foreground/50">{user.age}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold capitalize ${getTypeColor(user.fursona.fursonaType)}`}>
            {user.fursona.fursonaType}
          </span>
          <span className="text-foreground/30">{"\u2022"}</span>
          <span className="text-sm text-foreground/60">
            {user.fursona.name} the {user.fursona.species}
          </span>
        </div>
        {user.location && (
          <p className="text-sm text-foreground/40 mt-1"><span aria-hidden="true">{"\u{1F4CD}"}</span> {user.location}</p>
        )}
        {user.gender && (
          <p className="text-sm text-foreground/40">{user.gender}</p>
        )}
      </div>

      {/* Bio */}
      {user.bio && (
        <div className="bg-surface border border-border rounded-2xl p-4 mb-4 card-shadow">
          <h3 className="text-xs text-foreground/40 uppercase tracking-wider mb-2">About</h3>
          <p className="text-sm text-foreground/80 leading-relaxed">{user.bio}</p>
        </div>
      )}

      {/* Fursona description */}
      {user.fursona.description && (
        <div className="bg-surface border border-border rounded-2xl p-4 mb-4 card-shadow">
          <h3 className="text-xs text-foreground/40 uppercase tracking-wider mb-2">Fursona</h3>
          <p className="text-sm text-foreground/70 italic leading-relaxed">
            &quot;{user.fursona.description}&quot;
          </p>
        </div>
      )}

      {/* Looking for */}
      {user.lookingFor.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xs text-foreground/40 uppercase tracking-wider mb-2">Looking For</h3>
          <div className="flex flex-wrap gap-2">
            {user.lookingFor.map((item) => (
              <span
                key={item}
                className="px-3 py-1.5 rounded-full text-xs bg-neon-pink/10 text-neon-pink border border-neon-pink/20"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Interests */}
      {user.interests.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs text-foreground/40 uppercase tracking-wider mb-2">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {user.interests.map((interest) => (
              <span
                key={interest}
                className="px-3 py-1.5 rounded-full text-xs bg-neon-purple/10 text-neon-purple border border-neon-purple/20"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 sticky bottom-20" role="group" aria-label="Profile actions">
        <button
          onClick={() => router.back()}
          aria-label="Pass"
          className="flex-1 bg-surface border border-border text-foreground py-3 rounded-xl text-sm hover:border-danger/50 transition-all"
        >
          <span aria-hidden="true">{"\u2715"}</span> Pass
        </button>
        <button
          onClick={() => handleSwipe("superlike")}
          disabled={swiping}
          aria-label="Superlike"
          className="bg-surface border border-border text-foreground py-3 px-4 rounded-xl text-sm hover:border-neon-blue/50 hover:bg-neon-blue/10 transition-all disabled:opacity-50"
        >
          <span aria-hidden="true">{"\u2B50"}</span>
        </button>
        <button
          onClick={() => handleSwipe("like")}
          disabled={swiping}
          aria-label="Like"
          className="flex-1 gradient-bg text-white font-bold py-3 rounded-xl glow-button disabled:opacity-50"
        >
          <span aria-hidden="true">{"\u{1F49C}"}</span> Like
        </button>
      </div>
    </div>
  );
}
