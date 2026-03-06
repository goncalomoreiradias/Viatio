"use client";

import { useEffect, useState } from "react";
import { Itinerary, DayPlan } from "@/types";
import DayCard from "@/components/DayCard";
import EditItinerarySheet from "@/components/EditItinerarySheet";
import { List, Map as MapIcon, Loader2, Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import AddLocationSheet from "@/components/AddLocationSheet";
import dynamic from "next/dynamic";

const MapSection = dynamic(() => import("@/components/MapSection"), {
  ssr: false,
  loading: () => <div className="w-full h-full min-h-[400px] bg-bali-sand animate-pulse rounded-xl flex items-center justify-center text-gray-400">Loading map...</div>
});

type ViewMode = "list" | "map";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit State
  const [editingDay, setEditingDay] = useState<DayPlan | null>(null);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);

  useEffect(() => {
    // Check if previously authenticated in this session
    const authStatus = sessionStorage.getItem("bali_auth");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
    fetchItinerary();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "Where to?" || passwordInput === "Where to") {
      setIsAuthenticated(true);
      sessionStorage.setItem("bali_auth", "true");
    } else {
      alert("Incorrect password");
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
          <h1 className="text-3xl font-bold font-outfit text-[--color-bali-ocean] mb-6">Bali 🌴</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Enter Password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full px-4 py-3 bg-white/50 border border-black/10 rounded-xl focus:ring-2 focus:ring-[--color-bali-sage] outline-none text-center"
            />
            <button
              type="submit"
              className="w-full py-3 bg-[--color-bali-sage] hover:bg-[--color-bali-ocean] text-white font-bold rounded-xl shadow-lg transition-all"
            >
              Enter
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
          <div>
            <h1 className="text-2xl font-bold font-outfit text-bali-dark dark:text-white">Bali 🌴</h1>
            <p className="text-xs font-semibold text-bali-terra tracking-widest uppercase">15-Day Expedition</p>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:h-[calc(100vh-80px)] relative">

        {/* Map View - Normal flow on mobile, sticky to full height on Desktop */}
        <div className="w-full h-[45vh] lg:h-full lg:w-1/2 p-4 lg:p-6 lg:sticky lg:top-[73px] z-30 lg:z-0 bg-bali-sand/80 lg:bg-transparent">
          <MapSection days={itinerary.days} selectedDayId={selectedDayId} />
        </div>

        {/* Desktop Left / Mobile Bottom - Scrollable Itinerary List */}
        <div className="w-full lg:w-1/2 p-4 lg:p-8 overflow-y-visible lg:h-full relative z-10 lg:pl-0">
          {/* Day Filtering Controls */}
          <div className="mb-6 flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
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
                key={`filter-${day.id}`}
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

          <div className="space-y-6 max-w-2xl mx-auto">
            {itinerary.days.map((day) => (
              <div
                key={day.id}
                className={`transition-opacity duration-300 ${selectedDayId && selectedDayId !== day.id ? 'opacity-30' : 'opacity-100'}`}
              >
                <DayCard
                  day={day}
                  onEditDay={(d) => setEditingDay(d)}
                  onToggleComplete={toggleComplete}
                />
              </div>
            ))}
          </div>
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

      {/* FAB - Floating Action Button for Adding Data */}
      <button
        onClick={() => setIsAddLocationOpen(true)}
        className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 z-[50] w-16 h-16 bg-bali-terra text-white rounded-full shadow-2xl hover:shadow-[0_10px_40px_rgba(224,122,95,0.6)] flex items-center justify-center transition-all hover:scale-105 active:scale-95"
      >
        <Plus size={32} />
      </button>
    </main>
  );
}
