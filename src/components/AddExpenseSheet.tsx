"use client";

import { useState } from "react";
import { X, Plus, Receipt, Users } from "lucide-react";
import { Expense } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n";

interface AddExpenseSheetProps {
    isOpen: boolean;
    onClose: () => void;
    participants: string[];
    currentUser: string;
    onAdd: (expense: Expense) => void;
}

export default function AddExpenseSheet({ isOpen, onClose, participants, currentUser, onAdd }: AddExpenseSheetProps) {
    const { t, language } = useI18n();
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [paidBy, setPaidBy] = useState(currentUser);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const [category, setCategory] = useState("Outros");

    const categories = [
        { id: "Transporte", icon: "🚗", color: "bg-blue-500/10 text-blue-400" },
        { id: "Comida", icon: "🍴", color: "bg-amber-500/10 text-amber-400" },
        { id: "Lazer", icon: "🎭", color: "bg-purple-500/10 text-purple-400" },
        { id: "Alojamento", icon: "🏨", color: "bg-emerald-500/10 text-emerald-400" },
        { id: "Outros", icon: "📦", color: "bg-gray-500/10 text-gray-400" },
    ];

    const handleSave = () => {
        if (!description || !amount || !paidBy) {
            alert(language === "en" ? "Please fill description, amount and who paid." : "Por favor preenche a descrição, o valor e quem pagou.");
            return;
        }

        onAdd({
            id: `exp-${Date.now()}`,
            description,
            amount: parseFloat(amount),
            paidBy,
            date,
            category
        } as Expense);

        // Reset form
        setDescription("");
        setAmount("");
        setPaidBy(currentUser);
        setDate(new Date().toISOString().split('T')[0]);
        setCategory("Outros");
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
                    className="glass bg-obsidian/95 w-full max-w-md max-h-[92vh] sm:rounded-[2.5rem] rounded-t-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/10"
                >
                    {/* Header */}
                    <div className="px-8 py-7 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-accent-indigo to-accent-magenta text-white shadow-lg">
                        <div className="space-y-1">
                            <h2 className="text-xl font-black uppercase tracking-widest font-outfit leading-tight text-white flex items-center gap-3">
                                <Plus size={22} /> {t("exp.new")}
                            </h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">Otimiza as tuas despesas em grupo</p>
                        </div>
                        <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all active:scale-90 border border-white/10 shadow-xl">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Form Content */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-8 hide-scrollbar">
                        {/* Category Selector */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] px-2 leading-none">
                                CATEGORIA
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setCategory(cat.id)}
                                        className={`px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border flex items-center gap-2 ${category === cat.id 
                                            ? "bg-accent-cobalt border-accent-cobalt text-white shadow-xl scale-105" 
                                            : "bg-white/5 border-white/10 text-gray-500 hover:text-white"
                                        }`}
                                    >
                                        <span>{cat.icon}</span>
                                        {cat.id}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] px-2 leading-none">
                                DESCRIÇÃO
                            </label>
                            <input
                                type="text"
                                placeholder={t("dash.descPlaceholder")}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-6 py-4.5 focus:border-accent-indigo outline-none transition-all font-black text-white placeholder:text-gray-700 tracking-tight"
                                autoFocus
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] px-2 leading-none">
                                    VALOR (€)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-gray-600">€</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full bg-white/5 pl-12 pr-6 py-4.5 rounded-[1.5rem] border border-white/10 focus:border-accent-indigo outline-none font-black text-white text-xl tracking-tight"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] px-2 leading-none">
                                    PAGO POR
                                </label>
                                <div className="relative">
                                    <select
                                        value={paidBy}
                                        onChange={(e) => setPaidBy(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-6 py-4.5 focus:border-accent-indigo outline-none transition-all font-black text-white text-sm appearance-none"
                                    >
                                        {participants.map(person => (
                                            <option key={person} value={person} className="bg-obsidian text-white">{person} {person === currentUser ? (t("fin.you") ? "(" + t("fin.you") + ")" : "") : ""}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                        <Users size={16} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] px-2 leading-none">
                                DATA DA DESPESA
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-6 py-4.5 focus:border-accent-indigo outline-none transition-all font-black text-white font-mono"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-8 border-t border-white/5 bg-obsidian pb-12 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
                        <button
                            onClick={handleSave}
                            className="w-full py-5 bg-gradient-to-br from-accent-indigo to-accent-magenta text-white font-black rounded-full shadow-[0_20px_50px_-10px_rgba(139,92,246,0.4)] flex items-center justify-center gap-3 transition-all active:scale-[0.97] uppercase tracking-[0.2em] text-base border border-white/20"
                        >
                            <Plus size={22} />
                            GUARDAR DESPESA
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
