"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { useLocale } from "next-intl";

interface PlaylistItem {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  url: string;
}

interface PlaylistTableProps {
  items: PlaylistItem[];
  onDownloadSelected: (selectedUrls: string[]) => void;
}

export default function PlaylistTable({
  items,
  onDownloadSelected,
}: PlaylistTableProps) {
  const t = useTranslations("Playlist");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleSelect = (url: string) => {
    const next = new Set(selected);
    if (next.has(url)) {
      next.delete(url);
    } else {
      next.add(url);
    }
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === items.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map((item) => item.url)));
    }
  };

  useGSAP(() => {
    gsap.from(".playlist-item", {
      opacity: 0,
      x: isRtl ? 20 : -20,
      stagger: 0.05,
      duration: 0.6,
      ease: "power3.out",
    });
  }, [items, isRtl]);

  return (
    <div
      ref={containerRef}
      className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {t("title")} ({items.length})
        </h3>
        <button
          onClick={toggleAll}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          {selected.size === items.length ? t("deselect") : t("select")}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleSelect(item.url)}
            className={`playlist-item cursor-pointer p-4 rounded-2xl border-2 transition-all group relative overflow-hidden flex gap-4 ${
              selected.has(item.url)
                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20"
                : "border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 bg-white dark:bg-gray-900"
            }`}
          >
            <div className="relative w-24 h-16 flex-shrink-0">
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-full h-full object-cover rounded-lg shadow-sm"
              />
              <span className="absolute bottom-1 end-1 bg-black/70 text-[10px] text-white px-1.5 py-0.5 rounded font-medium">
                {item.duration}
              </span>
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <h4 className="text-sm font-semibold truncate text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {item.title}
              </h4>
              <p className="text-xs text-gray-500 mt-1">Ready to download</p>
            </div>
            {selected.has(item.url) && (
              <div className="absolute top-2 end-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px]">
                ✓
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="sticky bottom-6 flex justify-center pt-8">
        <button
          disabled={selected.size === 0}
          onClick={() => onDownloadSelected(Array.from(selected))}
          className={`px-8 py-4 rounded-full font-bold shadow-2xl transition-all scale-100 hover:scale-105 active:scale-95 ${
            selected.size > 0
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25"
              : "bg-gray-200 text-gray-400 cursor-not-allowed grayscale"
          }`}
        >
          {t("download").replace("{count}", selected.size.toString())}
        </button>
      </div>
    </div>
  );
}
