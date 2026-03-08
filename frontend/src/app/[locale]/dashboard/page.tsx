import { useTranslations } from "next-intl";
import DownloadHistory from "@/components/DownloadHistory";

export default function DashboardPage() {
  const t = useTranslations("Dashboard");

  return (
    <main className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            {t("title")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">{t("subtitle")}</p>
        </header>

        <section>
          <DownloadHistory />
        </section>
      </div>
    </main>
  );
}
