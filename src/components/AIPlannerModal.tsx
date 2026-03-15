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
    const { t, language } = useI18n();
    const [destination, setDestination] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [budget, setBudget] = useState("");
    const [travelStyle, setTravelStyle] = useState<string[]>(["balanced"]);
    const [numberOfPeople, setNumberOfPeople] = useState<number | "">(2);
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
                    travelStyle: travelStyle.join(", "),
                    numberOfPeople: numberOfPeople === "" ? 2 : numberOfPeople,
                    customRequirements,
                    mapsListUrl,
                    language, // Added language parameter
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

                {/* Modal Content */}
                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    drag="y"
                    dragConstraints={{ top: 0 }}
                    dragElastic={0.2}
                    onDragStart={() => {
                        document.body.style.overflow = "hidden";
                    }}
                    onDragEnd={(_, info) => {
                        if (info.offset.y > 150) {
                            document.body.style.overflow = "auto";
                            onClose();
                        }
                    }}
                    className="relative w-full max-w-full sm:max-w-lg glass bg-slate-900 sm:rounded-[3rem] rounded-t-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-[92vh] sm:h-auto sm:max-h-[85vh] border-t border-x border-white/10 sm:border touch-action-pan-y"
                >
                    {/* Drag Handle Indicator */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/20 rounded-full sm:hidden z-[110]" />
                    
                    {/* Sticky Header */}
                    <div className="shrink-0 bg-gradient-to-br from-[#D946EF] via-[#8B5CF6] to-[#6366F1] p-6 sm:p-7 relative shadow-xl overflow-hidden sticky top-0 z-[100] backdrop-blur-xl border-b border-white/10">
                        {/* Decorative glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -rotate-45 translate-x-12 -translate-y-12" />
                        
                        <button
                            onClick={() => {
                                document.body.style.overflow = "auto";
                                onClose();
                            }}
                            disabled={loading}
                            className="absolute top-5 right-5 p-2.5 bg-white/10 backdrop-blur-xl rounded-full hover:bg-white/20 transition-all text-white disabled:opacity-50 border border-white/20 z-20 active:scale-95 group"
                        >
                            <X size={18} className="group-hover:rotate-90 transition-transform" />
                        </button>
                        
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-2xl rounded-2xl flex items-center justify-center shadow-inner border border-white/10">
                                <Sparkles className="text-white animate-pulse" size={24} />
                            </div>
                            <div className="space-y-0.5">
                                <h2 className="text-xl sm:text-2xl font-black text-white font-outfit tracking-tighter uppercase whitespace-normal leading-none">{t("ai.title")}</h2>
                                <p className="text-white/60 text-[9px] font-black uppercase tracking-[0.2em]">{t("ai.subtitle")}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto hide-scrollbar">
                        {phase === "generating" ? (
                            <div className="px-[5%] py-10 sm:py-16 flex flex-col items-center justify-center min-h-[450px] text-center bg-obsidian">
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
                                <h3 className="text-2xl sm:text-3xl font-black text-white mb-4 font-outfit tracking-tight leading-tight uppercase tracking-widest px-4">
                                    {t("ai.generating")}
                                </h3>
                                <p className="text-gray-400 text-[10px] sm:text-sm max-w-xs leading-relaxed font-black uppercase tracking-[0.15em] opacity-80">
                                    {t("ai.generatingDesc")}
                                </p>
                                <div className="mt-12 w-full max-w-xs sm:max-w-sm">
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
                            <form onSubmit={handleSubmit} className="px-[5%] py-8 space-y-8 overflow-x-hidden">
                                {error && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-black rounded-2xl text-center shadow-lg uppercase tracking-wider"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                {/* Destination */}
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] px-2">
                                        <MapPin size={12} className="text-accent-cobalt" /> {t("ai.destination")}
                                    </label>
                                    <input
                                        type="text"
                                        placeholder={t("ai.placeholder.destination")}
                                        value={destination}
                                        onChange={(e) => setDestination(e.target.value)}
                                        className="w-full bg-white/[0.07] border border-white/10 focus:border-accent-cobalt focus:shadow-[0_0_25px_rgba(46,91,255,0.15)] rounded-2xl px-5 py-4.5 outline-none font-black transition-all text-white placeholder:text-gray-700 text-[14px] max-w-full"
                                    />
                                </div>

                                {/* Date Range - Liquid Grid */}
                                <div className="grid grid-cols-1 xs:grid-cols-2 gap-5">
                                    <div className="space-y-2.5">
                                        <label className="flex items-center gap-2 text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] px-1">
                                            <Calendar size={10} className="text-accent-cobalt" /> {t("ai.start")}
                                        </label>
                                        <div className="relative group">
                                            <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none group-focus-within:text-accent-cobalt transition-colors" />
                                            <input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 focus:border-accent-cobalt rounded-2xl pl-12 pr-4 py-4 outline-none font-black transition-all text-white text-[13px] appearance-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2.5">
                                        <label className="flex items-center gap-2 text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] px-1">
                                            <Calendar size={10} className="text-accent-indigo" /> {t("ai.end")}
                                        </label>
                                        <div className="relative group">
                                            <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none group-focus-within:text-accent-indigo transition-colors" />
                                            <input
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 focus:border-accent-indigo rounded-2xl pl-12 pr-4 py-4 outline-none font-black transition-all text-white text-[13px] appearance-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Budget & People - Liquid Grid */}
                                <div className="grid grid-cols-1 xs:grid-cols-2 gap-5">
                                    <div className="space-y-2.5">
                                        <label className="flex items-center gap-2 text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] px-1">
                                            <Wallet size={10} className="text-emerald-500" /> {t("ai.budget")}
                                        </label>
                                        <div className="relative group">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 font-black text-xs group-focus-within:text-emerald-500 transition-colors">€</span>
                                            <input
                                                type="number"
                                                placeholder={t("ai.placeholder.budget")}
                                                value={budget}
                                                onChange={(e) => setBudget(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 focus:border-accent-cobalt rounded-2xl pl-12 pr-4 py-4 outline-none font-black text-white text-[13px] placeholder:text-gray-800"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2.5">
                                        <label className="flex items-center gap-2 text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] px-1">
                                            <Users size={10} className="text-accent-cobalt" /> {t("ai.guests")}
                                        </label>
                                        <div className="relative group">
                                            <Users size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none group-focus-within:text-accent-cobalt transition-colors" />
                                            <input
                                                type="number"
                                                min="1"
                                                max="20"
                                                value={numberOfPeople}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === "") {
                                                        setNumberOfPeople("");
                                                    } else {
                                                        const parsed = parseInt(val);
                                                        if (!isNaN(parsed)) setNumberOfPeople(parsed);
                                                    }
                                                }}
                                                className="w-full bg-white/[0.07] border border-white/10 focus:border-accent-cobalt rounded-2xl pl-12 pr-4 py-4 outline-none font-black text-white text-[14px] appearance-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Google Maps List Link */}
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] px-1">
                                        <MapPin size={10} /> {t("ai.googleMaps")}
                                    </label>
                                    <input
                                        type="url"
                                        placeholder={t("ai.placeholder.maps")}
                                        value={mapsListUrl}
                                        onChange={(e) => setMapsListUrl(e.target.value)}
                                        className="w-full bg-emerald-500/10 border border-emerald-500/20 focus:border-emerald-500 rounded-2xl px-5 py-4.5 outline-none font-black text-emerald-400 placeholder:text-emerald-900/40 transition-all text-[13px]"
                                    />
                                </div>

                                {/* Travel Style - Horizontal Smooth Slider */}
                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] px-1">
                                        <Compass size={10} className="text-fuchsia-500" /> {t("ai.travelStyle")}
                                    </label>
                                    <div className="flex gap-2.5 overflow-x-auto pb-4 pt-1 scrollbar-hide -mx-1 px-1 snap-x snap-mandatory">
                                        {travelStyles.map((style) => (
                                            <button
                                                key={style.value}
                                                type="button"
                                                onClick={() => {
                                                    setTravelStyle(prev => 
                                                        prev.includes(style.value)
                                                            ? prev.filter(s => s !== style.value)
                                                            : [...prev, style.value]
                                                    );
                                                }}
                                                className={`shrink-0 py-2.5 px-4 rounded-xl text-[10px] font-black tracking-wider uppercase transition-all border whitespace-nowrap ${travelStyle.includes(style.value)
                                                    ? "bg-accent-cobalt text-white border-accent-cobalt shadow-[0_10px_20px_-5px_rgba(46,91,255,0.4)] scale-105"
                                                    : "bg-white/5 text-gray-500 border-white/5 hover:border-white/10"
                                                    }`}
                                            >
                                                {language === 'en' ? style.labelEn : style.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Custom Requirements */}
                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 text-[9px] font-black text-amber-500 uppercase tracking-[0.2em] px-1">
                                        <Compass size={10} /> {t("ai.customNeeds")}
                                    </label>
                                    <textarea
                                        placeholder={t("ai.placeholder.needs")}
                                        value={customRequirements}
                                        onChange={(e) => setCustomRequirements(e.target.value)}
                                        rows={3}
                                        className="w-full bg-white/5 border border-white/10 focus:border-amber-500 rounded-2xl px-5 py-4.5 outline-none font-bold transition-all text-white resize-none text-[13px] placeholder:text-gray-700"
                                    />
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Fixed Sticky Footer for CTA with Glassmorphism */}
                    <div className="shrink-0 p-6 sm:p-8 bg-slate-900/80 backdrop-blur-2xl border-t border-white/10 pb-12 sm:pb-8 sticky bottom-0 z-[100]">
                        <button
                            onClick={handleSubmit}
                            disabled={loading || phase === "generating"}
                            className="w-full py-5 bg-gradient-to-br from-[#D946EF] via-[#8B5CF6] to-[#6366F1] text-white font-black rounded-2xl flex items-center justify-center gap-4 transition-all hover:shadow-[0_20px_50px_-10px_rgba(139,92,246,0.5)] active:scale-[0.98] text-[14px] uppercase tracking-widest border border-white/20 disabled:opacity-50 group shadow-2xl"
                        >
                            <Sparkles size={20} className={`${loading ? "animate-spin" : "group-hover:rotate-12 transition-transform duration-300"}`} />
                            {loading ? "Planning..." : t("ai.generateBtn")}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
