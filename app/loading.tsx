export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-[#020617]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-3 border-white/20 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-white/60 text-sm">Loading...</p>
      </div>
    </div>
  );
}
