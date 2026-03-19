"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { DayPlan, Location } from "@/types";
import { MapPin, Navigation, Edit2, CheckCircle, GripVertical, Car, Footprints } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { calculateDistance, estimateTravelTime, formatDuration } from "@/lib/maps";
import React from "react";

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

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: day.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 0,
        opacity: isDragging ? 0.6 : 1,
    };

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="bg-surface mb-12 overflow-hidden relative shadow-2xl rounded-[2.5rem] border border-stroke active:scale-[0.99] transition-transform duration-300"
        >
            {/* Header with rich accent */}
            <div className="bg-accent p-8 text-canvas flex justify-between items-center z-10 relative">
                <div className="flex items-center gap-4">
                    <div 
                        {...attributes} 
                        {...listeners}
                        className="p-2 -ml-2 hover:bg-canvas/20 rounded-lg cursor-grab active:cursor-grabbing transition-colors"
                    >
                        <GripVertical size={20} className="opacity-50" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black font-outfit tracking-tighter flex items-center gap-3">
                            {t("nav.day")} {day.dayNumber}
                        </h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">{day.title}</p>
                    </div>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(day); }}
                    className="p-3.5 rounded-full hover:bg-canvas/20 transition-all backdrop-blur-md bg-canvas/10 border border-canvas/20 group active:scale-90"
                    aria-label="Edit Day"
                >
                    <Edit2 size={20} className="group-hover:rotate-12 transition-transform" />
                </button>
            </div>

            <div className="p-8 space-y-8 relative z-10 bg-canvas/20">
                {day.locations.map((loc, index) => (
                    <React.Fragment key={loc.id}>
                        {/* Distance/Time indicator between points */}
                        {index > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="ml-[64px] my-[-16px] relative z-20 flex items-center gap-4 py-2"
                            >
                                <div className="flex items-center gap-3 px-3 py-1.5 bg-surface border border-stroke rounded-xl text-[9px] font-black text-text-medium shadow-xl backdrop-blur-md">
                                    <div className="flex items-center gap-1.5 text-accent">
                                        <Car size={10} />
                                        <span>{formatDuration(estimateTravelTime(calculateDistance(day.locations[index-1].lat, day.locations[index-1].lng, loc.lat, loc.lng), 'drive'))}</span>
                                    </div>
                                    <span className="w-px h-2.5 bg-stroke" />
                                    <div className="flex items-center gap-1.5 text-text-medium">
                                        <Footprints size={10} />
                                        <span>{formatDuration(estimateTravelTime(calculateDistance(day.locations[index-1].lat, day.locations[index-1].lng, loc.lat, loc.lng), 'walk'))}</span>
                                    </div>
                                </div>
                                <div className="text-[9px] font-black text-text-dim uppercase tracking-[0.2em] bg-canvas/40 px-2 py-0.5 rounded-md">
                                    {calculateDistance(day.locations[index-1].lat, day.locations[index-1].lng, loc.lat, loc.lng).toFixed(1)} km
                                </div>
                            </motion.div>
                        )}

                        <motion.div
                            variants={itemVariants}
                            onClick={() => onEdit(day)}
                            className="flex items-start gap-6 p-5 rounded-[1.5rem] hover:bg-canvas transition-all group cursor-pointer border border-transparent hover:border-stroke relative"
                        >
                            <button
                                onClick={(e) => { e.stopPropagation(); onToggleLocation(day.id, loc.id); }}
                                className={`mt-1 flex-shrink-0 transition-all duration-300 z-20 relative rounded-full p-0.5 ${loc.completed ? 'text-accent bg-accent/10' : 'text-text-medium hover:text-accent bg-surface'}`}
                            >
                                <CheckCircle size={28} className={loc.completed ? 'shadow-[0_0_15px_var(--accent)]' : ''} />
                            </button>

                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3 flex-wrap">
                                    {loc.timeSlot && (
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-surface border border-stroke rounded-lg text-[10px] font-black text-accent">
                                            <span className="opacity-50">🕒</span>
                                            {loc.timeSlot}
                                        </div>
                                    )}
                                    <h3 className={`font-black text-xl font-outfit tracking-tight ${loc.completed ? 'text-text-medium/50 line-through' : 'text-text-high group-hover:text-accent transition-colors'}`}>
                                        {loc.name}
                                    </h3>
                                    {loc.tag && (
                                        <span className={`px-4 py-1 rounded-full text-[9px] font-black tracking-[0.1em] uppercase border ${
                                            loc.tag === 'TRANSPORTE' ? 'bg-accent/10 text-accent border-accent/20' :
                                            loc.tag === 'CULTURA' ? 'bg-accent/10 text-accent border-accent/20' :
                                            'bg-accent/10 text-accent border-accent/20'
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
                                className="p-4 text-text-high hover:text-canvas bg-surface hover:bg-accent rounded-2xl shadow-lg transition-all active:scale-95 flex-shrink-0 border border-stroke z-20 group/map"
                                title="Open in Google Maps"
                            >
                                <Navigation size={22} className="group-hover/map:rotate-12 transition-transform" />
                            </a>
                            
                            {/* Glow effect on hover */}
                            <div className="absolute inset-0 bg-accent-cobalt/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.5rem] pointer-events-none" />
                        </motion.div>
                    </React.Fragment>
                ))}

                {day.locations.length === 0 && (
                    <div className="py-12 text-center space-y-4">
                        <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto border border-stroke">
                            <MapPin size={24} className="text-text-medium" />
                        </div>
                        <p className="text-text-medium font-bold uppercase tracking-widest text-[10px]">Sem locais planeados</p>
                        <button 
                            onClick={() => onAddLocation(day.id)}
                            className="btn-primary px-6 py-2.5 text-[10px] uppercase font-black tracking-widest"
                        >
                            + Adicionar Local
                        </button>
                    </div>
                )}
            </div>

            {/* Visual timeline connector - Premium aesthetic */}
            <div className="absolute left-[54px] top-[140px] bottom-[40px] w-[1px] bg-gradient-to-b from-accent/50 via-stroke to-transparent z-[5]"></div>
        </motion.div >
    );
}
