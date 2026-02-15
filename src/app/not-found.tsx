import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl mb-6 animate-float">🐾</div>
        <h1 className="text-6xl font-black gradient-text mb-4">404</h1>
        <h2 className="text-xl font-bold text-foreground/70 mb-2">
          Lost in the Wild
        </h2>
        <p className="text-foreground/40 mb-8 max-w-sm">
          This page wandered off into the forest. Let&apos;s get you back to the pack.
        </p>
        <Link
          href="/"
          className="glow-button gradient-bg text-white font-bold py-3 px-8 rounded-full inline-block"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
