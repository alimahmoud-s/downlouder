"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import DownloadInput from "@/components/DownloadInput";
import Progress, { DownloadStatus } from "@/components/Progress";
import FormatSelector from "@/components/FormatSelector";
import { useSocket } from "@/lib/socket";
import { createClient } from "@/utils/supabase/client";

const AdSensePlaceholder = dynamic(
  () => import("@/components/AdSensePlaceholder"),
);
const PlaylistTable = dynamic(() => import("@/components/PlaylistTable"));

interface FormatInfo {
  url: string;
  title: string;
  thumbnail?: string;
  duration?: number;
  formats: Array<{
    format_id: string;
    ext: string;
    label: string;
    type: "video" | "audio";
    height?: number;
    filesize?: number;
    tbr?: number;
  }>;
}

export default function IndexPage() {
  const t = useTranslations("Index");
  const { socket, isConnected } = useSocket();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [status, setStatus] = useState<DownloadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | undefined>();
  const [fileName, setFileName] = useState<string | undefined>();
  const [playlistItems, setPlaylistItems] = useState<any[] | null>(null);
  const [formatInfo, setFormatInfo] = useState<FormatInfo | null>(null);

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(profile);
      }
    }
    getUser();
  }, [supabase]);

  useEffect(() => {
    if (!socket) return;

    socket.on(
      "download_progress",
      (data: { status: string; progress: number }) => {
        setStatus(data.status as DownloadStatus);
        setProgress(data.progress);
      },
    );

    socket.on("formats_available", (data: FormatInfo) => {
      setFormatInfo(data);
      setStatus("idle"); // Hide progress bar, show format selector
      setProgress(0);
    });

    socket.on(
      "download_complete",
      (data: { url: string; title: string; ext: string }) => {
        setStatus("complete");
        setProgress(100);
        setDownloadUrl(data.url);
        setFileName(`${data.title}.${data.ext}`);
        setFormatInfo(null); // Hide format selector
      },
    );

    socket.on("playlist_discovered", (data: { items: any[] }) => {
      setPlaylistItems(data.items);
      setStatus("idle");
    });

    socket.on("download_failed", (data: { error: string }) => {
      setStatus("failed");
      setProgress(0);
      setFormatInfo(null);
      console.error("Download failed:", data.error);
    });

    return () => {
      socket.off("download_progress");
      socket.off("formats_available");
      socket.off("download_complete");
      socket.off("playlist_discovered");
      socket.off("download_failed");
    };
  }, [socket]);

  const handleFormatSelect = (format_id: string, type: string) => {
    if (!socket || !formatInfo) return;

    setFormatInfo(null); // Hide format selector
    setStatus("downloading");
    setProgress(30);

    socket.emit("start_download", {
      url: formatInfo.url,
      format_id,
      type,
    });
  };

  const handleBulkDownload = (urls: string[]) => {
    if (!socket) return;
    urls.forEach((url) => {
      socket.emit("request_download", { url, user_id: user?.id });
    });
    setPlaylistItems(null);
    setStatus("processing");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950 text-white selection:bg-blue-500/30">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-4xl text-center space-y-6 py-20">
        <h1 className="text-5xl md:text-7xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
          {t("title")}
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto">
          {t("description")}
        </p>

        <div className="pt-8">
          {!playlistItems && !formatInfo && <DownloadInput />}

          {playlistItems && (
            <div className="mt-12 bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-2xl">
              <PlaylistTable
                items={playlistItems}
                onDownloadSelected={handleBulkDownload}
              />
            </div>
          )}

          {/* Format Selector */}
          {formatInfo && (
            <FormatSelector
              title={formatInfo.title}
              thumbnail={formatInfo.thumbnail}
              duration={formatInfo.duration}
              formats={formatInfo.formats}
              onSelect={handleFormatSelect}
            />
          )}

          <Progress
            status={status}
            progress={progress}
            downloadUrl={downloadUrl}
            fileName={fileName}
          />
        </div>

        {/* AdSense Placeholder for Free Users */}
        {!playlistItems && profile?.tier !== "pro" && <AdSensePlaceholder />}

        {!isConnected && (
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-yellow-500/80 bg-yellow-500/5 px-4 py-2 rounded-full border border-yellow-500/10">
            <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            Connecting to worker...
          </div>
        )}
      </div>
    </main>
  );
}
