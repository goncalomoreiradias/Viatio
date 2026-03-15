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
            <div className="bg-surface border border-stroke p-8 rounded-[3rem] relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:scale-110 transition-transform">
                    <PieChart size={160} className="text-text-high" />
                </div>
                
                <div className="flex items-center justify-between mb-6">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-medium">GASTO TOTAL</p>
                        <h2 className="text-4xl font-black font-outfit text-text-high">€{formatCurrency(totalSpent)}</h2>
                    </div>
                    {targetBudget > 0 && (
                        <div className="text-right space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-medium">ORÇAMENTO</p>
                            <p className="font-black text-xl text-text-medium opacity-50">€{targetBudget}</p>
                        </div>
                    )}
                </div>

                {targetBudget > 0 && (
                    <div className="space-y-4">
                        <div className="h-2 w-full bg-canvas rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, budgetProgress)}%` }}
                                className={`h-full transition-all duration-1000 ${isOverBudget ? 'bg-rose-500' : 'bg-emerald-500'}`}
                            />
                        </div>
                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                            <span className={isOverBudget ? 'text-rose-500' : 'text-emerald-500'}>
                                {isOverBudget ? 'Orçamento Excedido' : 'Dentro do Orçamento'}
                            </span>
                            <span className="text-text-medium">{budgetProgress.toFixed(0)}% Utilizado</span>
                        </div>
                    </div>
                )}
            </div>

            {/* 2. Debt Optimization (Smart Netting) */}
            <div className="bg-surface border border-stroke rounded-[3rem] p-8 shadow-2xl">
                <h3 className="text-[10px] font-black text-text-medium uppercase tracking-[0.3em] mb-8 flex items-center gap-2 px-2">
                    <Wallet size={14} className="text-accent" /> OTIMIZAÇÃO DE TRANSFERÊNCIAS
                </h3>
                
                {optimizedTransfers.length === 0 ? (
                    <div className="text-center py-6 bg-canvas rounded-[2rem] border border-dashed border-stroke">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-text-medium opacity-50">Tudo liquidado! Ninguém deve nada.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {optimizedTransfers.map((t, idx) => (
                            <div key={idx} className="flex items-center justify-between group/transfer">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-black text-text-high">{t.from}</span>
                                    <div className="flex flex-col items-center">
                                        <ArrowRight size={14} className="text-accent" />
                                        <span className="text-[8px] font-black text-text-medium uppercase">PAGA A</span>
                                    </div>
                                    <span className="text-sm font-black text-text-high">{t.to}</span>
                                </div>
                                <div className="px-5 py-2.5 bg-accent/10 border border-accent/20 rounded-full">
                                    <span className="text-sm font-black text-accent">€{formatCurrency(t.amount)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 3. Category Breakdown */}
            <div className="grid grid-cols-2 gap-4">
                {Object.entries(categoryTotals).map(([cat, amount]) => (
                    <div key={cat} className="bg-surface border border-stroke p-5 rounded-[1.5rem] flex flex-col gap-2 shadow-sm">
                        <span className="text-[9px] font-black uppercase tracking-widest text-text-medium">{cat}</span>
                        <span className="text-xl font-black text-text-high">€{formatCurrency(amount)}</span>
                    </div>
                ))}
            </div>

            {/* 4. Detailed History */}
            <div className="space-y-6">
                <h3 className="text-[10px] font-black text-text-medium uppercase tracking-[0.3em] mb-4 px-4 flex items-center gap-2">
                    <Receipt size={14} className="text-accent" /> HISTÓRICO DE DESPESAS
                </h3>
                
                <div className="space-y-4">
                    {expenses.length === 0 ? (
                        <div className="text-center py-20 bg-surface rounded-[3rem] border border-dashed border-stroke">
                             <p className="text-text-medium font-black uppercase tracking-widest text-[10px] opacity-40">Sem movimentos.</p>
                        </div>
                    ) : (
                        [...expenses].reverse().map((exp) => (
                            <div key={exp.id} className="bg-surface rounded-3xl p-6 flex justify-between items-center shadow-xl border border-stroke hover:border-accent/20 transition-all group">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-canvas flex items-center justify-center text-xl grayscale group-hover:grayscale-0 transition-all">
                                        {exp.category === "Transporte" ? "🚗" : exp.category === "Comida" ? "🍴" : exp.category === "Lazer" ? "🎭" : exp.category === "Alojamento" ? "🏨" : "📦"}
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-black text-text-high tracking-tight text-base">{exp.description}</h4>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-accent">{exp.paidBy}</span>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-text-low">• {new Date(exp.date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-black text-xl text-text-high">€{formatCurrency(exp.amount)}</span>
                                    <button onClick={() => handleDelete(exp.id)} className="p-3 text-text-low hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-all active:scale-90">
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
