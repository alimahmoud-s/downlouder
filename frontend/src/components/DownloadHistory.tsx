"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

interface DownloadJob {
  id: string;
  url: string;
  status: string;
  created_at: string;
  media_title?: string;
}

export default function DownloadHistory() {
  const t = useTranslations("History");
  const [jobs, setJobs] = useState<DownloadJob[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchJobs() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("download_jobs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setJobs(data);
      }
      setLoading(false);
    }

    fetchJobs();
  }, [supabase]);

  useGSAP(() => {
    if (!loading && jobs.length > 0) {
      gsap.from(".history-row", {
        opacity: 0,
        y: 10,
        stagger: 0.05,
        duration: 0.5,
        ease: "power2.out",
      });
    }
  }, [loading, jobs]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg w-full"
          />
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>{useTranslations("Dashboard")("empty")}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md"
    >
      <table className="w-full text-left rtl:text-right">
        <thead className="text-xs uppercase text-gray-500 bg-gray-50/50 dark:bg-gray-800/50">
          <tr>
            <th className="px-6 py-4">{t("url")}</th>
            <th className="px-6 py-4">{t("status")}</th>
            <th className="px-6 py-4">{t("date")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {jobs.map((job) => (
            <tr
              key={job.id}
              className="history-row hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <td className="px-6 py-4 max-w-xs truncate font-medium text-gray-900 dark:text-gray-100">
                {job.media_title || job.url}
              </td>
              <td className="px-6 py-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    job.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : job.status === "failed"
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {t(job.status)}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {new Date(job.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
