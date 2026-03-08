"use client";

import { useTranslations } from "next-intl";

interface Format {
  format_id: string;
  ext: string;
  label: string;
  type: "video" | "audio";
  height?: number;
  filesize?: number;
  tbr?: number;
}

interface FormatSelectorProps {
  title: string;
  thumbnail?: string;
  duration?: number;
  formats: Format[];
  onSelect: (format_id: string, type: string) => void;
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(seconds?: number): string {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function FormatSelector({
  title,
  thumbnail,
  duration,
  formats,
  onSelect,
}: FormatSelectorProps) {
  const videoFormats = formats.filter((f) => f.type === "video");
  const audioFormats = formats.filter((f) => f.type === "audio");

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg">
      {/* Video Info Header */}
      <div className="flex items-center gap-4 mb-6">
        {thumbnail && (
          <img
            src={thumbnail}
            alt={title}
            className="w-24 h-16 rounded-lg object-cover"
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold truncate">{title}</h3>
          {duration && (
            <span className="text-gray-400 text-sm">
              {formatDuration(duration)}
            </span>
          )}
        </div>
      </div>

      {/* Video Formats */}
      {videoFormats.length > 0 && (
        <div className="mb-4">
          <h4 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            Video
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {videoFormats.map((f) => (
              <button
                key={f.format_id}
                onClick={() => onSelect(f.format_id, f.type)}
                className="px-4 py-3 bg-white/5 hover:bg-blue-500/20 border border-white/10 hover:border-blue-500/50 rounded-xl text-white text-sm font-medium transition-all flex flex-col items-center gap-1 group"
              >
                <span className="text-base font-bold group-hover:text-blue-400 transition-colors">
                  {f.label}
                </span>
                <span className="text-gray-500 text-xs">
                  {f.ext.toUpperCase()}
                  {f.filesize ? ` • ${formatFileSize(f.filesize)}` : ""}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Audio Formats */}
      {audioFormats.length > 0 && (
        <div>
          <h4 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
            Audio Only
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {audioFormats.map((f) => (
              <button
                key={f.format_id}
                onClick={() => onSelect(f.format_id, f.type)}
                className="px-4 py-3 bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/50 rounded-xl text-white text-sm font-medium transition-all flex flex-col items-center gap-1 group"
              >
                <span className="text-base font-bold group-hover:text-purple-400 transition-colors">
                  {f.label}
                </span>
                <span className="text-gray-500 text-xs">
                  {f.ext.toUpperCase()}
                  {f.filesize ? ` • ${formatFileSize(f.filesize)}` : ""}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
