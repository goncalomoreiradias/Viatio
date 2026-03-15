"use client";

import { Expense, Itinerary } from "@/types";
import { Receipt, Users, Calculator, Trash2, ArrowRight, Wallet, PieChart } from "lucide-react";
import { optimizeTransfers } from "@/lib/financeUtils";
import { motion, AnimatePresence } from "framer-motion";

interface FinanceWidgetProps {
    itinerary: Itinerary;
    onSave: (itinerary: Itinerary) => void;
    currentUser: string;
}

export default function FinanceWidget({ itinerary, onSave, currentUser }: FinanceWidgetProps) {
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
        if (confirm("Tens a certeza?")) {
            onSave({
                ...itinerary,
                expenses: expenses.filter(e => e.id !== id)
            });
        }
    };

    const formatCurrency = (val: number) => val.toFixed(2);

    return (
        <div className="flex flex-col gap-8 pb-32">
            {/* 1. Budget Tracker Card */}
            <div className="glass-card bg-obsidian/40 border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:scale-110 transition-transform">
                    <PieChart size={160} />
                </div>
                
                <div className="flex items-center justify-between mb-6">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">GASTO TOTAL</p>
                        <h2 className="text-4xl font-black font-outfit text-white">€{formatCurrency(totalSpent)}</h2>
                    </div>
                    {targetBudget > 0 && (
                        <div className="text-right space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">ORÇAMENTO</p>
                            <p className="font-black text-xl text-white/50">€{targetBudget}</p>
                        </div>
                    )}
                </div>

                {targetBudget > 0 && (
                    <div className="space-y-4">
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, budgetProgress)}%` }}
                                className={`h-full transition-all duration-1000 ${isOverBudget ? 'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)]' : 'bg-accent-emerald shadow-[0_0_20px_rgba(16,185,129,0.4)]'}`}
                            />
                        </div>
                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                            <span className={isOverBudget ? 'text-rose-500' : 'text-accent-emerald'}>
                                {isOverBudget ? 'Orçamento Excedido' : 'Dentro do Orçamento'}
                            </span>
                            <span className="text-gray-500">{budgetProgress.toFixed(0)}% Utilizado</span>
                        </div>
                    </div>
                )}
            </div>

            {/* 2. Debt Optimization (Smart Netting) */}
            <div className="bg-[#141820] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-2 px-2">
                    <Wallet size={14} className="text-accent-indigo" /> OTIMIZAÇÃO DE TRANSFERÊNCIAS
                </h3>
                
                {optimizedTransfers.length === 0 ? (
                    <div className="text-center py-6 bg-white/5 rounded-3xl border border-dashed border-white/10">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-600">Tudo liquidado! Ninguém deve nada.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {optimizedTransfers.map((t, idx) => (
                            <div key={idx} className="flex items-center justify-between group/transfer">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-black text-white">{t.from}</span>
                                    <div className="flex flex-col items-center">
                                        <ArrowRight size={14} className="text-accent-indigo" />
                                        <span className="text-[8px] font-black text-gray-600 uppercase">PAGA A</span>
                                    </div>
                                    <span className="text-sm font-black text-white">{t.to}</span>
                                </div>
                                <div className="px-5 py-2.5 bg-accent-indigo/10 border border-accent-indigo/20 rounded-full">
                                    <span className="text-sm font-black text-accent-indigo">€{formatCurrency(t.amount)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 3. Category Breakdown */}
            <div className="grid grid-cols-2 gap-4">
                {Object.entries(categoryTotals).map(([cat, amount]) => (
                    <div key={cat} className="bg-white/5 border border-white/5 p-5 rounded-[1.5rem] flex flex-col gap-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">{cat}</span>
                        <span className="text-xl font-black text-white">€{formatCurrency(amount)}</span>
                    </div>
                ))}
            </div>

            {/* 4. Detailed History */}
            <div className="space-y-6">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4 px-4 flex items-center gap-2">
                    <Receipt size={14} className="text-accent-cobalt" /> HISTÓRICO DE DESPESAS
                </h3>
                
                <div className="space-y-4">
                    {expenses.length === 0 ? (
                        <div className="text-center py-20 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
                             <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">Sem movimentos.</p>
                        </div>
                    ) : (
                        [...expenses].reverse().map((exp) => (
                            <div key={exp.id} className="bg-[#141820] rounded-[2rem] p-6 flex justify-between items-center shadow-xl border border-white/5 hover:border-accent-cobalt/30 transition-all group">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl grayscale group-hover:grayscale-0 transition-all">
                                        {exp.category === "Transporte" ? "🚗" : exp.category === "Comida" ? "🍴" : exp.category === "Lazer" ? "🎭" : exp.category === "Alojamento" ? "🏨" : "📦"}
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-black text-white tracking-tight text-base">{exp.description}</h4>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-accent-cobalt">{exp.paidBy}</span>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-700">• {new Date(exp.date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-black text-xl text-white">€{formatCurrency(exp.amount)}</span>
                                    <button onClick={() => handleDelete(exp.id)} className="p-3 text-gray-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-all active:scale-90">
                                        <Trash2 size={18} />
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
