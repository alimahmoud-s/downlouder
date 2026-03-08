"use client";

export default function AdSensePlaceholder() {
  return (
    <div className="w-full max-w-2xl mx-auto mt-8 p-4 bg-white/5 border border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center gap-2 group hover:border-blue-500/50 transition-colors">
      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
        Advertisement
      </div>
      <div className="w-full h-32 flex items-center justify-center text-gray-400 italic text-sm">
        Upgrade to Pro for an Ad-Free Experience and Playlist Downloads!
      </div>
      <button className="text-xs font-bold text-blue-400 hover:text-blue-300 underline underline-offset-4">
        Go Pro Today
      </button>
    </div>
  );
}
