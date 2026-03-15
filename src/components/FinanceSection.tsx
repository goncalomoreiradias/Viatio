"use client";

import { Expense, Itinerary } from "@/types";
import { Receipt, Users, Calculator, Trash2, ArrowRight, Wallet, PieChart, Tag } from "lucide-react";
import { optimizeTransfers } from "@/lib/financeUtils";
import { motion, AnimatePresence } from "framer-motion";

interface FinanceSectionProps {
    itinerary: Itinerary;
    onSave: (itinerary: Itinerary) => void;
    currentUser: string;
}

export default function FinanceSection({ itinerary, onSave, currentUser }: FinanceSectionProps) {
    const expenses = itinerary.expenses || [];
    const targetBudget = itinerary.budget || 0;
    
    const participants = (itinerary.participants || []).map((p: any) => typeof p === 'string' ? p : p.name || p.email);
    if (participants.length === 0) participants.push(currentUser);

    const totalSpent = expenses.reduce((sum, exp) => sum + (Number(exp?.amount) || 0), 0);
    const totalPeople = Math.max(1, participants.length);
    const fairShare = totalSpent / totalPeople;

    const budgetProgress = targetBudget > 0 ? (totalSpent / targetBudget) * 100 : 0;
    const isOverBudget = targetBudget > 0 && totalSpent > targetBudget;

    // Debt Netting Logic
    const paidByTotals = expenses.reduce((acc, exp) => {
        if (!exp || !exp.paidBy) return acc;
        acc[exp.paidBy] = (acc[exp.paidBy] || 0) + (Number(exp.amount) || 0);
        return acc;
    }, {} as Record<string, number>);

    const participantBalances = participants.map(person => ({
        name: person,
        balance: (paidByTotals[person] || 0) - fairShare
    }));

    const optimizedTransfers = optimizeTransfers(participantBalances);

    // Categories Breakdown
    const categoryTotals = expenses.reduce((acc, exp) => {
        const cat = exp.category || "Outros";
        acc[cat] = (acc[cat] || 0) + (Number(exp.amount) || 0);
        return acc;
    }, {} as Record<string, number>);

    const handleDelete = (id: string) => {
        if (confirm("Tens a certeza que queres eliminar esta despesa?")) {
            onSave({
                ...itinerary,
                expenses: expenses.filter(e => e.id !== id)
            });
        }
    };

    const formatCurrency = (val: number) => val.toFixed(2);

    return (
        <div className="flex flex-col gap-8 pb-32 max-w-2xl mx-auto w-full">
            {/* 1. Budget Tracker Card */}
            <div className="bg-surface border border-stroke p-8 rounded-[2.5rem] relative overflow-hidden group shadow-2xl">
                <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:scale-110 transition-transform">
                    <PieChart size={160} className="text-text-high" />
                </div>
                
                <div className="flex items-center justify-between mb-6">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-medium">GASTO TOTAL</p>
                        <h2 className="text-4xl font-black font-outfit text-text-high tracking-tighter">€{formatCurrency(totalSpent)}</h2>
                    </div>
                    <div className="text-right space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-medium">{targetBudget > 0 ? "ORÇAMENTO" : "CADA UM"}</p>
                        <p className="font-black text-xl text-text-medium/50 tracking-tight">€{targetBudget > 0 ? targetBudget : formatCurrency(fairShare)}</p>
                    </div>
                </div>

                {targetBudget > 0 && (
                    <div className="space-y-4">
                        <div className="h-2 w-full bg-stroke rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, budgetProgress)}%` }}
                                className={`h-full transition-all duration-1000 ${isOverBudget ? 'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)]' : 'bg-accent shadow-[0_0_20px_var(--accent)]'}`}
                            />
                        </div>
                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                            <span className={isOverBudget ? 'text-rose-500' : 'text-accent'}>
                                {isOverBudget ? 'Orçamento Excedido' : 'Dentro do Orçamento'}
                            </span>
                            <span className="text-text-medium">{budgetProgress.toFixed(0)}% Utilizado</span>
                        </div>
                    </div>
                )}
            </div>

            {/* 2. Debt Optimization (Smart Netting) */}
            <div className="bg-surface border border-stroke rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-[0.02]">
                    <Wallet size={80} className="text-text-high" />
                </div>
                <h3 className="text-[10px] font-black text-text-medium uppercase tracking-[0.3em] mb-8 flex items-center gap-2 px-2">
                    <Wallet size={14} className="text-accent" /> OTIMIZAÇÃO DE TRANSFERÊNCIAS
                </h3>
                
                {optimizedTransfers.length === 0 ? (
                    <div className="text-center py-6 bg-white/5 rounded-3xl border border-dashed border-white/10">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-600">Tudo liquidado! Ninguém deve nada.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {optimizedTransfers.map((t, idx) => (
                            <div key={idx} className="flex items-center justify-between group/transfer px-2">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-black text-text-high">{t.from}</span>
                                    <div className="flex flex-col items-center">
                                        <ArrowRight size={14} className="text-accent animate-pulse" />
                                        <span className="text-[8px] font-black text-text-medium uppercase tracking-tighter">PAGA A</span>
                                    </div>
                                    <span className="text-sm font-black text-text-high">{t.to}</span>
                                </div>
                                <div className="px-5 py-2.5 bg-accent/10 border border-accent/20 rounded-full shadow-lg">
                                    <span className="text-sm font-black text-accent">€{formatCurrency(t.amount)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 3. Category Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Object.entries(categoryTotals).map(([cat, amount]) => (
                    <div key={cat} className="bg-surface border border-stroke p-5 rounded-[1.5rem] flex flex-col gap-2 hover:bg-stroke transition-colors">
                        <span className="text-[9px] font-black uppercase tracking-widest text-text-medium flex items-center gap-2">
                            <Tag size={10} className="text-accent" /> {cat}
                        </span>
                        <span className="text-xl font-black text-text-high tracking-tight">€{formatCurrency(amount)}</span>
                    </div>
                ))}
            </div>

            {/* 4. Detailed History */}
            <div className="space-y-6">
                <h3 className="text-[10px] font-black text-text-medium uppercase tracking-[0.3em] mb-4 px-4 flex items-center gap-2">
                    <Receipt size={14} className="text-accent" /> LISTA DE DESPESAS
                </h3>
                
                <div className="space-y-4">
                    {expenses.length === 0 ? (
                        <div className="text-center py-20 bg-surface rounded-[2.5rem] border border-dashed border-stroke">
                             <Receipt className="mx-auto text-text-medium mb-4 opacity-30" size={48} />
                             <p className="text-text-medium font-black uppercase tracking-widest text-[10px]">Ainda não há despesas registadas.</p>
                        </div>
                    ) : (
                        [...expenses].reverse().map((exp) => (
                            <div key={exp.id || Math.random()} className="bg-surface rounded-[2rem] p-6 flex justify-between items-center shadow-xl border border-stroke hover:border-accent transition-all group active:scale-[0.98]">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-canvas flex items-center justify-center text-xl grayscale group-hover:grayscale-0 transition-all border border-stroke">
                                        {exp.category === "Transporte" ? "🚗" : exp.category === "Comida" ? "🍴" : exp.category === "Lazer" ? "🎭" : exp.category === "Alojamento" ? "🏨" : "📦"}
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-black text-text-high tracking-tight text-lg leading-tight">{exp.description || 'Sem descrição'}</h4>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-accent px-2 py-0.5 bg-accent/5 rounded-full border border-accent/10">{exp.paidBy}</span>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-text-medium">{exp.date ? new Date(exp.date).toLocaleDateString() : 'Sem data'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <span className="font-black text-2xl text-text-high tracking-tighter">€{formatCurrency(exp.amount || 0)}</span>
                                    <button onClick={() => handleDelete(exp.id)} className="p-3 text-text-medium hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-all active:scale-90">
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
