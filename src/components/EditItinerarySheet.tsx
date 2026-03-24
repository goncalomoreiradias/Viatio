"use client";

import { useState } from "react";
import { X, Plus, Save, Trash2, GripVertical, Map as MapIcon, Calendar, Link2, RefreshCw, Loader2, ArrowUp, ArrowDown } from "lucide-react";
import { DayPlan, Location, BucketListItem } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { calculateDistance, estimateTravelTime, formatDuration, extractCoordsFromUrl, isValidCoord } from "@/lib/maps";
import { Car, Footprints } from "lucide-react";
import React from "react";
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
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableLocationItemProps {
    loc: Location;
    allDays: DayPlan[];
    currentDayId: string;
    handleLocationChange: (id: string, field: keyof Location, value: any) => void;
    removeLocation: (id: string) => void;
    onMoveLocation?: (locId: string, targetDayId: string) => void;
}

function SortableLocationItem({ loc, allDays, currentDayId, handleLocationChange, removeLocation, onMoveLocation }: SortableLocationItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: loc.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 2 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group bg-surface/40 hover:bg-surface/60 rounded-[2.5rem] border-2 transition-all p-6 relative ${isDragging ? 'border-accent shadow-2xl scale-[1.02] z-50' : 'border-stroke hover:border-accent/20'}`}
        >
            <div className="flex gap-4">
                {/* Drag Handle & Content Container */}
                <div
                    {...attributes}
                    {...listeners}
                    className="mt-1 text-text-medium/30 cursor-grab active:cursor-grabbing hover:text-accent transition-colors py-2"
                >
                    <GripVertical size={20} />
                </div>

                <div className="flex-1 space-y-6">
                    {/* Primary Row: Name & Options */}
                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Nome do Local (ex: Templo Uluwatu)"
                                value={loc.name}
                                onChange={(e) => handleLocationChange(loc.id, "name", e.target.value)}
                                className="w-full bg-transparent border-none text-xl font-black font-outfit text-text-high placeholder:text-text-medium/20 focus:ring-0 p-0"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2 h-fit">
                            <div className="relative group/time">
                                <input
                                    type="text"
                                    placeholder="09:00"
                                    value={loc.timeSlot || ""}
                                    onChange={(e) => handleLocationChange(loc.id, "timeSlot", e.target.value)}
                                    className="bg-canvas/50 border border-stroke rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-accent w-28 text-center focus:border-accent outline-none"
                                />
                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/time:opacity-100 transition-opacity text-[8px] font-black text-text-medium uppercase tracking-[0.2em] whitespace-nowrap bg-surface px-2 py-1 rounded-md border border-stroke shadow-lg">Horário</span>
                            </div>
                            
                            <div className="relative group/tag">
                                <select
                                    value={loc.tag || ""}
                                    onChange={(e) => handleLocationChange(loc.id, "tag", e.target.value)}
                                    className="bg-canvas/50 border border-stroke rounded-xl px-4 py-2 text-[10px] uppercase font-black tracking-widest text-text-high outline-none focus:border-accent cursor-pointer appearance-none min-w-[100px] text-center"
                                >
                                    <option value="" className="bg-surface">Sem Tag</option>
                                    <option value="Must Go" className="bg-surface">⭐ Must Go</option>
                                    <option value="Opcional" className="bg-surface">📍 Opcional</option>
                                    <option value="Alojamento" className="bg-surface">🏨 Alojamento</option>
                                    <option value="Food" className="bg-surface">🍱 Gastronomia</option>
                                    <option value="Transporte" className="bg-surface">✈️ Transporte</option>
                                    <option value="Natureza" className="bg-surface">🌿 Natureza</option>
                                    <option value="Cultura" className="bg-surface">🏛️ Cultura</option>
                                    <option value="Lazer" className="bg-surface">🏖️ Lazer</option>
                                    <option value="Photo" className="bg-surface">📸 Photo Spot</option>
                                    <option value="Vida Noturna" className="bg-surface">🍸 Vida Noturna</option>
                                </select>
                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/tag:opacity-100 transition-opacity text-[8px] font-black text-text-medium uppercase tracking-[0.2em] whitespace-nowrap bg-surface px-2 py-1 rounded-md border border-stroke shadow-lg">Categoria</span>
                            </div>
                        </div>
                    </div>

                    {/* Secondary Row: Description */}
                    <div className="relative">
                        <textarea
                            placeholder="Adiciona uma breve nota sobre este local..."
                            value={loc.description || ""}
                            onChange={(e) => handleLocationChange(loc.id, "description", e.target.value)}
                            rows={1}
                            className="w-full bg-transparent border-none text-sm font-medium text-text-medium placeholder:text-text-medium/30 focus:ring-0 p-0 resize-none min-h-[1.5rem]"
                            onInput={(e) => {
                                const target = e.target as HTMLTextAreaElement;
                                target.style.height = 'auto';
                                target.style.height = target.scrollHeight + 'px';
                            }}
                        />
                    </div>

                    {/* Tertiary Row: Links, Coordinates & Move Action */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 border-t border-stroke/50">
                        {/* Maps Link */}
                        <div className="lg:col-span-5">
                            <div className="flex items-center gap-2 bg-canvas/30 rounded-xl px-4 py-2 border border-stroke/50 group/maps">
                                <MapIcon size={14} className="text-text-medium group-focus-within/maps:text-accent transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Link do Google Maps"
                                    value={loc.mapsUrl || ""}
                                    onChange={(e) => handleLocationChange(loc.id, "mapsUrl", e.target.value)}
                                    className="flex-1 bg-transparent border-none text-[10px] font-bold text-text-medium placeholder:text-text-medium/20 focus:ring-0 p-0"
                                />
                            </div>
                        </div>
                        
                        {/* Lat/Lng */}
                        <div className="lg:col-span-3 flex gap-2">
                             <div className="flex-1 flex items-center gap-2 bg-canvas/30 rounded-xl px-3 py-2 border border-stroke/50">
                                <span className="text-[9px] font-black text-text-medium/50 uppercase">Lat</span>
                                <input
                                    type="number"
                                    step="any"
                                    value={loc.lat || 0}
                                    onChange={(e) => handleLocationChange(loc.id, "lat", parseFloat(e.target.value))}
                                    className="w-full bg-transparent border-none text-[10px] font-mono font-bold text-text-medium focus:ring-0 p-0"
                                />
                            </div>
                             <div className="flex-1 flex items-center gap-2 bg-canvas/30 rounded-xl px-3 py-2 border border-stroke/50">
                                <span className="text-[9px] font-black text-text-medium/50 uppercase">Lng</span>
                                <input
                                    type="number"
                                    step="any"
                                    value={loc.lng || 0}
                                    onChange={(e) => handleLocationChange(loc.id, "lng", parseFloat(e.target.value))}
                                    className="w-full bg-transparent border-none text-[10px] font-mono font-bold text-text-medium focus:ring-0 p-0"
                                />
                            </div>
                        </div>

                        {/* Move Trigger */}
                        {allDays.length > 1 && (
                            <div className="lg:col-span-4 flex items-center gap-3 bg-canvas/10 rounded-xl px-4 py-1.5 border border-dashed border-stroke/50">
                                <span className="text-[8px] font-black text-text-medium uppercase tracking-widest whitespace-nowrap">Mover:</span>
                                <div className="flex-1 flex gap-2 overflow-x-auto py-1 hide-scrollbar">
                                    {allDays.map(d => (
                                        <button
                                            key={d.id}
                                            type="button"
                                            onClick={() => onMoveLocation?.(loc.id, d.id)}
                                            className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${d.id === currentDayId ? 'bg-accent text-canvas' : 'bg-surface border border-stroke text-text-medium hover:text-text-high'}`}
                                            disabled={d.id === currentDayId}
                                        >
                                            D{d.dayNumber}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Notes / Extra Links Row */}
                    <div className="pt-3 border-t border-stroke/30">
                        <div className="flex items-start gap-2 bg-canvas/30 rounded-xl px-4 py-2 border border-stroke/50 group/notes">
                            <Link2 size={14} className="text-text-medium/50 group-focus-within/notes:text-accent transition-colors mt-0.5 flex-shrink-0" />
                            <textarea
                                placeholder="Notas, links (booking, reels, dicas...)" 
                                value={loc.notes || ""}
                                onChange={(e) => handleLocationChange(loc.id, "notes", e.target.value)}
                                rows={1}
                                className="flex-1 bg-transparent border-none text-[10px] font-bold text-text-medium placeholder:text-text-medium/20 focus:ring-0 p-0 resize-none"
                                onInput={(e) => {
                                    const target = e.target as HTMLTextAreaElement;
                                    target.style.height = 'auto';
                                    target.style.height = target.scrollHeight + 'px';
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Remove Action */}
                <button
                    onClick={() => removeLocation(loc.id)}
                    className="p-3 text-text-medium/30 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all self-start"
                    aria-label="Remove Location"
                >
                    <Trash2 size={20} />
                </button>
            </div>
        </div>
    );
}

interface EditItinerarySheetProps {
    day: DayPlan;
    allDays: DayPlan[];
    isOpen: boolean;
    onClose: () => void;
    onSave: (day: DayPlan) => void;
    onDeleteDay?: (dayId: string) => void;
    onMoveDay?: (dayId: string, direction: 'up' | 'down') => void;
    onMoveLocation?: (locationId: string, targetDayId: string) => void;
    bucketListUrls?: string[];
    bucketListItems?: BucketListItem[];
    onRefreshBucketList?: () => void;
}

export default function EditItinerarySheet({ 
    day, 
    allDays, 
    isOpen, 
    onClose, 
    onSave, 
    onDeleteDay,
    onMoveDay,
    onMoveLocation,
    bucketListUrls,
    bucketListItems,
    onRefreshBucketList
}: EditItinerarySheetProps) {
    const [editedDay, setEditedDay] = useState<DayPlan>({ ...day });
    const [locations, setLocations] = useState<Location[]>([...day.locations]);
    const [showBucketList, setShowBucketList] = useState(false);
    const [isResolving, setIsResolving] = useState(false);
    const [refreshingBucketList, setRefreshingBucketList] = useState(false);

    /**
     * Resolves a short URL (goo.gl, maps.app) to its full form via our API.
     */
    const resolveShortUrl = async (url: string): Promise<string> => {
        const isShort = url.includes("goo.gl") || url.includes("maps.app") || url.includes("bit.ly");
        if (!isShort) return url;
        
        try {
            const res = await fetch("/api/resolve-url", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url })
            });
            const data = await res.json();
            return data.resolvedUrl || url;
        } catch {
            return url;
        }
    };

    const handleLocationChange = (id: string, field: keyof Location, value: any) => {
        setLocations(locs =>
            locs.map(loc => {
                if (loc.id === id) {
                    const updated = { ...loc, [field]: value };
                    
                    // Auto-extract coordinates if Maps URL is provided
                    if (field === "mapsUrl" && value) {
                        const coords = extractCoordsFromUrl(value);
                        if (coords) {
                            updated.lat = coords.lat;
                            updated.lng = coords.lng;
                        } else {
                            // If it's a short URL, resolve it async
                            const isShort = value.includes("goo.gl") || value.includes("maps.app");
                            if (isShort) {
                                resolveShortUrl(value).then(resolved => {
                                    const resolvedCoords = extractCoordsFromUrl(resolved);
                                    if (resolvedCoords) {
                                        setLocations(prev => prev.map(l => 
                                            l.id === id ? { ...l, lat: resolvedCoords.lat, lng: resolvedCoords.lng } : l
                                        ));
                                    }
                                });
                            }
                        }
                    }
                    
                    return updated;
                }
                return loc;
            })
        );
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Requires a 5px drag to initiate, allowing clicks on inputs to work
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setLocations((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);

                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const addLocation = () => {
        const newLoc: Location = {
            id: `new-${Date.now()}`,
            name: "New Location",
            description: "",
            lat: -8.4,
            lng: 115.2,
            completed: false
        };
        setLocations([...locations, newLoc]);
    };

    const removeLocation = (id: string) => {
        setLocations(locs => locs.filter(loc => loc.id !== id));
    };

    const handleSave = async () => {
        setIsResolving(true);

        // Resolve all short URLs and re-extract coordinates before saving
        const finalLocations = await Promise.all(
            locations.map(async (loc) => {
                if (loc.mapsUrl) {
                    // First try direct extraction
                    let coords = extractCoordsFromUrl(loc.mapsUrl);
                    
                    // If direct extraction fails, resolve the URL first
                    if (!coords) {
                        const resolvedUrl = await resolveShortUrl(loc.mapsUrl);
                        coords = extractCoordsFromUrl(resolvedUrl);
                    }
                    
                    if (coords) {
                        return { ...loc, lat: coords.lat, lng: coords.lng, timeSlot: loc.timeSlot };
                    }
                }
                return { ...loc, timeSlot: loc.timeSlot };
            })
        );

        setIsResolving(false);

        onSave({
            ...editedDay,
            title: editedDay.title,
            locations: finalLocations
        });
        onClose();
    };

    const addToItinerary = (name: string, lat: number, lng: number) => {
        const newLoc: Location = {
            id: `bucket-${Date.now()}`,
            name,
            description: "Adicionado da Bucket List",
            lat,
            lng,
            completed: false,
            tag: "Must Go"
        };
        setLocations([...locations, newLoc]);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm sm:p-4">
                <motion.div
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="bg-surface w-full max-w-lg lg:max-w-4xl max-h-[92vh] sm:rounded-[3rem] rounded-t-[2.5rem] shadow-2xl flex flex-col overflow-hidden border-t border-x border-stroke sm:border"
                >
                    {/* Drag Handle Indicator (visual only) */}
                    <div className="flex justify-center pt-3 pb-1 sm:hidden">
                        <div className="w-12 h-1.5 bg-text-medium/20 rounded-full" />
                    </div>
                    {/* Header */}
                    <div className="px-8 py-7 sm:pt-7 border-b border-stroke flex justify-between items-center bg-accent text-canvas shadow-lg flex-shrink-0">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black uppercase tracking-tighter font-outfit leading-tight text-canvas">Editar Dia {day.dayNumber}</h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-canvas/70">Refina o teu itinerário</p>
                        </div>
                        <button onClick={onClose} className="p-3 bg-canvas/10 hover:bg-canvas/20 rounded-full transition-all active:scale-90 border border-canvas/10 shadow-xl">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Day Management Toolbar - Only show if functions are passed */}
                    {(onDeleteDay || onMoveDay) && (
                        <div className="px-8 py-4 bg-surface border-b border-stroke flex items-center justify-between">
                            <div className="flex bg-canvas rounded-xl border border-stroke shadow-sm p-1">
                                <button 
                                    onClick={() => onMoveDay && onMoveDay(day.id, 'up')}
                                    disabled={day.dayNumber === 1}
                                    className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-text-high hover:text-accent hover:bg-surface rounded-lg disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-high transition-all flex items-center gap-2"
                                >
                                    <ArrowUp size={14} /> Mover Cima
                                </button>
                                <div className="w-px bg-stroke mx-1"></div>
                                <button 
                                    onClick={() => onMoveDay && onMoveDay(day.id, 'down')}
                                    disabled={day.dayNumber === allDays.length}
                                    className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-text-high hover:text-accent hover:bg-surface rounded-lg disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-high transition-all flex items-center gap-2"
                                >
                                    Mover Baixo <ArrowDown size={14} />
                                </button>
                            </div>
                            <button 
                                onClick={() => {
                                    if (confirm("Tens a certeza que queres eliminar este dia e todos os seus locais?")) {
                                        onDeleteDay && onDeleteDay(day.id);
                                    }
                                }}
                                className="p-2.5 text-text-medium hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    )}

                    {/* Scrollable Content — touch-optimized */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-10" style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
                        <div className="space-y-4">
                            <label className="flex items-center gap-2 text-[10px] font-black text-text-medium uppercase tracking-[0.3em] px-2 leading-none">
                                Título do Dia
                            </label>
                            <input
                                type="text"
                                value={editedDay.title}
                                onChange={(e) => setEditedDay({ ...editedDay, title: e.target.value })}
                                className="input-surface w-full px-6 py-6 text-xl"
                                placeholder="Ex: Explorar Templos de Ubud"
                            />
                        </div>

                        <div>
                             <div className="flex justify-between items-center mb-6 px-2">
                                <div className="flex items-center gap-6">
                                    <h3 className="text-[10px] font-black text-text-medium uppercase tracking-[0.3em]">LOCAIS ({locations.length})</h3>
                                    {(bucketListUrls && bucketListUrls.length > 0) && (
                                        <button 
                                            onClick={() => setShowBucketList(!showBucketList)}
                                            className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border transition-all ${showBucketList ? 'bg-accent text-canvas border-accent' : 'bg-surface text-accent border-stroke'}`}
                                        >
                                            {showBucketList ? 'Esconder Bucket List' : `📍 Bucket List (${bucketListItems?.length || 0})`}
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={addLocation}
                                    className="text-[10px] font-black uppercase tracking-[0.2em] text-accent flex items-center gap-2 hover:scale-105 transition-all bg-accent/10 px-4 py-2 rounded-full border border-accent/20 shadow-lg active:scale-95"
                                >
                                    <Plus size={14} /> ADICIONAR PARAGEM
                                </button>
                            </div>

                            <AnimatePresence>
                                {showBucketList && (bucketListUrls && bucketListUrls.length > 0) && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mb-10 overflow-hidden"
                                    >
                                        <div className="bg-canvas/40 border border-stroke rounded-[2rem] p-6 space-y-4">
                                            <div className="flex items-center justify-between px-2">
                                                <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-text-medium">Catálogo Bucket List</h4>
                                                <button
                                                    onClick={async () => {
                                                        if (!onRefreshBucketList || refreshingBucketList) return;
                                                        setRefreshingBucketList(true);
                                                        try { await onRefreshBucketList(); } finally { setRefreshingBucketList(false); }
                                                    }}
                                                    disabled={refreshingBucketList}
                                                    className="flex items-center gap-1.5 text-[8px] font-black text-accent hover:text-emerald-500 transition-colors uppercase tracking-wider disabled:opacity-50"
                                                >
                                                    {refreshingBucketList ? <Loader2 size={10} className="animate-spin" /> : <RefreshCw size={10} />}
                                                    {refreshingBucketList ? 'A carregar...' : 'Atualizar'}
                                                </button>
                                            </div>
                                            
                                            {(bucketListItems && bucketListItems.length > 0) ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {bucketListItems.map((item) => (
                                                        <div key={item.id} className="bg-surface/60 border border-stroke p-4 rounded-2xl flex justify-between items-center group/item hover:border-accent transition-colors">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-xs font-black text-text-high">{item.name}</span>
                                                                <div className="flex items-center gap-1.5">
                                                                    {item.category && <span className="text-[7px] font-bold text-accent uppercase bg-accent/10 px-1.5 py-0.5 rounded">{item.category}</span>}
                                                                    {item.address && <span className="text-[7px] font-bold text-text-dim uppercase truncate max-w-[100px]">{item.address}</span>}
                                                                </div>
                                                            </div>
                                                            <button 
                                                                onClick={() => addToItinerary(item.name, item.lat, item.lng)}
                                                                className="p-2 bg-accent/10 text-accent rounded-xl hover:bg-accent hover:text-canvas transition-all"
                                                            >
                                                                <Plus size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-6 space-y-3">
                                                    <p className="text-[9px] font-bold text-text-dim">Nenhum ponto carregado.</p>
                                                    <button
                                                        onClick={async () => {
                                                            if (!onRefreshBucketList || refreshingBucketList) return;
                                                            setRefreshingBucketList(true);
                                                            try { await onRefreshBucketList(); } finally { setRefreshingBucketList(false); }
                                                        }}
                                                        disabled={refreshingBucketList}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/20 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                                                    >
                                                        {refreshingBucketList ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                                                        {refreshingBucketList ? 'A processar via AI...' : 'Carregar pontos da lista'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-4">
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={locations.map(l => l.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {locations.map((loc, index) => (
                                            <React.Fragment key={loc.id}>
                                                <SortableLocationItem
                                                    loc={loc}
                                                    allDays={allDays}
                                                    currentDayId={day.id}
                                                    handleLocationChange={handleLocationChange}
                                                    removeLocation={removeLocation}
                                                    onMoveLocation={onMoveLocation}
                                                />
                                                
                                                {/* Travel indicator between items — only show if both points have valid coords */}
                                                {index < locations.length - 1 && (() => {
                                                    const next = locations[index + 1];
                                                    const hasValidCoords = isValidCoord(loc.lat, loc.lng) && isValidCoord(next.lat, next.lng);
                                                    if (!hasValidCoords) return (
                                                        <div className="flex justify-center -my-2 relative z-10">
                                                            <div className="bg-canvas/80 backdrop-blur-md border border-dashed border-stroke rounded-full px-4 py-1.5 text-[8px] font-black uppercase tracking-wider text-text-medium/50 shadow-md">
                                                                Adiciona links do Maps para ver distâncias
                                                            </div>
                                                        </div>
                                                    );
                                                    const dist = calculateDistance(loc.lat, loc.lng, next.lat, next.lng);
                                                    return (
                                                        <div className="flex justify-center -my-2 relative z-10">
                                                            <div className="bg-canvas/80 backdrop-blur-md border border-stroke rounded-full px-4 py-1.5 flex gap-4 text-[9px] font-black uppercase tracking-wider shadow-lg">
                                                                <div className="flex items-center gap-1.5 text-accent">
                                                                    <Car size={10} />
                                                                    <span>{formatDuration(estimateTravelTime(dist, 'drive'))}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5 text-text-medium">
                                                                    <Footprints size={10} />
                                                                    <span>{formatDuration(estimateTravelTime(dist, 'walk'))}</span>
                                                                </div>
                                                                <div className="text-text-dim border-l border-stroke pl-3">
                                                                    {dist.toFixed(1)} km
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </React.Fragment>
                                        ))}
                                    </SortableContext>
                                </DndContext>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-8 border-t border-stroke bg-surface pb-10 shadow-2xl">
                        <button
                            onClick={handleSave}
                            disabled={isResolving}
                            className={`w-full btn-primary py-5 text-base ${isResolving ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {isResolving ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-canvas/30 border-t-canvas rounded-full animate-spin" />
                                    A PROCESSAR MAPAS...
                                </>
                            ) : (
                                <>
                                    <Save size={22} />
                                    GUARDAR ALTERAÇÕES
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
