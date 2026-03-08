"use client";

import { useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type DownloadStatus =
  | "idle"
  | "queued"
  | "extracting"
  | "downloading"
  | "processing"
  | "complete"
  | "failed";

interface ProgressProps {
  status: DownloadStatus;
  progress: number;
  downloadUrl?: string;
  fileName?: string;
}

export default function Progress({
  status,
  progress,
  downloadUrl,
  fileName,
}: ProgressProps) {
  const t = useTranslations("Progress");
  const progressRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (status !== "idle") {
        gsap.fromTo(
          progressRef.current,
          { scaleY: 0, opacity: 0 },
          { scaleY: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" },
        );
      }
    },
    { dependencies: [status !== "idle"] },
  );

  useEffect(() => {
    gsap.to(barRef.current, {
      width: `${progress}%`,
      duration: 0.8,
      ease: "power2.out",
    });
  }, [progress]);

  if (status === "idle") return null;

  return (
    <div
      ref={progressRef}
      className="w-full max-w-2xl mx-auto mt-8 p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg origin-top"
    >
      <div className="flex justify-between items-center mb-4">
        <span className="text-white font-medium">
          {status === "complete" ? t("complete") : t(status)}
        </span>
        <span className="text-blue-400 font-mono">{Math.round(progress)}%</span>
      </div>

      <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
        <div
          ref={barRef}
          className={cn(
            "h-full transition-all duration-300 rounded-full bg-gradient-to-r",
            status === "failed"
              ? "from-red-500 to-pink-500"
              : "from-blue-500 to-indigo-500",
          )}
          style={{ width: "0%" }}
        />
      </div>

      {status === "complete" && downloadUrl && (
        <div className="mt-6 flex flex-col items-center">
          <p className="text-gray-300 text-sm mb-4 truncate max-w-full italic">
            {fileName}
          </p>
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            download={fileName}
            className="px-10 py-3 bg-green-500 hover:bg-green-400 text-white font-bold rounded-xl shadow-lg shadow-green-900/20 transition-all transform hover:scale-105"
          >
            {t("save")}
          </a>
        </div>
      )}

      {status === "failed" && (
        <p className="mt-4 text-center text-red-400 text-sm">{t("failed")}</p>
      )}
    </div>
  );
}
