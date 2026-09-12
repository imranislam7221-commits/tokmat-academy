"use client";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 bg-[#020617]">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-black text-white mb-2">Something went wrong</h2>
        <p className="text-white/60 text-sm mb-6">{error.message || "Unexpected error"}</p>
        <button onClick={reset} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700">Try again</button>
      </div>
    </div>
  );
}
