"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Key, Loader2, ArrowRight, Crown } from "lucide-react";
import { useRouter } from "next/navigation";

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpgraded?: () => void;
}

export default function UpgradeModal({ isOpen, onClose, onUpgraded }: UpgradeModalProps) {
    const router = useRouter();
    const [couponCode, setCouponCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const handleRedeem = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: "", text: "" });
        setLoading(true);

        try {
            const res = await fetch("/api/pricing/redeem", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: couponCode }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: "success", text: "Plano ativado com sucesso! 🎉" });
                setCouponCode("");
                setTimeout(() => {
                    onClose();
                    onUpgraded?.();
                }, 1500);
            } else {
                setMessage({ type: "error", text: data.error || "Código inválido." });
            }
        } catch (err) {
            setMessage({ type: "error", text: "Erro de ligação. Tenta novamente." });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
                onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, y: 100, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 100, scale: 0.95 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-md mx-4 sm:mx-0 bg-white dark:bg-gray-900 rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-8 text-center border-b border-white/10">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition text-white border border-white/10"
                        >
                            <X size={20} />
                        </button>

                        <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-inner">
                            <Crown className="text-white animate-pulse" size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-white font-outfit mb-1 tracking-tight">
                            Funcionalidade Premium
                        </h2>
                        <p className="text-white/70 text-sm font-medium">
                            Ativa um plano para desbloquear o AI Trip Planner
                        </p>
                    </div>

                    <div className="p-6 space-y-5">
                        {/* Feature highlights */}
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-brand-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Sparkles size={16} className="text-brand-primary" />
                                </div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Itinerários gerados por AI com locais reais
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-brand-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Key size={16} className="text-brand-secondary" />
                                </div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Coordenadas GPS e links Google Maps incluídos
                                </p>
                            </div>
                        </div>

                        {/* Coupon form */}
                        <div>
                            <h3 className="font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                                <Key size={18} className="text-brand-primary" />
                                Tens um código de acesso?
                            </h3>
                            <form onSubmit={handleRedeem} className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="XXXX-1234"
                                    required
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    className="flex-grow bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 rounded-xl px-4 py-3 outline-none font-mono font-bold uppercase tracking-widest transition-all text-sm"
                                />
                                <button
                                    type="submit"
                                    disabled={loading || !couponCode}
                                    className="py-3 px-5 bg-brand-primary text-white font-bold rounded-xl flex items-center gap-1 transition-all disabled:opacity-50 hover:bg-brand-secondary active:scale-95"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : "Ativar"}
                                </button>
                            </form>

                            {message.text && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`mt-3 p-3 rounded-xl text-sm font-bold text-center ${message.type === "success"
                                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                            : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                                        }`}
                                >
                                    {message.text}
                                </motion.div>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-3">
                            <div className="flex-grow h-px bg-gray-200 dark:bg-gray-700" />
                            <span className="text-xs text-gray-400 font-semibold">OU</span>
                            <div className="flex-grow h-px bg-gray-200 dark:bg-gray-700" />
                        </div>

                        {/* View Plans button */}
                        <button
                            onClick={() => { onClose(); router.push("/pricing"); }}
                            className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                        >
                            Ver Planos <ArrowRight size={18} />
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
