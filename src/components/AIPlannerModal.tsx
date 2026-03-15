"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, MapPin, Calendar, Wallet, Users, Compass, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";

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
    const { t } = useI18n();
    const [destination, setDestination] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [budget, setBudget] = useState("");
    const [travelStyle, setTravelStyle] = useState("balanced");
    const [numberOfPeople, setNumberOfPeople] = useState(2);
    const [customRequirements, setCustomRequirements] = useState("");
    const [mapsListUrl, setMapsListUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [phase, setPhase] = useState<"form" | "generating">("form");

    const validateForm = () => {
        if (!destination) return "Por favor, indica um destino.";
        if (!startDate || !endDate) return "As datas de início e fim são obrigatórias.";
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end < start) return "A data de fim não pode ser anterior à de início.";
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

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
                    mapsListUrl,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to generate trip");
            }

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
                className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
                onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

                {/* Modal */}
                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 30, stiffness: 300 }}
                    className="relative w-full max-w-lg glass bg-obsidian/90 sm:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col h-[95vh] sm:h-auto sm:max-h-[90vh] border border-white/10"
                >
                    {/* Header */}
                    <div className="shrink-0 bg-gradient-to-br from-[#D946EF] via-[#8B5CF6] to-[#6366F1] p-8 sm:p-10 relative shadow-2xl">
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-white/20 rounded-full sm:hidden" />
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="absolute top-8 right-8 p-3 bg-white/10 backdrop-blur-xl rounded-full hover:bg-white/20 transition-all text-white disabled:opacity-50 border border-white/20 z-20 active:scale-95 shadow-lg group"
                        >
                            <X size={20} className="group-hover:rotate-90 transition-transform" />
                        </button>
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white/10 backdrop-blur-2xl rounded-[1.5rem] flex items-center justify-center shadow-inner border border-white/20">
                                <Sparkles className="text-white animate-pulse" size={28} />
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-2xl sm:text-3xl font-black text-white font-outfit tracking-tight leading-tight uppercase tracking-widest">AI Planner</h2>
                                <p className="text-white/80 text-xs sm:text-sm font-black uppercase tracking-[0.2em]">{t("dash.hello")}, viaja com magia</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto hide-scrollbar">
                        {phase === "generating" ? (
                            <div className="p-10 sm:p-16 flex flex-col items-center justify-center min-h-[450px] text-center bg-obsidian">
                                <motion.div
                                    animate={{ 
                                        rotate: [0, 360], 
                                        scale: [1, 1.2, 1],
                                        filter: ["blur(0px)", "blur(4px)", "blur(0px)"]
                                    }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="relative mb-12"
                                >
                                    <div className="absolute inset-0 bg-accent-cobalt/30 blur-[40px] rounded-full animate-pulse" />
                                    <Sparkles size={80} className="text-accent-indigo relative z-10 drop-shadow-[0_0_20px_rgba(99,102,241,0.8)]" />
                                </motion.div>
                                <h3 className="text-3xl font-black text-white mb-4 font-outfit tracking-tight leading-tight uppercase tracking-widest">
                                    A Criar Magia...
                                </h3>
                                <p className="text-gray-400 text-sm max-w-xs leading-relaxed font-black uppercase tracking-[0.15em] opacity-80">
                                    A desenhar o teu itinerário perfeito com detalhes exclusivos para ti.
                                </p>
                                <div className="mt-12 w-full max-w-sm">
                                    <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/10 shadow-inner">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-[#D946EF] via-[#8B5CF6] to-[#6366F1] rounded-full shadow-[0_0_20px_rgba(139,92,246,0.5)]"
                                            initial={{ width: "0%" }}
                                            animate={{ width: "98%" }}
                                            transition={{ duration: 30, ease: "circOut" }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
                                {error && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-bold rounded-2xl text-center shadow-sm"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                {/* Destination */}
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] px-2">
                                        <MapPin size={12} className="text-accent-cobalt" /> DESTINO
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Bali, Indonésia"
                                        value={destination}
                                        onChange={(e) => setDestination(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 focus:border-accent-cobalt focus:shadow-[0_0_20px_rgba(46,91,255,0.1)] rounded-[1.5rem] px-6 py-4.5 outline-none font-black transition-all text-white placeholder:text-gray-600 tracking-tight"
                                    />
                                </div>

                                {/* Date Range */}
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] px-2">
                                            <Calendar size={12} className="text-accent-cobalt" /> INÍCIO
                                        </label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 focus:border-accent-cobalt rounded-[1.5rem] px-5 py-4.5 outline-none font-black transition-all text-white text-sm"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] px-2">
                                            <Calendar size={12} className="text-accent-indigo" /> FIM
                                        </label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 focus:border-accent-indigo rounded-[1.5rem] px-5 py-4.5 outline-none font-black transition-all text-white text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Google Maps List Link */}
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] px-2">
                                        <MapPin size={12} /> LISTA GOOGLE MAPS (OPCIONAL)
                                    </label>
                                    <input
                                        type="url"
                                        placeholder="Cola o link da tua lista aqui"
                                        value={mapsListUrl}
                                        onChange={(e) => setMapsListUrl(e.target.value)}
                                        className="w-full bg-emerald-500/5 border border-emerald-500/20 focus:border-emerald-500 focus:shadow-[0_0_20px_rgba(16,185,129,0.1)] rounded-[1.5rem] px-6 py-4.5 outline-none font-black text-emerald-400 placeholder:text-emerald-900/50 transition-all text-sm"
                                    />
                                    <p className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-500 px-2 opacity-60">A IA vai dar prioridade aos pontos de interesse da tua lista.</p>
                                </div>

                                {/* Custom Requirements */}
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] px-2">
                                        <Compass size={12} /> O QUE PROCURAS?
                                    </label>
                                    <textarea
                                        placeholder="Ex: Quero trilhos, praias selvagens e evitar o crowd turístico..."
                                        value={customRequirements}
                                        onChange={(e) => setCustomRequirements(e.target.value)}
                                        rows={3}
                                        className="w-full bg-white/5 border border-white/10 focus:border-amber-500 focus:shadow-[0_0_20px_rgba(245,158,11,0.1)] rounded-[1.5rem] px-6 py-4.5 outline-none font-bold transition-all text-white resize-none text-sm placeholder:text-gray-600"
                                    />
                                </div>

                                {/* Budget & People */}
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] px-2">
                                            <Wallet size={12} className="text-emerald-500" /> ORÇAMENTO
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-black">€</span>
                                            <input
                                                type="number"
                                                placeholder="Ex: 1500"
                                                value={budget}
                                                onChange={(e) => setBudget(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 focus:border-accent-cobalt rounded-[1.5rem] pl-12 pr-6 py-4.5 outline-none font-black text-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] px-2">
                                            <Users size={12} className="text-accent-cobalt" /> PESSOAS
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="20"
                                            value={numberOfPeople}
                                            onChange={(e) => setNumberOfPeople(parseInt(e.target.value) || 2)}
                                            className="w-full bg-white/5 border border-white/10 focus:border-accent-cobalt rounded-[1.5rem] px-6 py-4.5 outline-none font-black text-white"
                                        />
                                    </div>
                                </div>

                                {/* Travel Style */}
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] px-1">
                                        <Compass size={12} className="text-fuchsia-500" /> ESTILO DE VIAGEM
                                    </label>
                                    <div className="grid grid-cols-3 gap-2 pb-4">
                                        {travelStyles.map((style) => (
                                            <button
                                                key={style.value}
                                                type="button"
                                                onClick={() => setTravelStyle(style.value)}
                                                className={`py-3 px-2 rounded-2xl text-[9px] font-black tracking-wider uppercase transition-all border ${travelStyle === style.value
                                                    ? "bg-indigo-600 dark:bg-indigo-500 text-white border-indigo-500 shadow-xl shadow-indigo-500/40 scale-[1.05]"
                                                    : "bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-white/5 hover:border-indigo-500/40"
                                                    }`}
                                            >
                                                {style.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Fixed Sticky Footer for CTA */}
                    <div className="shrink-0 p-8 sm:p-10 bg-obsidian border-t border-white/5 pb-12 sm:pb-10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
                        <button
                            onClick={handleSubmit}
                            disabled={loading || phase === "generating"}
                            className="w-full py-6 bg-gradient-to-br from-[#D946EF] via-[#8B5CF6] to-[#6366F1] text-white font-black rounded-full flex items-center justify-center gap-4 transition-all hover:scale-[1.03] hover:shadow-[0_20px_50px_-10px_rgba(139,92,246,0.6)] active:scale-[0.97] text-lg uppercase tracking-[0.2em] border border-white/20 shadow-2xl disabled:opacity-50 group"
                        >
                            <Sparkles size={24} className={`${loading ? "animate-spin" : "group-hover:rotate-12 transition-transform duration-300"}`} />
                            {loading ? "A processar..." : "Gerar Viagem com AI"}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
