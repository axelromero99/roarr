"use client";

import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { getSpeciesEmoji, getTypeColor } from "@/lib/utils";

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

interface SwipeCardProps {
  profile: Profile;
  onSwipe: (direction: "left" | "right" | "up") => void;
  isTop: boolean;
}

export default function SwipeCard({ profile, onSwipe, isTop }: SwipeCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-25, 0, 25]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);
  const superlikeOpacity = useTransform(y, [-100, 0], [1, 0]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const threshold = 120;

    if (info.offset.y < -threshold) {
      onSwipe("up");
    } else if (info.offset.x > threshold) {
      onSwipe("right");
    } else if (info.offset.x < -threshold) {
      onSwipe("left");
    }
  };

  const typeColor = getTypeColor(profile.fursona.fursonaType);

  return (
    <motion.div
      className="absolute w-full h-full cursor-grab active:cursor-grabbing"
      style={{ x, y, rotate, zIndex: isTop ? 10 : 0 }}
      drag={isTop}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.02 }}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{
        x: x.get() > 0 ? 300 : x.get() < 0 ? -300 : 0,
        y: y.get() < -50 ? -300 : 0,
        opacity: 0,
        transition: { duration: 0.3 },
      }}
      role="article"
      aria-label={`${profile.displayName}, ${profile.age}, ${profile.fursona.species} ${profile.fursona.fursonaType}`}
    >
      <div className="w-full h-full bg-surface border border-border rounded-3xl overflow-hidden card-shadow relative">
        {/* Avatar area */}
        <div className="h-[55%] bg-gradient-to-br from-neon-purple/20 to-neon-pink/20 flex items-center justify-center relative">
          <span className="text-[120px]" aria-hidden="true">
            {getSpeciesEmoji(profile.fursona.species)}
          </span>

          {/* Online indicator */}
          {profile.online && (
            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-background/60 backdrop-blur-sm rounded-full px-3 py-1">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs text-success">Online</span>
            </div>
          )}

          {/* Swipe overlays */}
          <motion.div
            className="absolute inset-0 bg-success/20 flex items-center justify-center"
            style={{ opacity: likeOpacity }}
          >
            <span className="text-6xl font-black text-success border-4 border-success rounded-xl px-4 py-1 rotate-[-20deg]">
              LIKE
            </span>
          </motion.div>
          <motion.div
            className="absolute inset-0 bg-danger/20 flex items-center justify-center"
            style={{ opacity: nopeOpacity }}
          >
            <span className="text-6xl font-black text-danger border-4 border-danger rounded-xl px-4 py-1 rotate-[20deg]">
              NOPE
            </span>
          </motion.div>
          <motion.div
            className="absolute inset-0 bg-neon-blue/20 flex items-center justify-center"
            style={{ opacity: superlikeOpacity }}
          >
            <span className="text-6xl font-black text-neon-blue border-4 border-neon-blue rounded-xl px-4 py-1">
              SUPER
            </span>
          </motion.div>
        </div>

        {/* Profile info */}
        <div className="h-[45%] p-5 overflow-y-auto">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold">{profile.displayName}</h2>
            <span className="text-foreground/50">{profile.age}</span>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-sm font-medium capitalize ${typeColor}`}>
              {profile.fursona.fursonaType}
            </span>
            <span className="text-foreground/30">•</span>
            <span className="text-sm text-foreground/60">
              {profile.fursona.name} the {profile.fursona.species}
            </span>
          </div>

          {profile.location && (
            <p className="text-xs text-foreground/40 mb-2">
              <span aria-hidden="true">📍</span> {profile.location}
            </p>
          )}

          {profile.bio && (
            <p className="text-sm text-foreground/70 mb-3">{profile.bio}</p>
          )}

          {profile.fursona.description && (
            <p className="text-sm text-foreground/50 italic mb-3">
              &quot;{profile.fursona.description}&quot;
            </p>
          )}

          {profile.interests.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {profile.interests.map((interest) => (
                <span
                  key={interest}
                  className="text-xs px-2 py-1 rounded-full bg-neon-purple/10 text-neon-purple border border-neon-purple/20"
                >
                  {interest}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
