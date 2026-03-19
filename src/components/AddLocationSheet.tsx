"use client";

import { useState } from "react";
import { X, Plus, Save, MapPin, List } from "lucide-react";
import { DayPlan, Location } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

interface BucketListItem {
    name: string;
    lat: number;
    lng: number;
    city?: string;
    mapsUrl?: string;
}

interface AddLocationSheetProps {
    isOpen: boolean;
    onClose: () => void;
    days: DayPlan[];
    onAdd: (dayId: string, location: Location) => void;
    bucketListUrl?: string;
    bucketListItems?: BucketListItem[];
}

export default function AddLocationSheet({ isOpen, onClose, days, onAdd, bucketListUrl, bucketListItems }: AddLocationSheetProps) {
    const [selectedDayId, setSelectedDayId] = useState<string>(days[0]?.id || "");
    const [showBucketList, setShowBucketList] = useState(false);
    const [location, setLocation] = useState<Partial<Location>>({
        name: "",
        description: "",
        timeSlot: "",
        mapsUrl: "",
        tag: "",
        notes: "",
        lat: 0,
        lng: 0,
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
            notes: "",
            lat: 0,
            lng: 0,
            completed: false
        });
        onClose();
    };

    const handleBucketListSelect = (item: BucketListItem) => {
        setLocation({
            ...location,
            name: item.name,
            lat: item.lat,
            lng: item.lng,
            mapsUrl: item.mapsUrl || "",
            tag: "Must Go",
        });
        setShowBucketList(false);
    };

    // Demo items — will be replaced by real items from parsed Google Maps list
    const demoItems: BucketListItem[] = bucketListItems || [
        { name: "Torre Eiffel", lat: 48.8584, lng: 2.2945, city: "Paris" },
        { name: "Central Park", lat: 40.7829, lng: -73.9654, city: "New York" },
        { name: "Coliseu", lat: 41.8902, lng: 12.4922, city: "Roma" },
    ];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm sm:p-4">
                <motion.div
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="bg-surface w-full max-w-md max-h-[92vh] sm:rounded-[3rem] rounded-t-[2.5rem] shadow-2xl flex flex-col overflow-hidden border-t border-x border-stroke sm:border"
                >
                    {/* Drag Handle Indicator (visual only) */}
                    <div className="flex justify-center pt-3 pb-1 sm:hidden">
                        <div className="w-12 h-1.5 bg-text-medium/20 rounded-full" />
                    </div>
                    {/* Header */}
                    <div className="px-8 py-7 sm:pt-7 border-b border-stroke flex justify-between items-center bg-accent text-canvas shadow-lg flex-shrink-0">
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

                    {/* Form Content — touch-optimized */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-8" style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>

                        {/* Bucket List Toggle */}
                        {bucketListUrl && (
                            <div className="space-y-4">
                                <button
                                    onClick={() => setShowBucketList(!showBucketList)}
                                    className={`w-full flex items-center justify-between gap-3 px-5 py-4 rounded-2xl border transition-all text-left ${showBucketList ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-canvas/50 border-stroke text-text-medium hover:border-emerald-500/30'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${showBucketList ? 'bg-emerald-500/20' : 'bg-surface'}`}>
                                            📍
                                        </div>
                                        <div>
                                            <span className="text-xs font-black uppercase tracking-widest block">Bucket List</span>
                                            <span className="text-[8px] font-bold text-text-dim uppercase tracking-wider">Escolhe da tua lista de favoritos</span>
                                        </div>
                                    </div>
                                    <List size={18} className={showBucketList ? 'text-emerald-500' : 'text-text-dim'} />
                                </button>

                                <AnimatePresence>
                                    {showBucketList && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="bg-canvas/40 border border-stroke rounded-2xl p-4 space-y-3">
                                                <div className="flex items-center justify-between px-1">
                                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-text-medium">Toca para preencher</span>
                                                    <a href={bucketListUrl} target="_blank" rel="noopener noreferrer" className="text-[8px] font-bold text-accent hover:underline">Abrir no Maps</a>
                                                </div>
                                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                                    {demoItems.map((item, i) => (
                                                        <button
                                                            key={i}
                                                            type="button"
                                                            onClick={() => handleBucketListSelect(item)}
                                                            className="w-full bg-surface/60 border border-stroke p-3 rounded-xl flex justify-between items-center group/item hover:border-emerald-500/50 transition-all text-left"
                                                        >
                                                            <div className="flex flex-col gap-0.5">
                                                                <span className="text-xs font-black text-text-high group-hover/item:text-emerald-500 transition-colors">{item.name}</span>
                                                                {item.city && <span className="text-[8px] font-bold text-text-dim uppercase">{item.city}</span>}
                                                            </div>
                                                            <Plus size={14} className="text-text-dim group-hover/item:text-emerald-500 transition-colors" />
                                                        </button>
                                                    ))}
                                                </div>
                                                <p className="text-[7px] font-medium text-text-dim italic px-1">
                                                    Nota: Os pontos são carregados a partir da tua lista do Google Maps.
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

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
                                    <option value="Alojamento" className="bg-surface">Alojamento</option>
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
                    <div className="p-8 border-t border-stroke bg-surface pb-10 shadow-2xl flex-shrink-0">
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
