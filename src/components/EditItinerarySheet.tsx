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
            className={`p-6 bg-canvas rounded-[2rem] relative group border-[2px] ${isDragging ? 'border-accent shadow-2xl z-50 scale-105' : 'border-stroke hover:border-accent/30'} transition-all`}
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
                            className="input-surface flex-1 px-4 py-3 text-sm"
                        />
                        <input
                            type="text"
                            placeholder="Horário (ex: 09:00 - 11:00)"
                            value={loc.timeSlot || ""}
                            onChange={(e) => handleLocationChange(loc.id, "timeSlot", e.target.value)}
                            className="input-surface w-32 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-accent"
                        />
                        <select
                            value={loc.tag || ""}
                            onChange={(e) => handleLocationChange(loc.id, "tag", e.target.value)}
                            className="input-surface px-4 py-3 text-[10px] uppercase font-black tracking-widest min-w-[100px] text-center appearance-none"
                        >
                            <option value="" className="bg-surface">Sem Tag</option>
                            <option value="Must Go" className="bg-surface">Must Go</option>
                            <option value="Opcional" className="bg-surface">Opcional</option>
                            <option value="Food" className="bg-surface">Food</option>
                            <option value="Photo Op" className="bg-surface">Photo Op</option>
                        </select>
                    </div>

                    <textarea
                        placeholder="Descrição (Opcional)"
                        value={loc.description || ""}
                        onChange={(e) => handleLocationChange(loc.id, "description", e.target.value)}
                        rows={2}
                        className="input-surface w-full px-4 py-3 text-sm font-medium resize-none shadow-none"
                    />

                    <input
                        type="text"
                        placeholder="Google Maps URL (Opcional)"
                        value={loc.mapsUrl || ""}
                        onChange={(e) => handleLocationChange(loc.id, "mapsUrl", e.target.value)}
                        className="input-surface w-full px-4 py-3 text-[10px] font-bold"
                    />

                    <div className="flex gap-4">
                        <div className="flex-1 space-y-1">
                            <label className="text-[9px] uppercase text-text-medium font-black tracking-widest px-1">Latitude</label>
                            <input
                                type="number"
                                step="any"
                                value={loc.lat || 0}
                                onChange={(e) => handleLocationChange(loc.id, "lat", parseFloat(e.target.value))}
                                className="input-surface w-full px-4 py-3 text-xs font-mono"
                            />
                        </div>
                        <div className="flex-1 space-y-1">
                            <label className="text-[9px] uppercase text-text-medium font-black tracking-widest px-1">Longitude</label>
                            <input
                                type="number"
                                step="any"
                                value={loc.lng || 0}
                                onChange={(e) => handleLocationChange(loc.id, "lng", parseFloat(e.target.value))}
                                className="input-surface w-full px-4 py-3 text-xs font-mono"
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
                    className="bg-surface w-full max-w-lg max-h-[92vh] sm:rounded-[3rem] rounded-t-[2.5rem] shadow-2xl flex flex-col overflow-hidden border-t border-x border-stroke sm:border"
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
