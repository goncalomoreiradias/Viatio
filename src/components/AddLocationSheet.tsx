"use client";

import { useState } from "react";
import { X, Plus, Save, MapPin } from "lucide-react";
import { DayPlan, Location } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

interface AddLocationSheetProps {
    isOpen: boolean;
    onClose: () => void;
    days: DayPlan[];
    onAdd: (dayId: string, location: Location) => void;
}

export default function AddLocationSheet({ isOpen, onClose, days, onAdd }: AddLocationSheetProps) {
    const [selectedDayId, setSelectedDayId] = useState<string>(days[0]?.id || "");
    const [location, setLocation] = useState<Partial<Location>>({
        name: "",
        description: "",
        timeSlot: "",
        mapsUrl: "",
        tag: "",
        lat: -8.409518,
        lng: 115.188919,
        completed: false
    });

    const handleSave = () => {
        if (!selectedDayId || !location.name) {
            alert("Please provide a name and select a day.");
            return;
        }

        onAdd(selectedDayId, {
            ...location,
            id: `loc-new-${Date.now()}`,
        } as Location);

        // Reset form
        setLocation({
            name: "",
            description: "",
            timeSlot: "",
            mapsUrl: "",
            tag: "",
            lat: -8.4,
            lng: 115.2,
            completed: false
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm sm:p-4">
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
                    className="bg-surface w-full max-w-md max-h-[92vh] sm:rounded-[3rem] rounded-t-[2.5rem] shadow-2xl flex flex-col overflow-hidden border-t border-x border-stroke sm:border"
                >
                    {/* Drag Handle Indicator */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-canvas/20 rounded-full sm:hidden z-50" />
                    {/* Header */}
                    <div className="px-8 py-7 pt-10 sm:pt-7 border-b border-stroke flex justify-between items-center bg-accent text-canvas shadow-lg">
                        <div className="space-y-1">
                            <h2 className="text-xl font-black uppercase tracking-tighter font-outfit leading-tight text-canvas flex items-center gap-3">
                                <Plus size={22} /> NOVA ATIVIDADE
                            </h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-canvas/70">Adiciona uma paragem mágica</p>
                        </div>
                        <button onClick={onClose} className="p-3 bg-canvas/10 hover:bg-canvas/20 rounded-full transition-all active:scale-90 border border-canvas/10 shadow-xl">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Form Content */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth touch-pan-y">
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black text-text-medium uppercase tracking-[0.3em] px-2 leading-none">
                                NOME DO LOCAL
                            </label>
                            <input
                                type="text"
                                placeholder="Ex: Potato Head Beach Club"
                                value={location.name}
                                onChange={(e) => setLocation({ ...location, name: e.target.value })}
                                className="input-surface w-full p-6 text-[15px] font-black"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black text-text-medium uppercase tracking-[0.3em] px-2 leading-none">
                                ATRIBUIR AO DIA
                            </label>
                            <select
                                value={selectedDayId}
                                onChange={(e) => setSelectedDayId(e.target.value)}
                                className="input-surface w-full p-6 text-sm font-black appearance-none"
                            >
                                {days.map(d => (
                                    <option key={d.id} value={d.id} className="bg-surface text-text-high">Dia {d.dayNumber} - {d.title}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[10px] font-black text-text-medium uppercase tracking-[0.3em] px-2 leading-none">
                                    HORÁRIO
                                </label>
                                <input
                                    type="text"
                                    placeholder="09:00 - 11:00"
                                    value={location.timeSlot || ""}
                                    onChange={(e) => setLocation({ ...location, timeSlot: e.target.value })}
                                    className="input-surface w-full p-6 text-[10px] font-black uppercase tracking-widest text-accent"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[10px] font-black text-text-medium uppercase tracking-[0.3em] px-2 leading-none">
                                    TAG
                                </label>
                                <select
                                    value={location.tag || ""}
                                    onChange={(e) => setLocation({ ...location, tag: e.target.value })}
                                    className="input-surface w-full p-6 text-[10px] font-black uppercase tracking-widest text-center appearance-none"
                                >
                                    <option value="" className="bg-surface">Sem Tag</option>
                                    <option value="Must Go" className="bg-surface">Must Go</option>
                                    <option value="Opcional" className="bg-surface">Opcional</option>
                                    <option value="Food" className="bg-surface">Food</option>
                                    <option value="Photo Op" className="bg-surface">Photo Op</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black text-text-medium uppercase tracking-[0.3em] px-2 leading-none">
                                MAPS URL
                            </label>
                            <input
                                type="text"
                                placeholder="https://..."
                                value={location.mapsUrl || ""}
                                onChange={(e) => setLocation({ ...location, mapsUrl: e.target.value })}
                                className="input-surface w-full p-6 text-sm font-bold"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black text-text-medium uppercase tracking-[0.3em] px-2 leading-none">
                                NOTAS (OPCIONAL)
                            </label>
                            <textarea
                                placeholder="Detalhes ou dicas rápidas..."
                                value={location.description || ""}
                                onChange={(e) => setLocation({ ...location, description: e.target.value })}
                                className="input-surface w-full p-6 h-32 text-sm font-medium resize-none shadow-none"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-8 border-t border-stroke bg-surface pb-10 shadow-2xl">
                        <button
                            onClick={handleSave}
                            className="w-full btn-primary py-5 text-base"
                        >
                            <Plus size={22} />
                            ADICIONAR AO ROTEIRO
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
