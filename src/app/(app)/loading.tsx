export default function AppLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-3 animate-float">🐾</div>
        <div className="flex gap-1 justify-center">
          <div className="w-2 h-2 rounded-full bg-neon-purple animate-bounce [animation-delay:0ms]" />
          <div className="w-2 h-2 rounded-full bg-neon-purple animate-bounce [animation-delay:150ms]" />
          <div className="w-2 h-2 rounded-full bg-neon-purple animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
