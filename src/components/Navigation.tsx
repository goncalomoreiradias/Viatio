import { Map, Wallet, Plus } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface NavigationProps {
  activeTab: "itinerary" | "finance";
  onTabChange: (tab: "itinerary" | "finance") => void;
  onAddClick: () => void;
}

export default function Navigation({ activeTab, onTabChange, onAddClick }: NavigationProps) {
  const { t } = useI18n();

  return (
    <div className="glass bg-surface/80 border-t sm:border border-stroke pb-[env(safe-area-inset-bottom)] z-50 flex justify-between px-2 sm:px-6 items-center h-[72px] sm:h-auto sm:w-fit sm:mx-auto sm:rounded-full sm:p-2 sm:mb-12 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] backdrop-blur-xl">
      <button
        onClick={() => onTabChange("itinerary")}
        className={`flex flex-col sm:flex-row items-center gap-2 px-8 sm:px-6 py-2.5 sm:py-3 rounded-2xl sm:rounded-full transition-all flex-1 sm:flex-none justify-center relative group active:scale-90 ${activeTab === "itinerary"
          ? "text-canvas bg-accent shadow-[0_10px_30px_-5px_var(--accent)]"
          : "text-text-medium hover:text-text-high font-bold"
          }`}
      >
        <Map size={22} className={`sm:w-5 sm:h-5 transition-transform ${activeTab === "itinerary" ? "scale-110" : "group-hover:translate-y-[-2px]"}`} />
        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest leading-none">{t("nav.itinerary")}</span>
      </button>

      {/* Center "+" Button for Mobile */}
      <div className="sm:hidden -mt-12">
        <button
            onClick={onAddClick}
            className="w-16 h-16 rounded-full flex items-center justify-center text-canvas bg-accent shadow-2xl border-4 border-canvas transition-all active:scale-90"
        >
            <Plus size={32} />
        </button>
      </div>

      <div className="w-[1px] h-6 bg-stroke mx-2 hidden sm:block"></div>

      <button
        onClick={() => onTabChange("finance")}
        className={`flex flex-col sm:flex-row items-center gap-2 px-8 sm:px-6 py-2.5 sm:py-3 rounded-2xl sm:rounded-full transition-all flex-1 sm:flex-none justify-center relative group active:scale-90 ${activeTab === "finance"
          ? "text-canvas bg-accent shadow-[0_10px_30px_-5px_var(--accent)]"
          : "text-text-medium hover:text-text-high font-bold"
          }`}
      >
        <Wallet size={22} className={`sm:w-5 sm:h-5 transition-transform ${activeTab === "finance" ? "scale-110" : "group-hover:translate-y-[-2px]"}`} />
        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest leading-none">{t("nav.finance")}</span>
      </button>
    </div>
  );
}
