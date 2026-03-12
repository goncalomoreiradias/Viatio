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
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl p-5 text-white shadow-xl shadow-brand-primary/10">
                    <div className="flex items-center gap-2 text-white/80 mb-2">
                        <Calculator size={18} />
                        <span className="text-sm font-semibold uppercase tracking-wider">Total</span>
                    </div>
                    <h2 className="text-3xl font-bold font-inter tracking-tight">€{formatCurrency(totalSpent)}</h2>
                </div>

                <div className="glass-card bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                        <Users size={18} />
                        <span className="text-sm font-semibold uppercase tracking-wider">Por Pessoa</span>
                    </div>
                    <h2 className="text-2xl font-bold font-inter tracking-tight text-brand-accent">
                        €{formatCurrency(fairShare)}
                    </h2>
                    {totalPeople > 1 && <p className="text-xs text-gray-400 mt-1">A dividir por {totalPeople}</p>}
                </div>
            </div>

            {/* Who Paid What Component */}
            {participants.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <User size={18} className="text-brand-secondary" /> Quem deve a quem?
                    </h3>
                    <div className="space-y-4">
                        {participants.map((person, idx) => {
                            const paid = paidByTotals[person] || 0;
                            const balance = paid - fairShare;
                            const isMe = person === currentUser;

                            // To gracefully handle 0 balance due to floating point precision:
                            const displayBalance = Math.abs(balance) < 0.01 ? 0 : balance;

                            return (
                                <div key={`${person}-${idx}`} className="flex justify-between items-center">
                                    <span className={`font-medium ${isMe ? 'text-brand-primary font-bold' : 'text-gray-700 dark:text-gray-300'}`}>
                                        {person} {isMe && "(Tu)"}
                                    </span>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-500 text-xs">Pagou: €{formatCurrency(paid)}</p>
                                        <p className={`text-sm font-bold mt-0.5 ${displayBalance === 0 ? 'text-gray-400' : displayBalance > 0 ? 'text-green-500' : 'text-red-400'}`}>
                                            {displayBalance === 0 ? `Tudo certo` : displayBalance > 0 ? `+ Recebe €${formatCurrency(displayBalance)}` : `- Deve €${formatCurrency(Math.abs(displayBalance))}`}
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
                <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4 px-1 flex items-center gap-2">
                    <Receipt size={18} className="text-brand-primary" /> Lista de Despesas
                </h3>

                {expenses.length === 0 ? (
                    <div className="text-center py-10 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                        <Receipt className="mx-auto text-gray-300 mb-3" size={32} />
                        <p className="text-gray-500 font-medium tracking-tight">Ainda não há despesas registadas.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {[...expenses].reverse().map((exp) => {
                            if (!exp) return null;
                            const expDate = exp.date ? new Date(exp.date).toLocaleDateString() : 'Sem data';

                            return (
                                <div key={exp.id || Math.random().toString()} className="bg-white dark:bg-gray-800 rounded-xl p-4 flex justify-between items-center shadow-sm border border-gray-100 dark:border-gray-700 group hover:border-gray-200 transition">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-800 dark:text-gray-100">{exp.description || 'Despesa'}</h4>
                                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                            <span className="font-medium bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-sm">{exp.paidBy || 'Desconhecido'}</span>
                                            <span>• {expDate}</span>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-bold text-lg text-brand-primary">€{formatCurrency(exp.amount || 0)}</span>
                                        <button
                                            onClick={() => handleDelete(exp.id)}
                                            className="text-gray-300 hover:text-red-400 transition lg:opacity-0 lg:group-hover:opacity-100"
                                        >
                                            <Trash2 size={18} />
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
