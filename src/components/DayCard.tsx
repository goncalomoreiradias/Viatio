"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { DayPlan, Location } from "@/types";
import { MapPin, Navigation, Edit2, CheckCircle } from "lucide-react";

interface DayCardProps {
    day: DayPlan;
    onEdit: (day: DayPlan) => void;
    onToggleLocation: (dayId: string, locId: string) => void;
    onAddLocation: (dayId: string) => void;
}

export default function DayCard({ day, onEdit, onToggleLocation, onAddLocation }: DayCardProps) {
    const { t } = useI18n();

    // Animation variants
    const cardVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { 
            opacity: 1, 
            scale: 1, 
            transition: { 
                duration: 0.5, 
                ease: "circOut" 
            } 
        }
    } as any;

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }
    };

    return (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="glass-card mb-12 overflow-hidden relative shadow-2xl rounded-[2.5rem] border border-white/5 active:scale-[0.99] transition-transform duration-300"
        >
            {/* Header with rich gradient */}
            <div className="bg-gradient-to-r from-accent-cobalt via-accent-indigo to-accent-magenta p-8 text-white flex justify-between items-center z-10 relative">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black font-outfit tracking-tight flex items-center gap-3">
                        {t("nav.day")} {day.dayNumber}
                    </h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">{day.title}</p>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(day); }}
                    className="p-3.5 rounded-full hover:bg-white/20 transition-all backdrop-blur-md bg-white/10 border border-white/20 group active:scale-90"
                    aria-label="Edit Day"
                >
                    <Edit2 size={20} className="group-hover:rotate-12 transition-transform" />
                </button>
            </div>

            <div className="p-8 space-y-8 relative z-10 bg-black/20">
                {day.locations.map((loc, index) => (
                    <motion.div
                        key={loc.id}
                        variants={itemVariants}
                        onClick={() => onEdit(day)}
                        className="flex items-start gap-6 p-5 rounded-[1.5rem] hover:bg-white/5 transition-all group cursor-pointer border border-transparent hover:border-white/10 relative"
                    >
                        <button
                            onClick={(e) => { e.stopPropagation(); onToggleLocation(day.id, loc.id); }}
                            className={`mt-1 flex-shrink-0 transition-all duration-300 z-20 relative rounded-full p-0.5 ${loc.completed ? 'text-accent-emerald bg-accent-emerald/10' : 'text-gray-500 hover:text-accent-cobalt bg-white/5'}`}
                        >
                            <CheckCircle size={28} className={loc.completed ? 'shadow-[0_0_15px_rgba(16,185,129,0.3)]' : ''} />
                        </button>

                        <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3 flex-wrap">
                                {loc.timeSlot && (
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-accent-cobalt">
                                        <span className="opacity-50">🕒</span>
                                        {loc.timeSlot}
                                    </div>
                                )}
                                <h3 className={`font-black text-xl font-outfit ${loc.completed ? 'text-gray-600 line-through' : 'text-white group-hover:text-accent-cobalt transition-colors'}`}>
                                    {loc.name}
                                </h3>
                                {loc.tag && (
                                    <span className={`px-4 py-1 rounded-full text-[9px] font-black tracking-widest uppercase border ${
                                        loc.tag === 'TRANSPORTE' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                        loc.tag === 'CULTURA' ? 'bg-[#064E3B] text-emerald-400 border-emerald-500/20' :
                                        'bg-accent-cobalt/10 text-accent-cobalt border-accent-cobalt/20'
                                    }`}>
                                        {loc.tag}
                                    </span>
                                )}
                            </div>
                            {loc.description && (
                                <p className={`text-sm leading-relaxed font-medium ${loc.completed ? 'text-gray-600' : 'text-gray-400 group-hover:text-gray-300 transition-colors'}`}>
                                    {loc.description}
                                </p>
                            )}
                        </div>

                        <a
                            href={loc.mapsUrl || `https://maps.google.com/?q=${encodeURIComponent(loc.name)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-4 text-gray-400 hover:text-white bg-white/5 hover:bg-accent-cobalt/20 rounded-2xl shadow-2xl transition-all active:scale-95 flex-shrink-0 border border-white/5 z-20 group/map"
                            title="Open in Google Maps"
                        >
                            <Navigation size={22} className="group-hover/map:rotate-12 transition-transform" />
                        </a>
                        
                        {/* Glow effect on hover */}
                        <div className="absolute inset-0 bg-accent-cobalt/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.5rem] pointer-events-none" />
                    </motion.div>
                ))}

                {day.locations.length === 0 && (
                    <div className="py-12 text-center space-y-4">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5">
                            <MapPin size={24} className="text-gray-600" />
                        </div>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Sem locais planeados</p>
                        <button 
                            onClick={() => onAddLocation(day.id)}
                            className="px-6 py-2.5 bg-accent-cobalt text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                        >
                            + Adicionar Local
                        </button>
                    </div>
                )}
            </div>

            {/* Visual timeline connector - Premium aesthetic */}
            <div className="absolute left-[54px] top-[140px] bottom-[40px] w-[1px] bg-gradient-to-b from-accent-indigo/50 via-gray-800 to-transparent z-[5]"></div>
        </motion.div >
    );
}
