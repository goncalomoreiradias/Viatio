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
            className={`p-4 bg-gray-50 dark:bg-gray-800 rounded-xl relative group border ${isDragging ? 'border-bali-ocean shadow-lg' : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'} transition`}
        >
            <button
                onClick={() => removeLocation(loc.id)}
                className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition shadow-sm z-10"
            >
                <Trash2 size={14} />
            </button>

            <div className="flex gap-2 mb-3">
                <div
                    {...attributes}
                    {...listeners}
                    className="mt-2 text-gray-400 cursor-grab active:cursor-grabbing hover:text-bali-ocean"
                >
                    <GripVertical size={16} />
                </div>
                <div className="flex-1 space-y-3">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Location Name"
                            value={loc.name}
                            onChange={(e) => handleLocationChange(loc.id, "name", e.target.value)}
                            className="flex-1 bg-white dark:bg-gray-900 px-3 py-2 rounded-lg border-none focus:ring-1 focus:ring-gray-300 outline-none shadow-sm font-medium"
                        />
                        <select
                            value={loc.tag || ""}
                            onChange={(e) => handleLocationChange(loc.id, "tag", e.target.value)}
                            className="bg-white dark:bg-gray-900 px-3 py-2 rounded-lg border-none focus:ring-1 focus:ring-gray-300 outline-none shadow-sm text-sm"
                        >
                            <option value="">No Tag</option>
                            <option value="Must Go">Must Go</option>
                            <option value="Opcional">Opcional</option>
                            <option value="Food">Food</option>
                            <option value="Photo Op">Photo Op</option>
                        </select>
                    </div>

                    <input
                        type="text"
                        placeholder="Description (Optional)"
                        value={loc.description || ""}
                        onChange={(e) => handleLocationChange(loc.id, "description", e.target.value)}
                        className="w-full bg-white dark:bg-gray-900 px-3 py-2 rounded-lg border-none focus:ring-1 focus:ring-gray-300 outline-none shadow-sm text-sm"
                    />

                    <input
                        type="text"
                        placeholder="Specific Maps URL (Optional)"
                        value={loc.mapsUrl || ""}
                        onChange={(e) => handleLocationChange(loc.id, "mapsUrl", e.target.value)}
                        className="w-full bg-white dark:bg-gray-900 px-3 py-2 rounded-lg border-none focus:ring-1 focus:ring-gray-300 outline-none shadow-sm text-sm"
                    />

                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="text-[10px] uppercase text-gray-500 font-bold px-1">Lat</label>
                            <input
                                type="number"
                                value={loc.lat || 0}
                                onChange={(e) => handleLocationChange(loc.id, "lat", parseFloat(e.target.value))}
                                className="w-full bg-white dark:bg-gray-900 px-3 py-2 text-xs rounded-lg border-none outline-none shadow-sm font-mono"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-[10px] uppercase text-gray-500 font-bold px-1">Lng</label>
                            <input
                                type="number"
                                value={loc.lng || 0}
                                onChange={(e) => handleLocationChange(loc.id, "lng", parseFloat(e.target.value))}
                                className="w-full bg-white dark:bg-gray-900 px-3 py-2 text-xs rounded-lg border-none outline-none shadow-sm font-mono"
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
                    className="bg-white dark:bg-gray-900 w-full max-w-lg max-h-[90vh] sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gradient-to-r from-bali-sage to-bali-ocean text-white">
                        <h2 className="text-xl font-bold">Edit Day {day.dayNumber}</h2>
                        <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                Day Title
                            </label>
                            <input
                                type="text"
                                value={editedDay.title}
                                onChange={(e) => setEditedDay({ ...editedDay, title: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-bali-sage outline-none transition"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-semibold text-gray-800 dark:text-gray-200">Locations ({locations.length})</h3>
                                <button
                                    onClick={addLocation}
                                    className="text-sm font-medium text-bali-sage flex items-center gap-1 hover:text-bali-ocean transition"
                                >
                                    <Plus size={16} /> Add Stop
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
                    <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                        <button
                            onClick={handleSave}
                            className="w-full py-4 bg-bali-sage hover:bg-bali-ocean text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                            <Save size={20} />
                            Save Changes
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
