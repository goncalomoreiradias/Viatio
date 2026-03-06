"use client";

import { useEffect, useState } from "react";
import { Itinerary, DayPlan } from "@/types";
import DayCard from "@/components/DayCard";
import EditItinerarySheet from "@/components/EditItinerarySheet";
import { List, Map as MapIcon, Loader2, Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import AddLocationSheet from "@/components/AddLocationSheet";
import AddExpenseSheet from "@/components/AddExpenseSheet";
import FinanceSection from "@/components/FinanceSection";
import Navigation from "@/components/Navigation";
import dynamic from "next/dynamic";

const MapSection = dynamic(() => import("@/components/MapSection"), {
  ssr: false,
  loading: () => <div className="w-full h-full min-h-[400px] bg-bali-sand animate-pulse rounded-xl flex items-center justify-center text-gray-400">Loading map...</div>
});

type ViewMode = "list" | "map";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"itinerary" | "finance">("itinerary");

  // Edit State
  const [editingDay, setEditingDay] = useState<DayPlan | null>(null);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  useEffect(() => {
    // Check if previously authenticated in this session
    const authStatus = sessionStorage.getItem("bali_auth");
    const storedName = sessionStorage.getItem("bali_username");
    if (authStatus === "true" && storedName) {
      setIsAuthenticated(true);
      setUserName(storedName);
    }
    fetchItinerary();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      alert("Por favor, introduz o teu nome.");
      return;
    }

    if (passwordInput === "Where to?" || passwordInput === "Where to") {
      setIsAuthenticated(true);
      sessionStorage.setItem("bali_auth", "true");
      sessionStorage.setItem("bali_username", userName.trim());

      // If we have an itinerary, ensure this user is in the participants list
      if (itinerary && !itinerary.participants?.includes(userName.trim())) {
        const updatedParticipants = [...(itinerary.participants || []), userName.trim()];
        const updatedItinerary = { ...itinerary, participants: updatedParticipants };
        await saveItinerary(updatedItinerary);
      }
    } else {
      alert("Password incorreta.");
    }
  };

  const fetchItinerary = async () => {
    try {
      const res = await fetch("/api/itinerary");
      const data = await res.json();
      setItinerary(data);
    } catch (error) {
      console.error("Failed to load itinerary", error);
    } finally {
      setLoading(false);
    }
  };

  const saveItinerary = async (newItinerary: Itinerary) => {
    try {
      setItinerary(newItinerary); // Optimistic UI update
      await fetch("/api/itinerary", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItinerary),
      });
    } catch (error) {
      console.error("Failed to save itinerary", error);
    }
  };

  const handleDayEdit = (updatedDay: DayPlan) => {
    if (!itinerary) return;
    const newDays = itinerary.days.map((d) =>
      d.id === updatedDay.id ? updatedDay : d
    );
    saveItinerary({ ...itinerary, days: newDays });
  };

  const toggleComplete = (dayId: string, locId: string) => {
    if (!itinerary) return;
    const newDays = itinerary.days.map(day => {
      if (day.id === dayId) {
        return {
          ...day,
          locations: day.locations.map(loc =>
            loc.id === locId ? { ...loc, completed: !loc.completed } : loc
          )
        };
      }
      return day;
    });
    saveItinerary({ ...itinerary, days: newDays });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[--color-bali-sand] p-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 max-w-sm w-full"
        >
          <h1 className="text-3xl font-bold font-outfit text-bali-ocean mb-2">Bem-vindo a Bali 🌴</h1>
          <p className="text-gray-500 mb-6 text-sm">Identifica-te para poderes gerir custos e planos.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              placeholder="O teu Nome"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-3 bg-white/50 border border-black/10 rounded-xl focus:ring-2 focus:ring-bali-ocean outline-none text-center font-medium"
            />
            <input
              type="password"
              placeholder="Password da Viagem"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full px-4 py-3 bg-white/50 border border-black/10 rounded-xl focus:ring-2 focus:ring-bali-ocean outline-none text-center"
            />
            <button
              type="submit"
              className="w-full py-3 bg-bali-sage hover:bg-bali-ocean text-white font-bold rounded-xl shadow-lg transition-all active:scale-95"
            >
              Entrar
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  if (loading || !itinerary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bali-sand">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Loader2 size={40} className="text-bali-sage" />
        </motion.div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-bali-sand relative pb-24 lg:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-black/5 dark:border-white/5 py-4 px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold font-outfit text-bali-dark dark:text-white">Bali 🌴</h1>
            <p className="hidden sm:block text-xs font-semibold text-bali-terra tracking-widest uppercase">15-Day Expedition</p>
          </div>
          {/* Desktop Navigation */}
          <div className="hidden sm:block">
            <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </div>
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
                  All Days
                </button>
                {itinerary.days.map((day) => (
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
                {itinerary.days.map((day) => (
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
                  .filter((day) => (selectedDayId ? day.id === selectedDayId : true))
                  .map((day) => (
                    <DayCard
                      key={day.id}
                      day={day}
                      onToggleComplete={toggleComplete}
                      onEditDay={setEditingDay}
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
          const newDays = itinerary.days.map(d =>
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
