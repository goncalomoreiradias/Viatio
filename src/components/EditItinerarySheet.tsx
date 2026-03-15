"use client";

import { useState } from "react";
import { X, Plus, Save, Trash2, GripVertical } from "lucide-react";
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
    handleLocationChange: (id: string, field: keyof Location, value: any) => void;
    removeLocation: (id: string) => void;
}

function SortableLocationItem({ loc, handleLocationChange, removeLocation }: SortableLocationItemProps) {
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
            className={`p-6 bg-[#141820] rounded-[2rem] relative group border-[2px] ${isDragging ? 'border-accent-cobalt shadow-[0_20px_40px_-10px_rgba(46,91,255,0.4)] z-50 scale-105' : 'border-white/5 hover:border-white/10'} transition-all`}
        >
            <button
                onClick={() => removeLocation(loc.id)}
                className="absolute -top-3 -right-3 bg-red-500/10 text-red-500 p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-xl z-20 hover:bg-red-500 hover:text-white border border-red-500/20 active:scale-90"
            >
                <Trash2 size={16} />
            </button>

            <div className="flex gap-2 mb-3">
                <div
                    {...attributes}
                    {...listeners}
                    className="mt-2 text-gray-400 cursor-grab active:cursor-grabbing hover:text-brand-primary"
                >
                    <GripVertical size={16} />
                </div>
                <div className="flex-1 space-y-4">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="Nome do Local"
                            value={loc.name}
                            onChange={(e) => handleLocationChange(loc.id, "name", e.target.value)}
                            className="flex-1 bg-white/5 px-4 py-3 rounded-xl border border-white/10 focus:border-accent-cobalt outline-none shadow-sm font-black text-white placeholder:text-gray-700 transition-all"
                        />
                        <select
                            value={loc.tag || ""}
                            onChange={(e) => handleLocationChange(loc.id, "tag", e.target.value)}
                            className="bg-white/5 px-4 py-3 rounded-xl border border-white/10 focus:border-accent-cobalt outline-none shadow-sm text-[10px] font-black uppercase tracking-widest text-gray-400 appearance-none min-w-[100px] text-center"
                        >
                            <option value="">Sem Tag</option>
                            <option value="Must Go">Must Go</option>
                            <option value="Opcional">Opcional</option>
                            <option value="Food">Food</option>
                            <option value="Photo Op">Photo Op</option>
                        </select>
                    </div>

                    <textarea
                        placeholder="Descrição (Opcional)"
                        value={loc.description || ""}
                        onChange={(e) => handleLocationChange(loc.id, "description", e.target.value)}
                        rows={2}
                        className="w-full bg-white/5 px-4 py-3 rounded-xl border border-white/10 focus:border-accent-cobalt outline-none shadow-sm text-sm text-gray-300 placeholder:text-gray-700 resize-none transition-all"
                    />

                    <input
                        type="text"
                        placeholder="Google Maps URL (Opcional)"
                        value={loc.mapsUrl || ""}
                        onChange={(e) => handleLocationChange(loc.id, "mapsUrl", e.target.value)}
                        className="w-full bg-emerald-500/5 px-4 py-3 rounded-xl border border-emerald-500/10 focus:border-emerald-500 outline-none shadow-sm text-[10px] font-bold text-emerald-400 placeholder:text-emerald-900/40 transition-all font-mono"
                    />

                    <div className="flex gap-4">
                        <div className="flex-1 space-y-1">
                            <label className="text-[9px] uppercase text-gray-600 font-black tracking-widest px-1">Latitude</label>
                            <input
                                type="number"
                                step="any"
                                value={loc.lat || 0}
                                onChange={(e) => handleLocationChange(loc.id, "lat", parseFloat(e.target.value))}
                                className="w-full bg-white/5 px-4 py-3 text-xs rounded-xl border border-white/10 outline-none shadow-sm font-mono text-white focus:border-accent-indigo transition-all"
                            />
                        </div>
                        <div className="flex-1 space-y-1">
                            <label className="text-[9px] uppercase text-gray-600 font-black tracking-widest px-1">Longitude</label>
                            <input
                                type="number"
                                step="any"
                                value={loc.lng || 0}
                                onChange={(e) => handleLocationChange(loc.id, "lng", parseFloat(e.target.value))}
                                className="w-full bg-white/5 px-4 py-3 text-xs rounded-xl border border-white/10 outline-none shadow-sm font-mono text-white focus:border-accent-indigo transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface EditItinerarySheetProps {
    day: DayPlan;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedDay: DayPlan) => void;
}

export default function EditItinerarySheet({ day, isOpen, onClose, onSave }: EditItinerarySheetProps) {
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
                    className="glass bg-slate-900 w-full max-w-lg max-h-[92vh] sm:rounded-[2.5rem] rounded-t-[2.5rem] shadow-2xl flex flex-col overflow-hidden border-t border-x border-white/10 sm:border"
                >
                    {/* Drag Handle Indicator */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/20 rounded-full sm:hidden z-30" />
                    {/* Header */}
                    <div className="px-8 py-7 pt-10 sm:pt-7 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-accent-cobalt to-accent-indigo text-white shadow-lg">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black uppercase tracking-widest font-outfit leading-tight text-white">Editar Dia {day.dayNumber}</h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">Refina o teu itinerário</p>
                        </div>
                        <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all active:scale-90 border border-white/10 shadow-xl">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-10 hide-scrollbar">
                        <div className="space-y-4">
                            <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] px-2 leading-none">
                                Título do Dia
                            </label>
                            <input
                                type="text"
                                value={editedDay.title}
                                onChange={(e) => setEditedDay({ ...editedDay, title: e.target.value })}
                                className="w-full px-6 py-4.5 bg-white/5 border border-white/10 rounded-[1.5rem] focus:border-accent-indigo outline-none transition-all font-black text-white text-lg tracking-tight shadow-inner"
                                placeholder="Ex: Explorar Templos de Ubud"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-6 px-2">
                                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">LOCAIS ({locations.length})</h3>
                                <button
                                    onClick={addLocation}
                                    className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-cobalt flex items-center gap-2 hover:text-white transition-all bg-accent-cobalt/10 px-4 py-2 rounded-full border border-accent-cobalt/20 shadow-lg active:scale-95"
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
                                                handleLocationChange={handleLocationChange}
                                                removeLocation={removeLocation}
                                            />
                                        ))}
                                    </SortableContext>
                                </DndContext>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-8 border-t border-white/5 bg-obsidian pb-10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
                        <button
                            onClick={handleSave}
                            className="w-full py-5 bg-gradient-to-br from-accent-cobalt to-accent-indigo hover:to-accent-cobalt text-white font-black rounded-full shadow-[0_20px_50px_-10px_rgba(46,91,255,0.4)] flex items-center justify-center gap-3 transition-all active:scale-[0.97] uppercase tracking-[0.2em] text-base border border-white/20"
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
