"use client";

import { useEffect, useState } from "react";
import { Trip, DayPlan, Location as TripLocation, Expense } from "@/types";
import DayCard from "@/components/DayCard";
import EditItinerarySheet from "@/components/EditItinerarySheet";
import { ArrowLeft, Map as MapIcon, Loader2, Plus, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import AddLocationSheet from "@/components/AddLocationSheet";
import AddExpenseSheet from "@/components/AddExpenseSheet";
import FinanceSection from "@/components/FinanceSection";
import Navigation from "@/components/Navigation";
import { use } from "react";
import dynamic from "next/dynamic";
import { format } from "date-fns";
import { pt, enUS } from "date-fns/locale";
import { useI18n } from "@/lib/i18n";
import LanguageToggle from "@/components/LanguageToggle";
import Link from "next/link";


const MapSection = dynamic(() => import("@/components/MapSection"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100 dark:bg-gray-800 animate-pulse flex items-center justify-center">Loading map...</div>
});

type ViewMode = "list" | "map";

export default function TripPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const tripId = unwrappedParams.id;
  const [itinerary, setItinerary] = useState<any>(null); // Type loosened to allow inviteToken
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"itinerary" | "finance">("itinerary");
  const [copiedLink, setCopiedLink] = useState(false);
  const userName = "You"; // Temporary mock until session state is natively hydrated to the context

  // Edit State
  const [editingDay, setEditingDay] = useState<DayPlan | null>(null);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [newExpenseInitialParticipant, setNewExpenseInitialParticipant] = useState("");

  // i18n
  const { t, language } = useI18n();
  const dateLocale = language === "pt" ? pt : enUS;

  const [activeDayId, setActiveDayId] = useState<string | null>(null);
  useEffect(() => {
    fetchItinerary();
  }, []);

  const fetchItinerary = async () => {
    try {
      const res = await fetch(`/api/trips/${tripId}`);
      if (res.status === 401) {
        window.location.href = `/login?callbackUrl=/trips/${tripId}`;
        return;
      }
      if (res.status === 403) {
        window.location.href = "/"; // Unauthorized for this trip
        return;
      }
      if (!res.ok) throw new Error("Trip not found");
      const data = await res.json();
      setItinerary(data);
    } catch (error) {
      console.error("Failed to load itinerary", error);
    } finally {
      setLoading(false);
    }
  };


  const saveItinerary = async (newItinerary: Trip) => {
    try {
      setItinerary(newItinerary); // Optimistic UI update
      await fetch(`/api/trips/${tripId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newItinerary,
          days: newItinerary.days.map((d: DayPlan) => {
            return {
              ...d,
              locations: d.locations.map((loc: TripLocation) => {
                return { ...loc };
              }),
            };
          }),
          expenses: newItinerary.expenses?.map((exp: Expense) => {
            return { ...exp };
          }),
        }),
      });
    } catch (error) {
      console.error("Failed to save itinerary", error);
    }
  };

  const handleDayEdit = (updatedDay: DayPlan) => {
    if (!itinerary) return;
    const newDays = itinerary.days.map((d: DayPlan) =>
      d.id === updatedDay.id ? updatedDay : d
    );
    saveItinerary({ ...itinerary, days: newDays });
  };

  const toggleComplete = (dayId: string, locId: string) => {
    if (!itinerary) return;
    const newDays = itinerary.days.map((day: DayPlan) => {
      if (day.id === dayId) {
        return {
          ...day,
          locations: day.locations.map((loc: TripLocation) =>
            loc.id === locId ? { ...loc, completed: !loc.completed } : loc
          )
        };
      }
      return day;
    });
    saveItinerary({ ...itinerary, days: newDays });
  };

  const handleAddLocationClick = (dayId: string) => {
    // Optionally preserve dayId if your sheet wants it. For now, we just open the sheet.
    setIsAddLocationOpen(true);
  };

  if (loading || !itinerary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bali-sand">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Loader2 size={40} className="text-brand-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-brand-bg relative pb-24 lg:pb-0">
      {/* Header */}
      <header className="relative z-10 p-6 pt-12 text-white bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="p-2 bg-black/20 backdrop-blur-md rounded-full hover:bg-black/40 transition">
            <ArrowLeft size={24} />
          </Link>
          <LanguageToggle />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-extrabold font-outfit mb-2">{itinerary.title}</h1>
            <p className="text-lg font-medium text-white/90">
              {itinerary.startDate && itinerary.endDate
                ? `${format(new Date(itinerary.startDate), "dd MMM", { locale: dateLocale })} - ${format(new Date(itinerary.endDate), "dd MMM yyyy", { locale: dateLocale })}`
                : t("common.no_dates")}
            </p>
            <p className="text-sm text-white/70 mt-1">{t("common.participants")}: {itinerary.participants?.map((p: any) => p.name || p.email).join(", ") || t("common.no_participants")}</p>
          </div>

          {itinerary.inviteToken && (
            <button
              onClick={() => {
                const url = `${window.location.origin}/trips/join/${itinerary.inviteToken}`;
                navigator.clipboard.writeText(url);
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2000);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur border border-white/10 rounded-xl text-white font-bold text-sm transition-all"
            >
              {copiedLink ? <Check size={16} className="text-emerald-400" /> : <Plus size={16} />}
              {copiedLink ? "Link Copied!" : "Invite Collaborators"}
            </button>
          )}
        </motion.div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row relative">

        {/* --- MAP SECTION --- */}
        {/* Render Map only when Itinerary is active */}
        <div className={`w-full ${activeTab === 'itinerary' ? 'block' : 'hidden'} lg:block lg:w-1/2`}>
          {/* Premium Fixed Map Layout: 35vh height, sticky on mobile with shadow */}
          <div className="w-full h-[35vh] lg:h-[calc(100vh-80px)] p-0 lg:p-6 sticky top-[73px] z-30 lg:z-0 shadow-md lg:shadow-none bg-bali-sand/80 lg:bg-transparent">
            <div className="h-full w-full lg:rounded-2xl overflow-hidden shadow-inner">
              <MapSection days={itinerary.days} selectedDayId={selectedDayId} />
            </div>

            {/* Sticky Day Filters (Only on Mobile, right below the map) */}
            <div className="lg:hidden absolute bottom-0 translate-y-full left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-4 py-3 border-b border-gray-200 dark:border-gray-800 shadow-sm z-40">
              <div className="flex overflow-x-auto gap-2 hide-scrollbar">
                <button
                  onClick={() => setSelectedDayId(null)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-sm ${selectedDayId === null
                    ? "bg-bali-ocean text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 border border-transparent"
                    }`}
                >
                  {t("common.all_days")}
                </button>
                {itinerary.days.map((day: DayPlan) => (
                  <button
                    key={`filter-mob-${day.id}`}
                    onClick={() => setSelectedDayId(selectedDayId === day.id ? null : day.id)}
                    className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-sm ${selectedDayId === day.id
                      ? "bg-bali-terra text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 border border-transparent"
                      }`}
                  >
                    Day {day.dayNumber}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* --- CONTENT SECTION --- */}
        {/* Desktop Left / Mobile Bottom - Scrollable Area depending on active tab */}
        <div className="w-full lg:w-1/2 p-4 lg:p-8 pt-16 lg:pt-8 overflow-y-visible lg:h-[calc(100vh-80px)] lg:overflow-y-auto relative z-10 lg:pl-0">

          {activeTab === "itinerary" ? (
            <>
              {/* Desktop Day Filters (Hidden on Mobile) */}
              <div className="hidden lg:flex mb-6 overflow-x-auto pb-2 gap-2 hide-scrollbar">
                <button
                  onClick={() => setSelectedDayId(null)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap shadow-sm ${selectedDayId === null
                    ? "bg-bali-ocean text-white"
                    : "bg-white/50 text-gray-600 hover:bg-white border border-gray-200"
                    }`}
                >
                  All Days
                </button>
                {itinerary.days.map((day: DayPlan) => (
                  <button
                    key={`filter-desk-${day.id}`}
                    onClick={() => setSelectedDayId(selectedDayId === day.id ? null : day.id)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap shadow-sm ${selectedDayId === day.id
                      ? "bg-bali-terra text-white"
                      : "bg-white/50 text-gray-600 hover:bg-white border border-gray-200"
                      }`}
                  >
                    Day {day.dayNumber}
                  </button>
                ))}
              </div>

              {/* Day Cards */}
              <AnimatePresence mode="popLayout">
                {itinerary.days
                  .filter((day: DayPlan) => (selectedDayId ? day.id === selectedDayId : true))
                  .map((day: DayPlan) => (
                    <DayCard
                      key={day.id}
                      day={day}
                      onEdit={setEditingDay}
                      onToggleLocation={toggleComplete}
                      onAddLocation={handleAddLocationClick}
                    />
                  ))}
              </AnimatePresence>
            </>
          ) : (
            /* Finance Dashboard View */
            <div className="pt-2 lg:pt-0">
              <FinanceSection
                itinerary={itinerary}
                onSave={saveItinerary}
                currentUser={userName}
              />
            </div>
          )}
        </div>
      </div>

      {/* Editing Drawer */}
      {editingDay && (
        <EditItinerarySheet
          day={editingDay}
          isOpen={!!editingDay}
          onClose={() => setEditingDay(null)}
          onSave={handleDayEdit}
        />
      )}

      {/* Add Location Sheet */}
      <AddLocationSheet
        isOpen={isAddLocationOpen}
        onClose={() => setIsAddLocationOpen(false)}
        days={itinerary?.days || []}
        onAdd={(dayId, location) => {
          if (!itinerary) return;
          const newDays = itinerary.days.map((d: DayPlan) =>
            d.id === dayId ? { ...d, locations: [...d.locations, location] } : d
          );
          saveItinerary({ ...itinerary, days: newDays });
        }}
      />

      {/* Add Finance Sheet */}
      <AddExpenseSheet
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        participants={itinerary?.participants || [userName]}
        currentUser={userName}
        onAdd={(expense) => {
          if (!itinerary) return;
          const currentExpenses = itinerary.expenses || [];
          saveItinerary({ ...itinerary, expenses: [...currentExpenses, expense] });
        }}
      />

      {/* FAB - Dynamically changes based on Active Tab */}
      {activeTab === "itinerary" ? (
        <button
          onClick={() => setIsAddLocationOpen(true)}
          className="fixed bottom-24 sm:bottom-6 right-6 lg:bottom-10 lg:right-10 z-[30] w-14 h-14 sm:w-16 sm:h-16 bg-bali-terra text-white rounded-full shadow-2xl hover:shadow-[0_8px_30px_rgba(224,122,95,0.6)] flex items-center justify-center transition-all hover:scale-105 active:scale-95 border-2 border-white/20"
        >
          <Plus size={28} />
        </button>
      ) : (
        <button
          onClick={() => setIsAddExpenseOpen(true)}
          className="fixed bottom-24 sm:bottom-6 right-6 lg:bottom-10 lg:right-10 z-[30] w-14 h-14 sm:w-16 sm:h-16 bg-bali-ocean text-white rounded-full shadow-2xl hover:shadow-[0_8px_30px_rgba(43,158,179,0.6)] flex items-center justify-center transition-all hover:scale-105 active:scale-95 border-2 border-white/20"
        >
          <Plus size={28} />
        </button>
      )}

      {/* Mobile Bottom Navigation */}
      <div className="sm:hidden">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </main>
  );
}
