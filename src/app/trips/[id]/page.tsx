"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trip, DayPlan, Location as TripLocation, Expense } from "@/types";
import DayCard from "@/components/DayCard";
import EditItinerarySheet from "@/components/EditItinerarySheet";
import { ArrowLeft, Map as MapIcon, Loader2, Plus, Check, Users, MoreVertical, Edit2, Copy, Trash2, X, Calendar } from "lucide-react";
import { AnimatePresence, motion, LayoutGroup } from "framer-motion";
import AddLocationSheet from "@/components/AddLocationSheet";
import AddExpenseSheet from "@/components/AddExpenseSheet";
import DatePickerModal from "@/components/DatePickerModal";
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
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import AIPlannerModal from "@/components/AIPlannerModal";
import { Sparkles } from "lucide-react";


const MapSection = dynamic(() => import("@/components/MapSection"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-surface animate-pulse flex items-center justify-center text-text-medium font-black uppercase tracking-widest text-[10px]">Viatio...</div>
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
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
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
  const [isAIPlannerOpen, setIsAIPlannerOpen] = useState(false);
  
  const isAnySheetOpen = !!editingDay || isAddLocationOpen || isAddExpenseOpen || isManagementMenuOpen || isAIPlannerOpen || isDatePickerOpen;

  // DND Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8,
        },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

      // Auto-resolve coordinates for all locations with Maps URLs
      autoResolveCoordinates(data);
    } catch (error) {
      console.error("Failed to load itinerary", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Automatically resolves coordinates for all locations with mapsUrl but missing/default coords.
   * Uses sessionStorage to cache resolved URLs and avoid redundant API calls.
   */
  const autoResolveCoordinates = async (tripData: any) => {
    const cacheKey = `viatio_coords_${tripId}`;
    let cache: Record<string, { lat: number; lng: number }> = {};

    // Load cache from sessionStorage
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) cache = JSON.parse(cached);
    } catch {}

    let hasUpdates = false;
    const updatedDays = await Promise.all(
      tripData.days.map(async (day: DayPlan) => {
        const updatedLocations = await Promise.all(
          day.locations.map(async (loc: TripLocation) => {
            if (!loc.mapsUrl) return loc;

            // Check if coords are default/invalid
            const isDefault = (loc.lat === 0 && loc.lng === 0) ||
              (loc.lat === -8.4 && loc.lng === 115.2) ||
              (Math.abs(loc.lat) < 0.01 && Math.abs(loc.lng) < 0.01);
            
            if (!isDefault) return loc; // Already has valid coords

            // Check cache first
            if (cache[loc.mapsUrl]) {
              hasUpdates = true;
              return { ...loc, lat: cache[loc.mapsUrl].lat, lng: cache[loc.mapsUrl].lng };
            }

            // Resolve the URL
            try {
              let url = loc.mapsUrl;
              const isShort = url.includes("goo.gl") || url.includes("maps.app") || url.includes("bit.ly");
              
              // Try direct extraction first
              const { extractCoordsFromUrl } = await import("@/lib/maps");
              let coords = extractCoordsFromUrl(url);

              // If direct fails and it's a short URL, resolve it
              if (!coords && isShort) {
                const res = await fetch("/api/resolve-url", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ url })
                });
                const data = await res.json();
                if (data.resolvedUrl) {
                  coords = extractCoordsFromUrl(data.resolvedUrl);
                }
              }

              if (coords) {
                cache[loc.mapsUrl] = coords;
                hasUpdates = true;
                return { ...loc, lat: coords.lat, lng: coords.lng };
              }
            } catch (err) {
              console.warn(`Failed to resolve URL for ${loc.name}:`, err);
            }

            return loc;
          })
        );
        return { ...day, locations: updatedLocations };
      })
    );

    // Save cache
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify(cache));
    } catch {}

    // Auto-save if any coordinates were updated
    if (hasUpdates) {
      const updated = { ...tripData, days: updatedDays };
      setItinerary(updated);
      // Persist to DB silently
      try {
        await fetch(`/api/trips/${tripId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        });
      } catch (err) {
        console.error("Failed to auto-save resolved coordinates:", err);
      }
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

  const handleUpdateDates = async (start: string, end: string) => {
    if (!itinerary) return;
    
    // Calculate number of days
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    let newDays = [...itinerary.days];
    
    // If we have more days now, add them
    if (diffDays > newDays.length) {
        for (let i = newDays.length + 1; i <= diffDays; i++) {
            newDays.push({
                id: `day-${Date.now()}-${i}`,
                dayNumber: i,
                title: `${t("nav.day")} ${i}`,
                locations: [],
                tripId: tripId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }
    }

    const updated = { 
        ...itinerary, 
        startDate: start, 
        endDate: end,
        days: newDays
    };
    await saveItinerary(updated);
  };

  const handleDeleteTrip = async () => {
    if (!confirm(t("trip.deleteConfirmation"))) return;
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

  const handleAddDay = async () => {
    if (!itinerary) return;
    const nextDayNumber = itinerary.days.length + 1;
    const newDay: DayPlan = {
        id: `new-day-${Date.now()}`,
        dayNumber: nextDayNumber,
        title: `${t("nav.day")} ${nextDayNumber}`,
        locations: [],
        tripId: tripId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    const updated = { ...itinerary, days: [...itinerary.days, newDay] };
    await saveItinerary(updated);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
        const oldIndex = itinerary.days.findIndex((d: DayPlan) => d.id === active.id);
        const newIndex = itinerary.days.findIndex((d: DayPlan) => d.id === over.id);

        const reorderedDays = arrayMove(itinerary.days, oldIndex, newIndex).map((day: any, idx) => ({
            ...day,
            dayNumber: idx + 1
        }));

        const updated = { ...itinerary, days: reorderedDays };
        saveItinerary(updated);
    }
  };

  const handleMoveLocation = async (locationId: string, targetDayId: string) => {
    if (!itinerary) return;
    
    let movedLocation: any | undefined;
    const updatedDays = itinerary.days.map((day: any) => {
        const locIndex = day.locations.findIndex((l: any) => l.id === locationId);
        if (locIndex !== -1) {
            movedLocation = day.locations[locIndex];
            return {
                ...day,
                locations: day.locations.filter((l: any) => l.id !== locationId)
            };
        }
        return day;
    }).map((day: any) => {
        if (day.id === targetDayId && movedLocation) {
            return {
                ...day,
                locations: [...day.locations, movedLocation]
            };
        }
        return day;
    });

    if (movedLocation) {
        const updated = { ...itinerary, days: updatedDays };
        await saveItinerary(updated);
        setEditingDay(null); 
    }
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
    <main className="min-h-screen bg-canvas relative pb-24 lg:pb-0 selection:bg-accent/20 selection:text-accent">
      {/* Date Picker Modal - rendered at top level for proper overlay */}
      <DatePickerModal 
          isOpen={isDatePickerOpen}
          onClose={() => setIsDatePickerOpen(false)}
          onSave={(start, end) => handleUpdateDates(start, end)}
          initialStart={itinerary.startDate ? new Date(itinerary.startDate).toISOString().split('T')[0] : ""}
          initialEnd={itinerary.endDate ? new Date(itinerary.endDate).toISOString().split('T')[0] : ""}
      />

      {/* Header - Compact Single Row */}
      <header className="relative z-10 bg-surface/50 backdrop-blur-md border-b border-stroke pt-4 pb-4 px-4 sm:px-8 shadow-2xl">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(var(--text-high)_1px,transparent_1px)] [background-size:20px_20px]" />
        
        {isAnySheetOpen && <div className="fixed inset-0 z-40 bg-black/5" />}

        <div className="max-w-7xl mx-auto relative z-10 flex items-center gap-3 md:gap-4">
          {/* Back Button */}
          <Link href="/" className="group p-2 bg-surface/50 hover:bg-surface rounded-full transition-all border border-stroke active:scale-95 flex-shrink-0">
            <ArrowLeft size={18} className="text-text-high group-hover:-translate-x-1 transition-transform" />
          </Link>

          {/* Title - Editable Inline */}
          <div className="flex-1 min-w-0 group cursor-pointer" onClick={() => !isEditingTitle && setIsEditingTitle(true)}>
            {isEditingTitle ? (
              <input
                autoFocus
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleUpdateTitle}
                onKeyDown={(e) => e.key === "Enter" && handleUpdateTitle()}
                onClick={(e) => e.stopPropagation()}
                className="text-lg md:text-2xl font-black font-outfit text-text-high bg-canvas/50 border-b-2 border-accent outline-none w-full px-2 py-1 rounded-t-lg"
              />
            ) : (
              <div className="flex items-center gap-2 min-w-0">
                <h1 className="text-lg md:text-2xl font-black font-outfit text-text-high tracking-tight leading-tight truncate hover:text-accent transition-colors">
                  {itinerary.title}
                </h1>
                <Edit2 size={12} className="text-text-medium/50 group-hover:text-accent transition-colors flex-shrink-0" />
              </div>
            )}
          </div>

          {/* Date Pill */}
          <button 
            onClick={() => setIsDatePickerOpen(true)}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-canvas hover:bg-stroke text-text-high rounded-full border border-stroke transition-all text-[10px] font-black uppercase tracking-widest active:scale-95 flex-shrink-0"
          >
            <Calendar size={14} />
            <span>{itinerary.startDate && itinerary.endDate ? `${format(new Date(itinerary.startDate), "dd MMM", { locale: dateLocale })} - ${format(new Date(itinerary.endDate), "dd MMM yyyy", { locale: dateLocale })}` : t("trip.setDates")}</span>
          </button>

          {/* Collaboration Module */}
          <div className="flex-shrink-0">
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

          {/* Language Toggle (desktop) */}
          <div className="hidden md:block flex-shrink-0">
            <LanguageToggle />
          </div>

          {/* Management Menu */}
          <button 
            onClick={() => setIsManagementMenuOpen(true)}
            className="p-2 bg-surface/50 hover:bg-surface rounded-full border border-stroke transition-all text-text-medium hover:text-text-high flex-shrink-0"
          >
            <MoreVertical size={18} />
          </button>
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
                    ? "bg-accent text-canvas shadow-accent/40 scale-105"
                    : "bg-canvas text-text-medium hover:text-text-high border border-stroke"
                    }`}
                >
                  {t("common.all_days")}
                </button>
                {itinerary.days.map((day: DayPlan) => (
                  <button
                    key={`filter-mob-${day.id}`}
                    onClick={() => setSelectedDayId(selectedDayId === day.id ? null : day.id)}
                    className={`flex-shrink-0 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-xl ${selectedDayId === day.id
                      ? "bg-accent text-canvas shadow-accent/40 scale-105"
                      : "bg-canvas text-text-medium hover:text-text-high border border-stroke"
                      }`}
                  >
                    {t("nav.day")} {day.dayNumber}
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
                    ? "bg-accent text-canvas shadow-accent/40 translate-y-[-2px]"
                    : "bg-surface text-text-medium hover:text-text-high border border-stroke"
                    }`}
                >
                  {t("common.all_days")}
                </button>
                {itinerary.days.map((day: DayPlan) => (
                  <button
                    key={`filter-desk-${day.id}`}
                    onClick={() => setSelectedDayId(selectedDayId === day.id ? null : day.id)}
                    className={`flex-shrink-0 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all shadow-2xl ${selectedDayId === day.id
                      ? "bg-accent text-canvas shadow-accent/40 translate-y-[-2px]"
                      : "bg-surface text-text-medium hover:text-text-high border border-stroke"
                      }`}
                  >
                    {t("nav.day")} {day.dayNumber}
                  </button>
                ))}
              </div>

              {/* Day Cards with Reordering */}
              {itinerary.days.length > 0 ? (
                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext 
                    items={itinerary.days.map((d: any) => d.id)}
                    strategy={verticalListSortingStrategy}
                  >
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
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 px-10 border-2 border-dashed border-stroke rounded-[3rem] bg-surface/30">
                  <div className="w-20 h-20 bg-accent/5 rounded-full flex items-center justify-center mb-6">
                    <Plus size={40} className="text-accent/30" />
                  </div>
                  <h3 className="text-xl font-black text-text-medium uppercase tracking-widest mb-4 italic">{t("common.no_days") || "Sem dias planeados"}</h3>
                  <button 
                    onClick={handleAddDay}
                    className="btn-primary px-10 py-4 text-xs tracking-[0.2em]"
                  >
                    + {t("trip.addFirstDay") || "Adicionar Primeiro Dia"}
                  </button>
                </div>
              )}

              {itinerary.days.length > 0 && (
                <div className="mt-10 flex justify-center">
                    <button 
                        onClick={handleAddDay}
                        className="group flex flex-col items-center gap-4 py-8 px-20 border-2 border-dashed border-stroke hover:border-accent/40 rounded-[3rem] transition-all bg-surface/20"
                    >
                        <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                            <Plus size={24} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-medium group-hover:text-accent transition-colors">ADICIONAR DIA {itinerary.days.length + 1}</span>
                    </button>
                </div>
              )}
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
          allDays={itinerary.days}
          isOpen={!!editingDay}
          onClose={() => setEditingDay(null)}
          onSave={handleDayEdit}
          onMoveLocation={handleMoveLocation}
          bucketListUrls={itinerary.owner?.plan === "FREE" ? [] : itinerary.bucketListUrls}
          bucketListItems={itinerary.owner?.plan === "FREE" ? [] : (itinerary.bucketListItems || [])}
          onRefreshBucketList={async () => {
            const res = await fetch(`/api/trips/${tripId}/bucket-list`, { method: 'POST' });
            if (res.ok) {
              const data = await res.json();
              setItinerary((prev: any) => ({ ...prev, bucketListItems: data.items }));
            }
          }}
        />
      )}

      {/* Add Location Sheet */}
      <AddLocationSheet
        isOpen={isAddLocationOpen}
        onClose={() => setIsAddLocationOpen(false)}
        days={itinerary?.days || []}
        bucketListUrls={itinerary?.owner?.plan === "FREE" ? [] : itinerary?.bucketListUrls}
        bucketListItems={itinerary?.owner?.plan === "FREE" ? [] : (itinerary?.bucketListItems || [])}
        onRefreshBucketList={async () => {
          const res = await fetch(`/api/trips/${tripId}/bucket-list`, { method: 'POST' });
          if (res.ok) {
            const data = await res.json();
            setItinerary((prev: any) => ({ ...prev, bucketListItems: data.items }));
          }
        }}
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
          onClick={() => itinerary?.days.length > 0 ? setIsAddLocationOpen(true) : handleAddDay()}
          className="hidden lg:flex fixed bottom-12 right-12 z-[100] w-16 h-16 bg-accent text-canvas rounded-full shadow-2xl items-center justify-center transition-all hover:scale-110 hover:-translate-y-2 active:scale-95 border-2 border-canvas/30 group"
        >
          <Plus size={32} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
      ) : (
        <button
          onClick={() => setIsAddExpenseOpen(true)}
          className="hidden lg:flex fixed bottom-12 right-12 z-[100] w-16 h-16 bg-accent text-canvas rounded-full shadow-2xl items-center justify-center transition-all hover:scale-110 hover:-translate-y-2 active:scale-95 border-2 border-canvas/30 group"
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
                    className="w-full bg-surface rounded-t-[2.5rem] border-t border-stroke p-8 pb-12 space-y-6 shadow-2xl"
                  >
                      <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-black uppercase tracking-widest text-text-high italic">{t("trip.management")}</h3>
                          <button onClick={() => setIsManagementMenuOpen(false)} className="p-2 bg-surface hover:bg-stroke rounded-full transition-colors"><X size={20} className="text-text-high"/></button>
                      </div>
                      
                      <div className="space-y-3">
                          <button 
                            onClick={() => { setIsAIPlannerOpen(true); setIsManagementMenuOpen(false); }}
                            className="w-full bg-gradient-to-r from-brand-indigo/10 to-brand-purple/10 hover:from-brand-indigo/20 hover:to-brand-purple/20 p-5 rounded-2xl border border-brand-indigo/20 flex items-center gap-4 transition-all"
                          >
                              <div className="w-10 h-10 bg-gradient-to-br from-brand-indigo to-brand-purple rounded-xl flex items-center justify-center text-white">
                                  <Sparkles size={20} />
                              </div>
                              <span className="font-bold text-text-high">AI Architect</span>
                          </button>

                          <button 
                            onClick={() => { setIsDatePickerOpen(true); setIsManagementMenuOpen(false); }}
                            className="w-full bg-canvas hover:bg-stroke p-5 rounded-2xl border border-stroke flex items-center gap-4 transition-all md:hidden"
                          >
                              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent border border-accent/20">
                                  <Calendar size={20} />
                              </div>
                              <span className="font-bold text-text-medium">{itinerary.startDate && itinerary.endDate ? `${format(new Date(itinerary.startDate), "dd MMM", { locale: dateLocale })} - ${format(new Date(itinerary.endDate), "dd MMM yyyy", { locale: dateLocale })}` : t("trip.setDates")}</span>
                          </button>

                          <button 
                            onClick={() => { setIsEditingTitle(true); setIsManagementMenuOpen(false); }}
                            className="w-full bg-canvas hover:bg-stroke p-5 rounded-2xl border border-stroke flex items-center gap-4 transition-all"
                          >
                              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent border border-accent/20">
                                  <Edit2 size={20} />
                              </div>
                              <span className="font-bold text-text-medium">{t("trip.editName")}</span>
                          </button>

                          <button 
                            onClick={() => { /* Duplicate Logic */ setIsManagementMenuOpen(false); }}
                            className="w-full bg-canvas hover:bg-stroke p-5 rounded-2xl border border-stroke flex items-center gap-4 transition-all"
                          >
                              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent border border-accent/20">
                                  <Copy size={20} />
                              </div>
                              <span className="font-bold text-text-medium">{t("trip.duplicate")}</span>
                          </button>

                          {/* Bucket List URLs */}
                          <div className="w-full bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/20 space-y-3">
                              <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                                      📍
                                  </div>
                                  <div>
                                      <span className="font-bold text-text-medium block">Bucket List (Maps)</span>
                                      <span className="text-[8px] text-text-dim font-bold">Um link por linha</span>
                                  </div>
                              </div>
                              <textarea
                                  placeholder={"Cola links de listas do Google Maps...\nUm link por linha"}
                                  defaultValue={(itinerary.bucketListUrls || []).join("\n")}
                                  onBlur={(e) => {
                                      const urls = e.target.value.split("\n").map((u: string) => u.trim()).filter(Boolean);
                                      saveItinerary({ ...itinerary, bucketListUrls: urls });
                                  }}
                                  rows={3}
                                  className="w-full bg-canvas/50 border border-stroke rounded-xl px-4 py-3 text-xs font-bold text-text-medium placeholder:text-text-dim/40 focus:ring-1 focus:ring-emerald-500/30 outline-none resize-none"
                              />
                              {(itinerary.bucketListUrls?.length > 0) && (
                                  <div className="flex items-center gap-2">
                                      <span className="text-[8px] font-bold text-emerald-500">{itinerary.bucketListItems?.length || 0} pontos carregados</span>
                                  </div>
                              )}
                          </div>

                          <button 
                            onClick={handleDeleteTrip}
                            className="w-full bg-rose-500/10 hover:bg-rose-500/20 p-5 rounded-2xl border border-rose-500/10 flex items-center gap-4 transition-all"
                          >
                              <div className="w-10 h-10 bg-rose-500/20 rounded-xl flex items-center justify-center text-rose-500">
                                  <Trash2 size={20} />
                              </div>
                              <span className="font-bold text-rose-400">{t("trip.delete")}</span>
                          </button>
                      </div>
                  </motion.div>
              </div>
          )}
      </AnimatePresence>

      <AnimatePresence>
        {!isAnySheetOpen && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 sm:sticky sm:bottom-auto sm:top-[400px] lg:top-[500px] z-50 pointer-events-none"
          >
            <div className="pointer-events-auto">
              <Navigation 
                activeTab={activeTab} 
                onTabChange={setActiveTab} 
                onAddClick={() => {
                    if (activeTab === "itinerary") {
                        if (itinerary?.days.length > 0) setIsAddLocationOpen(true);
                        else handleAddDay();
                    }
                    else setIsAddExpenseOpen(true);
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AIPlannerModal 
          isOpen={isAIPlannerOpen}
          onClose={() => setIsAIPlannerOpen(false)}
          initialData={{ destination: itinerary.title }}
      />
    </main>
  );
}
