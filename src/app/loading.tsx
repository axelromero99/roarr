export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-float">🐾</div>
        <h2 className="text-2xl font-black text-neon-purple animate-pulse-neon">
          Roarr
        </h2>
        <p className="text-foreground/40 text-sm mt-2">Loading...</p>
      </div>
    </div>
  );
}
