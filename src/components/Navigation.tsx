import { Map, Wallet } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface NavigationProps {
  activeTab: "itinerary" | "finance";
  onTabChange: (tab: "itinerary" | "finance") => void;
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const { t } = useI18n();

  return (
    <div className="glass bg-obsidian/80 border-t sm:border border-white/10 pb-safe z-50 flex justify-around items-center h-20 px-8 sm:h-auto sm:w-fit sm:mx-auto sm:rounded-full sm:p-2 sm:mb-12 shadow-2xl backdrop-blur-2xl">
      <button
        onClick={() => onTabChange("itinerary")}
        className={`flex flex-col sm:flex-row items-center gap-2 px-8 sm:px-6 py-2.5 sm:py-3 rounded-2xl sm:rounded-full transition-all flex-1 sm:flex-none justify-center relative group active:scale-90 ${activeTab === "itinerary"
          ? "text-white bg-accent-cobalt shadow-[0_10px_30px_-5px_rgba(46,91,255,0.6)] "
          : "text-gray-500 hover:text-white font-bold"
          }`}
      >
        <Map size={22} className={`sm:w-5 sm:h-5 transition-transform ${activeTab === "itinerary" ? "scale-110 rotate-3" : "group-hover:rotate-6"}`} />
        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest leading-none">{t("nav.itinerary")}</span>
      </button>

      <div className="w-[1px] h-6 bg-white/5 mx-2 hidden sm:block"></div>

      <button
        onClick={() => onTabChange("finance")}
        className={`flex flex-col sm:flex-row items-center gap-2 px-8 sm:px-6 py-2.5 sm:py-3 rounded-2xl sm:rounded-full transition-all flex-1 sm:flex-none justify-center relative group active:scale-90 ${activeTab === "finance"
          ? "text-white bg-accent-indigo shadow-[0_10px_30px_-5px_rgba(99,102,241,0.6)]"
          : "text-gray-500 hover:text-white font-bold"
          }`}
      >
        <Wallet size={22} className={`sm:w-5 sm:h-5 transition-transform ${activeTab === "finance" ? "scale-110 -rotate-3" : "group-hover:-rotate-6"}`} />
        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest leading-none">{t("nav.finance")}</span>
      </button>
    </div>
  );
}
