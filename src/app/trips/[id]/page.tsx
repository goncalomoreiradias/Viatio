"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trip, DayPlan, Location as TripLocation, Expense } from "@/types";
import DayCard from "@/components/DayCard";
import EditItinerarySheet from "@/components/EditItinerarySheet";
import { ArrowLeft, Map as MapIcon, Loader2, Plus, Check, Users, MoreVertical, Edit2, Copy, Trash2, X } from "lucide-react";
import { AnimatePresence, motion, LayoutGroup } from "framer-motion";
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
import CollaborationModule from "@/components/CollaborationModule";


const MapSection = dynamic(() => import("@/components/MapSection"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100 dark:bg-gray-800 animate-pulse flex items-center justify-center">Loading map...</div>
});

type ViewMode = "list" | "map";

export default function TripPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const tripId = unwrappedParams.id;
  const router = useRouter();
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

  // Rebranding Inline Editing State
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [editedDesc, setEditedDesc] = useState("");
  const [isManagementMenuOpen, setIsManagementMenuOpen] = useState(false);

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
      setEditedTitle(data.title);
      setEditedDesc(data.description || "");
    } catch (error) {
      console.error("Failed to load itinerary", error);
    } finally {
      setLoading(false);
    }
  };


  const saveItinerary = async (newItinerary: Trip) => {
    try {
      setItinerary(newItinerary); // Optimistic UI update
      const response = await fetch(`/api/trips/${tripId}`, {
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
      if (!response.ok) throw new Error("Failed to save");
    } catch (error) {
      console.error("Failed to save itinerary", error);
      fetchItinerary(); // Rollback on error
    }
  };

  const handleUpdateTitle = async () => {
    if (!itinerary || editedTitle.trim() === "") {
        setIsEditingTitle(false);
        return;
    }
    const updated = { ...itinerary, title: editedTitle };
    await saveItinerary(updated);
    setIsEditingTitle(false);
  };

  const handleUpdateDesc = async () => {
    if (!itinerary) {
        setIsEditingDesc(false);
        return;
    }
    const updated = { ...itinerary, description: editedDesc };
    await saveItinerary(updated);
    setIsEditingDesc(false);
  };

  const handleDeleteTrip = async () => {
      if (!confirm("Tens a certeza que queres eliminar esta viagem? Esta ação é irreversível.")) return;
      try {
          const res = await fetch(`/api/trips/${tripId}`, { method: "DELETE" });
          if (res.ok) router.push("/");
      } catch (e) {
          console.error("Delete failed", e);
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
    <main className="min-h-screen bg-obsidian relative pb-24 lg:pb-0 selection:bg-accent-cobalt selection:text-white">
      {/* Header - Compact for Mobile */}
      <header className="relative z-10 glass border-b border-white/5 md:pt-16 md:pb-12 pt-10 pb-6 px-6 sm:px-12 shadow-2xl">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div className="flex items-center gap-4">
                <Link href="/" className="group p-2 md:p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/10 active:scale-95">
                  <ArrowLeft size={20} className="text-white md:w-6 md:h-6 group-hover:-translate-x-1 transition-transform" />
                </Link>
                <div className="md:hidden">
                    <LanguageToggle />
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="hidden md:block">
                    <LanguageToggle />
                </div>
                {/* Management Ellipsis */}
                <button 
                    onClick={() => setIsManagementMenuOpen(true)}
                    className="p-2 md:p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all text-gray-400 hover:text-white"
                >
                    <MoreVertical size={20} />
                </button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div className="space-y-4 md:space-y-3 flex-1">
              <div className="group relative">
                {isEditingTitle ? (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                        <input
                            autoFocus
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                            onBlur={handleUpdateTitle}
                            onKeyDown={(e) => e.key === "Enter" && handleUpdateTitle()}
                            className="text-2xl sm:text-6xl font-black font-outfit text-white bg-white/5 border-b-2 border-accent-cobalt outline-none w-full px-2 py-1 rounded-t-lg"
                        />
                    </motion.div>
                ) : (
                    <div className="flex items-center gap-3">
                        <h1 
                            onClick={() => setIsEditingTitle(true)}
                            className="text-2xl sm:text-6xl font-black font-outfit text-white tracking-tight leading-tight cursor-pointer hover:text-accent-cobalt transition-colors"
                        >
                            {itinerary.title}
                        </h1>
                        <Edit2 size={16} className="text-white/20 group-hover:text-accent-cobalt transition-colors md:w-5 md:h-5" />
                    </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 md:gap-6">
                <p className="px-4 py-1.5 md:px-5 md:py-2 bg-accent-cobalt/10 text-accent-cobalt rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] border border-accent-cobalt/20 shadow-lg backdrop-blur-md">
                    {itinerary.startDate && itinerary.endDate
                    ? `${format(new Date(itinerary.startDate), "dd MMM", { locale: dateLocale })} - ${format(new Date(itinerary.endDate), "dd MMM yyyy", { locale: dateLocale })}`
                    : t("common.no_dates")}
                </p>
                
                <div className="flex items-center gap-2">
                    <div className="scale-75 md:scale-90 origin-left">
                      <CollaborationModule 
                        participants={(itinerary.participants || []).map((p: any, i: number) => ({
                          id: p.id || `p-${i}`,
                          name: p.name || p.email.split('@')[0],
                          role: i === 0 ? "Owner" : "Editor",
                          online: i % 2 === 0
                        }))}
                        onInvite={() => {
                          const url = `${window.location.origin}/trips/join/${itinerary.inviteToken}`;
                          navigator.clipboard.writeText(url);
                          setCopiedLink(true);
                          setTimeout(() => setCopiedLink(false), 2000);
                        }}
                      />
                    </div>
                    
                    {/* Compact Invite Button for Mobile */}
                    {itinerary.inviteToken && (
                        <button
                            onClick={() => {
                                const url = `${window.location.origin}/trips/join/${itinerary.inviteToken}`;
                                navigator.clipboard.writeText(url);
                                setCopiedLink(true);
                                setTimeout(() => setCopiedLink(false), 2000);
                            }}
                            className="md:hidden flex items-center justify-center w-8 h-8 bg-white/5 border border-white/10 rounded-full text-white active:scale-90 transition-all"
                        >
                            {copiedLink ? <Check size={14} className="text-emerald-500" /> : <Plus size={14} />}
                        </button>
                    )}
                </div>
              </div>
            </div>

            {/* Desktop Only Large Invite Button */}
            {itinerary.inviteToken && (
              <button
                onClick={() => {
                  const url = `${window.location.origin}/trips/join/${itinerary.inviteToken}`;
                  navigator.clipboard.writeText(url);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="hidden md:flex items-center gap-3 px-8 py-4 bg-white text-obsidian hover:bg-gray-100 rounded-full font-black text-xs uppercase tracking-widest transition-all shadow-2xl active:scale-95 border border-white/10"
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

      {/* FAB - Desktop Only (Hidden on Mobile as it is now in Navigation) */}
      {activeTab === "itinerary" ? (
        <button
          onClick={() => setIsAddLocationOpen(true)}
          className="hidden lg:flex fixed bottom-12 right-12 z-[100] w-16 h-16 bg-accent-cobalt text-white rounded-full shadow-[0_20px_60px_-10px_rgba(46,91,255,0.7)] items-center justify-center transition-all hover:scale-110 hover:-translate-y-2 active:scale-95 border-2 border-white/30 group"
        >
          <Plus size={32} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
      ) : (
        <button
          onClick={() => setIsAddExpenseOpen(true)}
          className="hidden lg:flex fixed bottom-12 right-12 z-[100] w-16 h-16 bg-accent-indigo text-white rounded-full shadow-[0_20px_60px_-10px_rgba(99,102,241,0.7)] items-center justify-center transition-all hover:scale-110 hover:-translate-y-2 active:scale-95 border-2 border-white/30 group"
        >
          <Plus size={32} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
      )}

      {/* Management Bottom Sheet */}
      <AnimatePresence>
          {isManagementMenuOpen && (
              <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/60 backdrop-blur-sm">
                  <motion.div 
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="w-full bg-slate-900 rounded-t-[2.5rem] border-t border-white/10 p-8 pb-12 space-y-6 shadow-2xl"
                  >
                      <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-black uppercase tracking-widest text-white italic">Gestão da Viagem</h3>
                          <button onClick={() => setIsManagementMenuOpen(false)} className="p-2 bg-white/5 rounded-full"><X size={20}/></button>
                      </div>
                      
                      <div className="space-y-3">
                          <button 
                            onClick={() => { setIsEditingTitle(true); setIsManagementMenuOpen(false); }}
                            className="w-full bg-white/5 hover:bg-white/10 p-5 rounded-2xl border border-white/5 flex items-center gap-4 transition-all"
                          >
                              <div className="w-10 h-10 bg-accent-cobalt/20 rounded-xl flex items-center justify-center text-accent-cobalt">
                                  <Edit2 size={20} />
                              </div>
                              <span className="font-bold text-gray-300">Editar Nome</span>
                          </button>

                          <button 
                            onClick={() => { /* Duplicate Logic */ setIsManagementMenuOpen(false); }}
                            className="w-full bg-white/5 hover:bg-white/10 p-5 rounded-2xl border border-white/5 flex items-center gap-4 transition-all"
                          >
                              <div className="w-10 h-10 bg-accent-indigo/20 rounded-xl flex items-center justify-center text-accent-indigo">
                                  <Copy size={20} />
                              </div>
                              <span className="font-bold text-gray-300">Duplicar Roteiro</span>
                          </button>

                          <button 
                            onClick={handleDeleteTrip}
                            className="w-full bg-rose-500/10 hover:bg-rose-500/20 p-5 rounded-2xl border border-rose-500/10 flex items-center gap-4 transition-all"
                          >
                              <div className="w-10 h-10 bg-rose-500/20 rounded-xl flex items-center justify-center text-rose-500">
                                  <Trash2 size={20} />
                              </div>
                              <span className="font-bold text-rose-400">Eliminar Viagem</span>
                          </button>
                      </div>
                  </motion.div>
              </div>
          )}
      </AnimatePresence>

      <div className="fixed bottom-0 left-0 right-0 sm:sticky sm:bottom-auto sm:top-[400px] lg:top-[500px] z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <Navigation 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
            onAddClick={() => {
                if (activeTab === "itinerary") setIsAddLocationOpen(true);
                else setIsAddExpenseOpen(true);
            }}
          />
        </div>
      </div>
    </main>
  );
}
