"use client";

import { useEffect, useState } from "react";
import { Trip, DayPlan, Location as TripLocation, Expense } from "@/types";
import DayCard from "@/components/DayCard";
import EditItinerarySheet from "@/components/EditItinerarySheet";
import { ArrowLeft, Map as MapIcon, Loader2, Plus, Check, Users } from "lucide-react";
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
  const [userName, setUserName] = useState("Várias"); // Default until loaded

  // Fetch session to get actual name
  useEffect(() => {
    fetch("/api/auth/session")
      .then(res => res.json())
      .then(data => {
        if (data?.session?.name) setUserName(data.session.name);
      })
      .catch(() => { });
  }, []);
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
    <main className="min-h-screen bg-obsidian relative pb-24 lg:pb-0 selection:bg-accent-cobalt selection:text-white">      {/* Header */}
      <header className="relative z-10 glass border-b border-white/5 pt-16 pb-12 px-8 sm:px-12 shadow-2xl">
        {/* Micro-pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="group p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/10 active:scale-95">
              <ArrowLeft size={24} className="text-white group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div className="neumorphic-inset p-1 rounded-2xl">
                <LanguageToggle />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-8"
          >
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-6xl font-black font-outfit text-white tracking-tight leading-tight">{itinerary.title}</h1>
              <div className="flex flex-wrap items-center gap-4">
                <p className="px-4 py-1.5 bg-accent-cobalt/10 text-accent-cobalt rounded-full text-xs font-black uppercase tracking-widest border border-accent-cobalt/20">
                    {itinerary.startDate && itinerary.endDate
                    ? `${format(new Date(itinerary.startDate), "dd MMM", { locale: dateLocale })} - ${format(new Date(itinerary.endDate), "dd MMM yyyy", { locale: dateLocale })}`
                    : t("common.no_dates")}
                </p>
                <p className="text-sm font-bold text-gray-400 flex items-center gap-2">
                    <Users size={14} className="text-accent-cobalt" />
                    {t("common.participants")}: {itinerary.participants?.map((p: any) => p.name || p.email).join(", ") || t("common.no_participants")}
                </p>
              </div>
            </div>

            {itinerary.inviteToken && (
              <button
                onClick={() => {
                  const url = `${window.location.origin}/trips/join/${itinerary.inviteToken}`;
                  navigator.clipboard.writeText(url);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="flex items-center gap-3 px-8 py-4 bg-white text-obsidian hover:bg-gray-100 rounded-full font-black text-xs uppercase tracking-widest transition-all shadow-2xl active:scale-95 border border-white/10"
              >
                {copiedLink ? <Check size={18} className="text-emerald-500" /> : <Plus size={18} className="text-accent-cobalt" />}
                {copiedLink ? "Link Copied!" : "Invite Collaborators"}
              </button>
            )}
          </motion.div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row relative">

        {/* --- MAP SECTION --- */}
        {/* Render Map only when Itinerary is active */}        <div className={`w-full ${activeTab === 'itinerary' ? 'block' : 'hidden'} lg:block lg:w-1/2`}>
          {/* Premium Fixed Map Layout */}
          <div className="w-full h-[35vh] lg:h-[calc(100vh-140px)] p-0 lg:p-10 sticky top-[140px] z-30 lg:z-0">
            <div className="h-full w-full lg:rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl relative">
              <MapSection days={itinerary.days} selectedDayId={selectedDayId} />
              <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/10 rounded-[3rem]" />
            </div>

            {/* Sticky Day Filters (Only on Mobile) */}
            <div className="lg:hidden absolute bottom-0 translate-y-full left-0 right-0 bg-[#141820]/95 backdrop-blur-xl px-4 py-4 border-b border-white/5 shadow-2xl z-40">
              <div className="flex overflow-x-auto gap-3 hide-scrollbar">
                <button
                  onClick={() => setSelectedDayId(null)}
                  className={`flex-shrink-0 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-xl ${selectedDayId === null
                    ? "bg-accent-cobalt text-white shadow-accent-cobalt/40 scale-105"
                    : "bg-obsidian text-gray-400 hover:text-white border border-white/10"
                    }`}
                >
                  {t("common.all_days")}
                </button>
                {itinerary.days.map((day: DayPlan) => (
                  <button
                    key={`filter-mob-${day.id}`}
                    onClick={() => setSelectedDayId(selectedDayId === day.id ? null : day.id)}
                    className={`flex-shrink-0 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-xl ${selectedDayId === day.id
                      ? "bg-accent-indigo text-white shadow-accent-indigo/40 scale-105"
                      : "bg-obsidian text-gray-400 hover:text-white border border-white/10"
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
              <div className="hidden lg:flex mb-10 overflow-x-auto pb-4 gap-3 hide-scrollbar pt-4">
                <button
                  onClick={() => setSelectedDayId(null)}
                  className={`flex-shrink-0 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all shadow-2xl ${selectedDayId === null
                    ? "bg-accent-cobalt text-white shadow-accent-cobalt/40 translate-y-[-2px]"
                    : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
                    }`}
                >
                  All Days
                </button>
                {itinerary.days.map((day: DayPlan) => (
                  <button
                    key={`filter-desk-${day.id}`}
                    onClick={() => setSelectedDayId(selectedDayId === day.id ? null : day.id)}
                    className={`flex-shrink-0 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all shadow-2xl ${selectedDayId === day.id
                      ? "bg-accent-indigo text-white shadow-accent-indigo/40 translate-y-[-2px]"
                      : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
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
          className="fixed bottom-24 sm:bottom-10 right-8 lg:bottom-12 lg:right-12 z-[30] w-16 h-16 bg-accent-cobalt text-white rounded-full shadow-[0_20px_50px_-10px_rgba(46,91,255,0.5)] flex items-center justify-center transition-all hover:scale-110 hover:-translate-y-2 active:scale-95 border-2 border-white/20 group"
        >
          <Plus size={32} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
      ) : (
        <button
          onClick={() => setIsAddExpenseOpen(true)}
          className="fixed bottom-24 sm:bottom-10 right-8 lg:bottom-12 lg:right-12 z-[30] w-16 h-16 bg-accent-indigo text-white rounded-full shadow-[0_20px_50px_-10px_rgba(99,102,241,0.5)] flex items-center justify-center transition-all hover:scale-110 hover:-translate-y-2 active:scale-95 border-2 border-white/20 group"
        >
          <Plus size={32} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
      )}

      {/* Navigation - Sticky bottom on mobile, static topish on desktop */}
      <div className="fixed bottom-0 left-0 right-0 sm:sticky sm:bottom-auto sm:top-[400px] lg:top-[500px] z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>
    </main>
  );
}
