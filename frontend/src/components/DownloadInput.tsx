"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useSocket } from "@/lib/socket";
import { ArrowDownTrayIcon } from "@heroicons/react/24/solid";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function DownloadInput() {
  const t = useTranslations("DownloadInput");
  const { socket, isConnected } = useSocket();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useGSAP(
    () => {
      // Subtle entrance animation
      gsap.from(containerRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });
    },
    { scope: containerRef },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !url.startsWith("http")) return;

    setLoading(true);

    // Animate button click
    gsap.to(buttonRef.current, {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
    });

    if (socket && isConnected) {
      const isPlaylist = url.includes("list=") || url.includes("playlist");

      if (isPlaylist) {
        socket.emit("discover_playlist", { url });
      } else {
        socket.emit("request_download", { url });
      }
    } else {
      console.error("Socket not connected");
      setLoading(false);
    }
  };

  const handleFocus = () => {
    gsap.to(containerRef.current, {
      scale: 1.02,
      duration: 0.4,
      ease: "power2.out",
      boxShadow: "0 0 25px rgba(255, 255, 255, 0.1)",
    });
  };

  const handleBlur = () => {
    gsap.to(containerRef.current, {
      scale: 1,
      duration: 0.4,
      ease: "power2.inOut",
      boxShadow: "0 0 0px rgba(255, 255, 255, 0)",
    });
  };

  return (
    <div
      ref={containerRef}
      className="w-full max-w-2xl mx-auto mt-12 p-1 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
    >
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          ref={inputRef}
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={t("placeholder")}
          className="flex-1 bg-transparent px-6 py-4 text-white placeholder-gray-400 outline-none focus:ring-0 text-lg"
          disabled={loading}
        />
        <button
          ref={buttonRef}
          type="submit"
          disabled={loading || !url}
          className={cn(
            "px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
            loading && "animate-pulse",
          )}
        >
          <ArrowDownTrayIcon className="w-5 h-5" />
          {t("button")}
        </button>
      </form>
    </div>
  );
}
