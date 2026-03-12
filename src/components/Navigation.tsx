import { Map, Wallet } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface NavigationProps {
  activeTab: "itinerary" | "finance";
  onTabChange: (tab: "itinerary" | "finance") => void;
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const { t } = useI18n();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-white/10 pb-safe z-50 flex justify-around items-center h-20 px-6 sm:h-24 sm:static sm:border-0 sm:bg-transparent sm:justify-start sm:gap-4 sm:p-0 sm:pb-0 transition-colors">
      <button
        onClick={() => onTabChange("itinerary")}
        className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-6 sm:px-5 py-2 sm:py-2.5 rounded-2xl sm:rounded-full transition-all flex-1 sm:flex-none justify-center relative group ${activeTab === "itinerary"
          ? "text-brand-primary bg-gray-100 dark:bg-white/10 sm:bg-white sm:shadow-lg sm:dark:bg-gray-800 font-black"
          : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 font-bold"
          }`}
      >
        <Map size={24} className={`sm:w-5 sm:h-5 transition-transform group-active:scale-95 ${activeTab === "itinerary" ? "scale-110" : ""}`} />
        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest mt-1 sm:mt-0">{t("nav.itinerary")}</span>
      </button>

      <button
        onClick={() => onTabChange("finance")}
        className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-6 sm:px-5 py-2 sm:py-2.5 rounded-2xl sm:rounded-full transition-all flex-1 sm:flex-none justify-center relative group ${activeTab === "finance"
          ? "text-brand-primary bg-gray-100 dark:bg-white/10 sm:bg-white sm:shadow-lg sm:dark:bg-gray-800 font-black"
          : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 font-bold"
          }`}
      >
        <Wallet size={24} className={`sm:w-5 sm:h-5 transition-transform group-active:scale-95 ${activeTab === "finance" ? "scale-110" : ""}`} />
        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest mt-1 sm:mt-0">{t("nav.finance")}</span>
      </button>
    </div>
  );
}
