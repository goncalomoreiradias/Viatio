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
                    className="glass bg-slate-900 w-full max-w-md max-h-[92vh] sm:rounded-[2.5rem] rounded-t-[2.5rem] shadow-2xl flex flex-col overflow-hidden border-t border-x border-white/10 sm:border"
                >
                    {/* Drag Handle Indicator */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/20 rounded-full sm:hidden z-30" />
                    {/* Header */}
                    <div className="px-8 py-7 pt-10 sm:pt-7 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-accent-cobalt to-accent-indigo text-white shadow-lg">
                        <div className="space-y-1">
                            <h2 className="text-xl font-black uppercase tracking-widest font-outfit leading-tight text-white flex items-center gap-3">
                                <Plus size={22} /> NOVA ATIVIDADE
                            </h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">Adiciona uma paragem mágica</p>
                        </div>
                        <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all active:scale-90 border border-white/10 shadow-xl">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Form Content */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-8 hide-scrollbar">
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] px-2 leading-none">
                                NOME DO LOCAL
                            </label>
                            <input
                                type="text"
                                placeholder="Ex: Potato Head Beach Club"
                                value={location.name}
                                onChange={(e) => setLocation({ ...location, name: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-6 py-4.5 focus:border-accent-cobalt outline-none transition-all font-black text-white placeholder:text-gray-700 tracking-tight"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] px-2 leading-none">
                                ATRIBUIR AO DIA
                            </label>
                            <select
                                value={selectedDayId}
                                onChange={(e) => setSelectedDayId(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-6 py-4.5 focus:border-accent-cobalt outline-none transition-all font-black text-white text-sm appearance-none"
                            >
                                {days.map(d => (
                                    <option key={d.id} value={d.id} className="bg-obsidian text-white">Dia {d.dayNumber} - {d.title}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] px-2 leading-none">
                                    TAG
                                </label>
                                <select
                                    value={location.tag || ""}
                                    onChange={(e) => setLocation({ ...location, tag: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-5 py-4.5 focus:border-accent-cobalt outline-none transition-all font-black text-gray-400 text-[10px] uppercase tracking-widest appearance-none text-center"
                                >
                                    <option value="" className="bg-obsidian">Sem Tag</option>
                                    <option value="Must Go" className="bg-obsidian">Must Go</option>
                                    <option value="Opcional" className="bg-obsidian">Opcional</option>
                                    <option value="Food" className="bg-obsidian">Food</option>
                                    <option value="Photo Op" className="bg-obsidian">Photo Op</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] px-2 leading-none">
                                    MAPS URL
                                </label>
                                <input
                                    type="text"
                                    placeholder="https://..."
                                    value={location.mapsUrl || ""}
                                    onChange={(e) => setLocation({ ...location, mapsUrl: e.target.value })}
                                    className="w-full bg-emerald-500/5 border border-emerald-500/10 rounded-[1.5rem] px-5 py-4.5 focus:border-emerald-500 outline-none transition-all font-bold text-emerald-400 placeholder:text-emerald-900/50 text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] px-2 leading-none">
                                NOTAS (OPCIONAL)
                            </label>
                            <textarea
                                placeholder="Detalhes ou dicas rápidas..."
                                value={location.description || ""}
                                onChange={(e) => setLocation({ ...location, description: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-6 py-4.5 focus:border-accent-cobalt outline-none transition-all font-medium text-white placeholder:text-gray-700 resize-none h-32 text-sm"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-8 border-t border-white/5 bg-obsidian pb-10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
                        <button
                            onClick={handleSave}
                            className="w-full py-5 bg-gradient-to-br from-accent-cobalt to-accent-indigo text-white font-black rounded-full shadow-[0_20px_50px_-10px_rgba(46,91,255,0.4)] flex items-center justify-center gap-3 transition-all active:scale-[0.97] uppercase tracking-[0.2em] text-base border border-white/20"
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
