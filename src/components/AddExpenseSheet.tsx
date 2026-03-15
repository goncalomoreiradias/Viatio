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
                                <Plus size={22} /> {t("exp.new")}
                            </h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-canvas/70">Otimiza as tuas despesas em grupo</p>
                        </div>
                        <button onClick={onClose} className="p-3 bg-canvas/10 hover:bg-canvas/20 rounded-full transition-all active:scale-90 border border-canvas/10 shadow-xl">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Form Content */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-8 hide-scrollbar">
                        {/* Category Selector */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black text-text-medium uppercase tracking-[0.3em] px-2 leading-none">
                                CATEGORIA
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setCategory(cat.id)}
                                        className={`px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border flex items-center gap-2 ${category === cat.id 
                                            ? "bg-accent border-accent text-canvas shadow-xl scale-105" 
                                            : "bg-surface border-stroke text-text-medium hover:text-text-high"
                                        }`}
                                    >
                                        <span>{cat.icon}</span>
                                        {cat.id}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black text-text-medium uppercase tracking-[0.3em] px-2 leading-none">
                                DESCRIÇÃO
                            </label>
                            <input
                                type="text"
                                placeholder={t("dash.descPlaceholder")}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="input-surface w-full p-6 text-[15px] font-black"
                                autoFocus
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] px-2 leading-none">
                                    VALOR (€)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-text-medium/50">€</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="input-surface w-full pl-12 pr-6 py-6 text-xl"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[10px] font-black text-text-medium uppercase tracking-[0.3em] px-2 leading-none">
                                    PAGO POR
                                </label>
                                <div className="relative">
                                    <select
                                        value={paidBy}
                                        onChange={(e) => setPaidBy(e.target.value)}
                                        className="input-surface w-full p-6 text-sm appearance-none"
                                    >
                                        {participants.map(person => (
                                            <option key={person} value={person} className="bg-surface text-text-high">{person} {person === currentUser ? (t("fin.you") ? "(" + t("fin.you") + ")" : "") : ""}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-text-medium opacity-50">
                                        <Users size={16} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black text-text-medium uppercase tracking-[0.3em] px-2 leading-none">
                                DATA DA DESPESA
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="input-surface w-full p-6 font-mono"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-8 border-t border-stroke bg-surface pb-12 shadow-2xl">
                        <button
                            onClick={handleSave}
                            className="w-full btn-primary py-5 text-base"
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
