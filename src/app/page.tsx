"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const TESTIMONIALS = [
  { name: "LunaWolf", species: "🐺", text: "Found my pack and my soulmate here. Best decision ever!", type: "Therian" },
  { name: "BlazeFox", species: "🦊", text: "Finally an app where I can be myself. The community is incredible.", type: "Furry" },
  { name: "NyxWing", species: "🦇", text: "Met my best friend on Roarr. We go to every con together now!", type: "Otherkin" },
];

const STATS = [
  { value: "50K+", label: "Members" },
  { value: "12K+", label: "Matches" },
  { value: "200+", label: "Species" },
  { value: "99%", label: "Friendly" },
];

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    if (session) router.push("/swipe");
  }, [session, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-float">🐾</div>
          <div className="text-2xl animate-pulse-neon text-neon-purple font-bold">
            Roarr
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <span className="text-xl font-black text-neon-purple">Roarr</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-foreground/60 hover:text-foreground transition-colors px-4 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm gradient-bg text-white font-medium px-5 py-2 rounded-full glow-button"
            >
              Join Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
          {/* Background glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-purple/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-neon-pink/10 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 right-1/4 w-[300px] h-[300px] bg-neon-blue/5 rounded-full blur-[80px]" />

          <div className="animate-float mb-6 relative">
            <span className="text-[100px] drop-shadow-lg">🐾</span>
          </div>

          <h1 className="text-7xl md:text-9xl font-black mb-4 animate-pulse-neon text-neon-purple tracking-tighter">
            Roarr
          </h1>

          <p className="text-xl md:text-2xl text-foreground/60 mb-2 text-center font-medium">
            Find your pack. Find your soulmate.
          </p>
          <p className="text-base text-foreground/40 mb-10 text-center max-w-lg">
            The dating app made for therians, furries & otherkin. Swipe, match, and connect with others who truly understand you.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <Link
              href="/register"
              className="flex-1 glow-button gradient-bg text-white font-bold py-4 px-8 rounded-full text-center text-lg"
            >
              Join the Pack
            </Link>
            <Link
              href="/login"
              className="flex-1 glow-button bg-surface border border-border text-foreground font-bold py-4 px-8 rounded-full text-center text-lg hover:border-neon-purple/50"
            >
              Sign In
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 animate-bounce text-foreground/20">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
            </svg>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 border-y border-border/30">
          <div className="max-w-4xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-black gradient-text">
                    {stat.value}
                  </div>
                  <div className="text-sm text-foreground/40 mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black text-center mb-4 gradient-text">
              How It Works
            </h2>
            <p className="text-center text-foreground/40 mb-12 max-w-lg mx-auto">
              Three simple steps to find your perfect match
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-surface border border-border rounded-3xl p-8 text-center card-shadow hover:border-neon-purple/30 transition-all group">
                <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center text-3xl mx-auto mb-5 group-hover:scale-110 transition-transform">
                  🔥
                </div>
                <h3 className="text-xl font-bold text-neon-purple mb-3">Swipe</h3>
                <p className="text-sm text-foreground/50 leading-relaxed">
                  Browse through profiles that match your vibe. Swipe right to like, left to pass, or up for superlike.
                </p>
              </div>
              <div className="bg-surface border border-border rounded-3xl p-8 text-center card-shadow hover:border-neon-pink/30 transition-all group">
                <div className="w-16 h-16 rounded-2xl bg-neon-pink flex items-center justify-center text-3xl mx-auto mb-5 group-hover:scale-110 transition-transform">
                  💜
                </div>
                <h3 className="text-xl font-bold text-neon-pink mb-3">Match</h3>
                <p className="text-sm text-foreground/50 leading-relaxed">
                  When both of you swipe right, it&apos;s a match! Get notified instantly and start your journey.
                </p>
              </div>
              <div className="bg-surface border border-border rounded-3xl p-8 text-center card-shadow hover:border-neon-blue/30 transition-all group">
                <div className="w-16 h-16 rounded-2xl bg-neon-blue flex items-center justify-center text-3xl mx-auto mb-5 group-hover:scale-110 transition-transform">
                  💬
                </div>
                <h3 className="text-xl font-bold text-neon-blue mb-3">Chat</h3>
                <p className="text-sm text-foreground/50 leading-relaxed">
                  Send real-time messages to your matches. Share your world, your art, and your wild side.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-6 bg-surface/50 border-y border-border/30">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-black mb-12 gradient-text">
              What the Pack Says
            </h2>

            <div className="relative h-40">
              {TESTIMONIALS.map((t, i) => (
                <div
                  key={t.name}
                  className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 ${
                    i === currentTestimonial
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  }`}
                >
                  <span className="text-5xl mb-4">{t.species}</span>
                  <p className="text-lg text-foreground/70 italic mb-3 max-w-md">
                    &quot;{t.text}&quot;
                  </p>
                  <p className="text-sm">
                    <span className="text-neon-purple font-bold">{t.name}</span>
                    <span className="text-foreground/30 mx-2">•</span>
                    <span className="text-foreground/40">{t.type}</span>
                  </p>
                </div>
              ))}
            </div>

            {/* Dots */}
            <div className="flex gap-2 justify-center mt-6">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentTestimonial(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentTestimonial
                      ? "bg-neon-purple w-6"
                      : "bg-border hover:bg-foreground/30"
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/5 to-neon-pink/5" />
          <div className="max-w-2xl mx-auto text-center relative">
            <div className="text-6xl mb-6">🐾</div>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Ready to Find <span className="gradient-text">Your Pack</span>?
            </h2>
            <p className="text-foreground/40 mb-8 max-w-md mx-auto">
              Join thousands of therians, furries, and otherkin already connecting on Roarr. It&apos;s free!
            </p>
            <Link
              href="/register"
              className="inline-block glow-button gradient-bg text-white font-bold py-4 px-12 rounded-full text-lg"
            >
              Create Your Profile
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🐾</span>
            <span className="font-bold text-neon-purple">Roarr</span>
          </div>
          <p className="text-foreground/30 text-sm">
            &copy; 2026 Roarr &mdash; Made with 💜 for the community
          </p>
          <div className="flex gap-6 text-sm text-foreground/30">
            <span className="hover:text-foreground/60 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-foreground/60 cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-foreground/60 cursor-pointer transition-colors">Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
