"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface DatePickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (startDate: string, endDate: string) => void;
    initialStart?: string;
    initialEnd?: string;
}

export default function DatePickerModal({ isOpen, onClose, onSave, initialStart = "", initialEnd = "" }: DatePickerModalProps) {
    const { t } = useI18n();
    const [start, setStart] = useState(initialStart);
    const [end, setEnd] = useState(initialEnd);

    const handleSave = () => {
        onSave(start, end);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    onClick={onClose}
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="glass bg-surface relative rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl border border-stroke overflow-hidden"
                >
                    {/* Decorative Background */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/10 blur-[80px] rounded-full" />
                    
                    <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                        <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center border border-accent/20">
                            <Calendar size={32} className="text-accent" />
                        </div>
                        
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black font-outfit text-text-high tracking-tight uppercase leading-none">
                                {t("trip.setDates")}
                            </h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-medium">Planeia o teu tempo</p>
                        </div>

                        <div className="w-full grid grid-cols-1 gap-6">
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[10px] font-black text-text-medium uppercase tracking-[0.3em] px-2 leading-none">
                                    Data de Início
                                </label>
                                <input
                                    type="date"
                                    value={start}
                                    onChange={(e) => setStart(e.target.value)}
                                    className="input-surface w-full p-5 text-base font-black uppercase tracking-widest text-accent text-center sm:text-left"
                                />
                            </div>

                            <div className="flex justify-center py-2">
                                <ArrowRight className="text-stroke rotate-90 sm:rotate-0" size={20} />
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[10px] font-black text-text-medium uppercase tracking-[0.3em] px-2 leading-none">
                                    Data de Fim
                                </label>
                                <input
                                    type="date"
                                    value={end}
                                    onChange={(e) => setEnd(e.target.value)}
                                    className="input-surface w-full p-5 text-base font-black uppercase tracking-widest text-accent text-center sm:text-left"
                                />
                            </div>
                        </div>

                        <div className="w-full grid grid-cols-2 gap-4 pt-4">
                            <button
                                onClick={onClose}
                                className="py-4.5 text-[10px] font-black uppercase tracking-widest text-text-medium hover:text-text-high transition-all"
                            >
                                {t("dash.cancel")}
                            </button>
                            <button
                                onClick={handleSave}
                                className="btn-primary py-4.5 text-[10px] font-black uppercase tracking-widest"
                            >
                                Guardar Datas
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 text-text-dim hover:text-text-high transition-all"
                    >
                        <X size={20} />
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
