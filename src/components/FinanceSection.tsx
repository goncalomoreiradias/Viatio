"use client";

import { useState } from "react";
import { Expense, Itinerary } from "@/types";
import { Receipt, Users, Calculator, Plus, User, Trash2 } from "lucide-react";

interface FinanceSectionProps {
    itinerary: Itinerary;
    onSave: (itinerary: Itinerary) => void;
    currentUser: string;
}

export default function FinanceSection({ itinerary, onSave, currentUser }: FinanceSectionProps) {
    const expenses = itinerary.expenses || [];
    
    // Normalize participants to always be strings (names) for the logic, 
    // but keep track of the original session name
    const participants = (itinerary.participants || []).map((p: any) => typeof p === 'string' ? p : p.name || p.email);
    
    // If no participants found, fallback to current user
    if (participants.length === 0) participants.push(currentUser);

    // Quick summary calculations
    const totalSpent = expenses.reduce((sum, exp) => sum + (Number(exp?.amount) || 0), 0);

    // Calculate who paid what
    const paidByTotals = expenses.reduce((acc, exp) => {
        if (!exp || !exp.paidBy) return acc;
        acc[exp.paidBy] = (acc[exp.paidBy] || 0) + (Number(exp.amount) || 0);
        return acc;
    }, {} as Record<string, number>);

    // Use total exact participants rather than only those who have paid something
    const totalPeople = Math.max(1, participants.length);
    const fairShare = totalSpent / totalPeople;

    const handleDelete = (id: string) => {
        if (confirm("Tens a certeza que queres eliminar esta despesa?")) {
            onSave({
                ...itinerary,
                expenses: expenses.filter(e => e.id !== id)
            });
        }
    };

    const formatCurrency = (val: number) => {
        return isNaN(val) ? "0.00" : val.toFixed(2);
    };

    return (
        <div className="flex flex-col gap-6 lg:gap-8 max-w-2xl mx-auto w-full pb-32">
            {/* Top Summary Cards */}
            <div className="grid grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-accent-cobalt to-accent-indigo rounded-[2rem] p-8 text-white shadow-[0_20px_40px_-10px_rgba(46,91,255,0.4)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Calculator size={80} />
                    </div>
                    <div className="flex items-center gap-2 text-white/70 mb-3 relative z-10">
                        <Calculator size={16} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{"TOTAL"}</span>
                    </div>
                    <h2 className="text-4xl font-black font-outfit tracking-tight relative z-10">€{formatCurrency(totalSpent)}</h2>
                </div>

                <div className="glass-card bg-[#141820]/80 rounded-[2rem] p-8 shadow-2xl border border-white/5 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-gray-500 mb-3">
                        <Users size={16} />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">CADA UM</span>
                    </div>
                    <h2 className="text-3xl font-black font-outfit tracking-tight text-white group">
                        €{formatCurrency(fairShare)}
                    </h2>
                    {totalPeople > 1 && (
                        <div className="mt-2 px-3 py-1 bg-white/5 rounded-full w-fit border border-white/5">
                            <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">Dividido por {totalPeople}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Who Paid What Component */}
            {participants.length > 0 && (
                <div className="bg-[#141820] rounded-[2rem] p-8 shadow-2xl border border-white/5">
                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-2 p-1">
                        <User size={14} className="text-accent-indigo" /> QUEM DEVE A QUEM?
                    </h3>
                    <div className="space-y-6">
                        {participants.map((person, idx) => {
                            const paid = paidByTotals[person] || 0;
                            const balance = paid - fairShare;
                            const isMe = person === currentUser;

                            // To gracefully handle 0 balance due to floating point precision:
                            const displayBalance = Math.abs(balance) < 0.01 ? 0 : balance;

                            return (
                                <div key={`${person}-${idx}`} className="flex justify-between items-center group/person">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs ${isMe ? 'bg-accent-cobalt text-white' : 'bg-white/5 text-gray-400'}`}>
                                            {person.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <span className={`text-sm font-black tracking-tight ${isMe ? 'text-white' : 'text-gray-300'}`}>
                                                {person} {isMe && "(Tu)"}
                                            </span>
                                            <p className="font-black text-[9px] uppercase tracking-widest text-gray-600">Pagou: €{formatCurrency(paid)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-black tracking-tight ${displayBalance === 0 ? 'text-gray-500' : displayBalance > 0 ? 'text-accent-emerald' : 'text-red-400'}`}>
                                            {displayBalance === 0 ? `TUDO CERTO` : displayBalance > 0 ? `+ RECEBE €${formatCurrency(displayBalance)}` : `- DEVE €${formatCurrency(Math.abs(displayBalance))}`}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Transaction List */}
            <div>
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-6 px-4 flex items-center gap-2">
                    <Receipt size={14} className="text-accent-cobalt" /> LISTA DE DESPESAS
                </h3>

                {expenses.length === 0 ? (
                    <div className="text-center py-16 bg-white/5 rounded-[2rem] border border-dashed border-white/10">
                        <Receipt className="mx-auto text-gray-700 mb-4 opacity-50" size={48} />
                        <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">Ainda não há despesas registadas.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {[...expenses].reverse().map((exp) => {
                            if (!exp) return null;
                            const expDate = exp.date ? new Date(exp.date).toLocaleDateString() : 'Sem data';

                            return (
                                <div key={exp.id || Math.random().toString()} className="bg-[#141820] rounded-[1.5rem] p-6 flex justify-between items-center shadow-2xl border border-white/5 group hover:border-accent-cobalt/20 transition-all active:scale-[0.98]">
                                    <div className="flex-1 space-y-2">
                                        <h4 className="font-black text-white tracking-tight text-lg">{exp.description || 'Despesa'}</h4>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-white/5 px-3 py-1 rounded-full text-gray-400 border border-white/5">{exp.paidBy || 'Desconhecido'}</span>
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-600 opacity-50">{expDate}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <span className="font-black text-2xl text-accent-cobalt tracking-tight">€{formatCurrency(exp.amount || 0)}</span>
                                        <button
                                            onClick={() => handleDelete(exp.id)}
                                            className="p-3 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-all active:scale-90"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
