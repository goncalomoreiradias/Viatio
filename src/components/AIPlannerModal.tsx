"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, MapPin, Calendar, Wallet, Users, Compass, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface AIPlannerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const travelStyles = [
    { value: "adventure", label: "🏔️ Aventura", labelEn: "🏔️ Adventure" },
    { value: "relaxation", label: "🌴 Relaxamento", labelEn: "🌴 Relaxation" },
    { value: "culture", label: "🏛️ Cultura", labelEn: "🏛️ Culture" },
    { value: "foodie", label: "🍜 Gastronomia", labelEn: "🍜 Foodie" },
    { value: "party", label: "🎉 Festa", labelEn: "🎉 Party" },
    { value: "balanced", label: "⚖️ Equilibrado", labelEn: "⚖️ Balanced" },
];

export default function AIPlannerModal({ isOpen, onClose }: AIPlannerModalProps) {
    const router = useRouter();
    const [destination, setDestination] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [budget, setBudget] = useState("");
    const [travelStyle, setTravelStyle] = useState("balanced");
    const [numberOfPeople, setNumberOfPeople] = useState(2);
    const [customRequirements, setCustomRequirements] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [phase, setPhase] = useState<"form" | "generating">("form");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        setPhase("generating");

        try {
            const res = await fetch("/api/ai/plan-trip", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    destination,
                    startDate,
                    endDate,
                    budget: budget ? parseFloat(budget) : undefined,
                    travelStyle,
                    numberOfPeople,
                    customRequirements,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to generate trip");
            }

            // Success — redirect to the new trip
            onClose();
            router.push(`/trips/${data.tripId}`);
        } catch (err: any) {
            setError(err.message || "Something went wrong. Please try again.");
            setPhase("form");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
                onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, y: 100, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 100, scale: 0.95 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-lg mx-4 sm:mx-0 bg-white dark:bg-gray-900 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl max-h-[90vh] overflow-y-auto border border-white/10"
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-8 rounded-t-[2.5rem] z-10 shadow-lg">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="absolute top-6 right-6 p-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition text-white disabled:opacity-50 border border-white/10"
                        >
                            <X size={20} />
                        </button>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-inner border border-white/20">
                                <Sparkles className="text-white animate-pulse" size={28} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white font-outfit tracking-tight">AI Trip Planner</h2>
                                <p className="text-white/70 text-sm font-medium">Personaliza a tua aventura mágica</p>
                            </div>
                        </div>
                    </div>

                    {phase === "generating" ? (
                        <div className="p-12 flex flex-col items-center justify-center min-h-[400px] text-center bg-white dark:bg-gray-950">
                            <motion.div
                                animate={{ 
                                    rotate: 360, 
                                    scale: [1, 1.15, 1],
                                    filter: ["blur(0px)", "blur(2px)", "blur(0px)"]
                                }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <Sparkles size={64} className="text-indigo-500 mb-8 drop-shadow-[0_0_15px_rgba(99,102,241,0.6)]" />
                            </motion.div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 font-outfit">
                                A criar o teu itinerário...
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-base max-w-xs leading-relaxed">
                                A nossa inteligência artificial está a desenhar a viagem perfeita com detalhes únicos para ti.
                            </p>
                            <div className="mt-8 w-full max-w-xs">
                                <div className="h-3 bg-gray-100 dark:bg-gray-800/50 rounded-full overflow-hidden shadow-inner border border-gray-200/50 dark:border-white/5">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                        initial={{ width: "0%" }}
                                        animate={{ width: "95%" }}
                                        transition={{ duration: 25, ease: "easeOut" }}
                                    />
                                </div>
                            </div>
                            {error && (
                                <div className="mt-8 p-6 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-bold rounded-[2rem] shadow-sm">
                                    {error}
                                </div>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="p-8 space-y-7 bg-white dark:bg-gray-950">
                            {error && (
                                <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-bold rounded-2xl text-center shadow-sm">
                                    {error}
                                </div>
                            )}

                            {/* Destination */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] px-1">
                                    <MapPin size={14} className="text-indigo-500" /> DESTINO
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Bali, Indonésia"
                                    required
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl px-5 py-4 outline-none font-bold transition-all dark:text-white"
                                />
                            </div>

                            {/* Date Range */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] px-1">
                                        <Calendar size={14} className="text-indigo-500" /> INÍCIO
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-indigo-500 rounded-2xl px-5 py-4 outline-none font-bold transition-all dark:text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] px-1">
                                        <Calendar size={14} className="text-violet-500" /> FIM
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-indigo-500 rounded-2xl px-5 py-4 outline-none font-bold transition-all dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Custom Requirements */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] px-1">
                                    <Compass size={14} className="text-emerald-500" /> O QUE PROCURAS?
                                </label>
                                <textarea
                                    placeholder="Ex: Quero trilhos, praias selvagens e retiros de yoga. Gostava de evitar zonas muito turísticas."
                                    value={customRequirements}
                                    onChange={(e) => setCustomRequirements(e.target.value)}
                                    rows={3}
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl px-5 py-4 outline-none font-medium transition-all dark:text-white resize-none"
                                />
                            </div>

                            {/* Budget & People */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] px-1">
                                        <Wallet size={14} className="text-emerald-500" /> ORÇAMENTO
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">€</span>
                                        <input
                                            type="number"
                                            placeholder="Ex: 1500"
                                            value={budget}
                                            onChange={(e) => setBudget(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-indigo-500 rounded-2xl pl-10 pr-5 py-4 outline-none font-bold dark:text-white"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] px-1">
                                        <Users size={14} className="text-indigo-500" /> PESSOAS
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="20"
                                        value={numberOfPeople}
                                        onChange={(e) => setNumberOfPeople(parseInt(e.target.value) || 2)}
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-indigo-500 rounded-2xl px-5 py-4 outline-none font-bold dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Travel Style */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] px-1">
                                    <Compass size={14} className="text-fuchsia-500" /> ESTILO DE VIAGEM
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {travelStyles.map((style) => (
                                        <button
                                            key={style.value}
                                            type="button"
                                            onClick={() => setTravelStyle(style.value)}
                                            className={`py-3.5 px-2 rounded-2xl text-[10px] font-black tracking-wider uppercase transition-all border ${travelStyle === style.value
                                                ? "bg-indigo-600 dark:bg-indigo-500 text-white border-indigo-500 shadow-xl shadow-indigo-500/40 scale-[1.05]"
                                                : "bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-white/5 hover:border-indigo-500/40 active:scale-95"
                                                }`}
                                        >
                                            {style.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading || !destination || !startDate || !endDate}
                                    className="w-full py-5 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white font-black rounded-3xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 hover:scale-[1.02] hover:shadow-[0_20px_40px_-10px_rgba(99,102,241,0.5)] active:scale-[0.97] text-lg uppercase tracking-widest border border-white/20 shadow-xl"
                                >
                                    <Sparkles size={24} className="animate-pulse" />
                                    Gerar Itinerário Mágico
                                </button>
                            </div>
                        </form>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
