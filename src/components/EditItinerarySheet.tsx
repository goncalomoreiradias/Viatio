"use client";

import { useState } from "react";
import { X, Plus, Save, Trash2, GripVertical, Map as MapIcon, Calendar } from "lucide-react";
import { DayPlan, Location } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
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
                                    <option value="Food" className="bg-surface">🍱 Food</option>
                                    <option value="Photo" className="bg-surface">📸 Photo</option>
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
    onSave: (updatedDay: DayPlan) => void;
    onMoveLocation?: (locId: string, targetDayId: string) => void;
}

export default function EditItinerarySheet({ day, allDays, isOpen, onClose, onSave, onMoveLocation }: EditItinerarySheetProps) {
    const [editedDay, setEditedDay] = useState<DayPlan>({ ...day });
    const [locations, setLocations] = useState<Location[]>([...day.locations]);

    const handleLocationChange = (id: string, field: keyof Location, value: any) => {
        setLocations(locs =>
            locs.map(loc => loc.id === id ? { ...loc, [field]: value } : loc)
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

    const handleSave = () => {
        onSave({
            ...editedDay,
            locations
        });
        onClose();
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
                    drag="y"
                    dragConstraints={{ top: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(_, info) => {
                        if (info.offset.y > 150) onClose();
                    }}
                    className="bg-surface w-full max-w-lg lg:max-w-4xl max-h-[92vh] sm:rounded-[3rem] rounded-t-[2.5rem] shadow-2xl flex flex-col overflow-hidden border-t border-x border-stroke sm:border"
                >
                    {/* Drag Handle Indicator */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-canvas/20 rounded-full sm:hidden z-50" />
                    {/* Header */}
                    <div className="px-8 py-7 pt-10 sm:pt-7 border-b border-stroke flex justify-between items-center bg-accent text-canvas shadow-lg">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black uppercase tracking-tighter font-outfit leading-tight text-canvas">Editar Dia {day.dayNumber}</h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-canvas/70">Refina o teu itinerário</p>
                        </div>
                        <button onClick={onClose} className="p-3 bg-canvas/10 hover:bg-canvas/20 rounded-full transition-all active:scale-90 border border-canvas/10 shadow-xl">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-10 hide-scrollbar">
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
                                <h3 className="text-[10px] font-black text-text-medium uppercase tracking-[0.3em]">LOCAIS ({locations.length})</h3>
                                <button
                                    onClick={addLocation}
                                    className="text-[10px] font-black uppercase tracking-[0.2em] text-accent flex items-center gap-2 hover:scale-105 transition-all bg-accent/10 px-4 py-2 rounded-full border border-accent/20 shadow-lg active:scale-95"
                                >
                                    <Plus size={14} /> ADICIONAR PARAGEM
                                </button>
                            </div>

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
                                        {locations.map((loc) => (
                                            <SortableLocationItem
                                                key={loc.id}
                                                loc={loc}
                                                allDays={allDays}
                                                currentDayId={day.id}
                                                handleLocationChange={handleLocationChange}
                                                removeLocation={removeLocation}
                                                onMoveLocation={onMoveLocation}
                                            />
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
                            className="w-full btn-primary py-5 text-base"
                        >
                            <Save size={22} />
                            GUARDAR ALTERAÇÕES
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
