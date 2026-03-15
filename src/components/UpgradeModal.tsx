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
                    className="bg-surface relative w-full max-w-md mx-4 sm:mx-0 sm:rounded-[3rem] rounded-t-[2.5rem] shadow-2xl overflow-hidden border border-stroke"
                >
                    {/* Header */}
                    <div className="relative bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 p-10 text-center border-b border-white/10 shadow-xl overflow-hidden">
                        {/* Animated background element */}
                        <div className="absolute top-0 left-0 w-full h-full bg-white/5 opacity-20 pointer-events-none skew-y-12 translate-y-20 group-hover:translate-y-0 transition-transform duration-1000" />
                        
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2.5 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all text-white border border-white/10 shadow-xl active:scale-90"
                        >
                            <X size={20} />
                        </button>

                        <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
                            <Crown className="text-white animate-pulse" size={40} />
                        </div>
                        <h2 className="text-3xl font-black text-white font-outfit mb-2 tracking-tight uppercase">
                            Premium
                        </h2>
                        <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.3em]">
                            DESBLOQUEIA O PODER DA AI
                        </p>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* Feature highlights */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 bg-canvas p-4 rounded-2xl border border-stroke group hover:border-accent/30 transition-all">
                                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-accent/20">
                                    <Sparkles size={18} className="text-accent" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-text-high tracking-tight uppercase">Itinerários Mágicos</p>
                                    <p className="text-[10px] text-text-medium font-bold uppercase tracking-widest mt-0.5">Gerados por AI com locais reais</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-canvas p-4 rounded-2xl border border-stroke group hover:border-accent/30 transition-all">
                                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-accent/20">
                                    <Key size={18} className="text-accent" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-text-high tracking-tight uppercase">Exploração Total</p>
                                    <p className="text-[10px] text-text-medium font-bold uppercase tracking-widest mt-0.5">GPS e Links Google Maps incluídos</p>
                                </div>
                            </div>
                        </div>

                        {/* Coupon form */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-text-medium uppercase tracking-[0.3em] px-2 flex items-center gap-2">
                                <Key size={14} className="text-accent" /> TENS UM CÓDIGO?
                            </h3>
                            <form onSubmit={handleRedeem} className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder="XXXX-1234"
                                    required
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    className="input-surface flex-grow p-4 text-sm font-mono"
                                />
                                <button
                                    type="submit"
                                    disabled={loading || !couponCode}
                                    className="px-8 bg-gradient-to-br from-amber-400 to-orange-500 text-canvas font-black rounded-full flex items-center gap-2 transition-all disabled:opacity-50 hover:to-amber-500 active:scale-95 shadow-lg border border-white/10 uppercase tracking-widest text-xs"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : "Ativar"}
                                </button>
                            </form>

                            {message.text && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center border ${message.type === "success"
                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                        }`}
                                >
                                    {message.text}
                                </motion.div>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-6">
                            <div className="flex-grow h-px bg-white/5" />
                            <span className="text-[8px] text-text-dim font-black tracking-[0.4em] uppercase">OU</span>
                            <div className="flex-grow h-px bg-white/5" />
                        </div>

                        {/* View Plans button */}
                        <button
                            onClick={() => { onClose(); router.push("/pricing"); }}
                            className="w-full py-5 bg-canvas text-text-high font-black rounded-full flex items-center justify-center gap-3 hover:bg-stroke transition-all border border-stroke active:scale-[0.98] uppercase tracking-[0.2em] text-xs"
                        >
                            VER PLANOS <ArrowRight size={18} className="text-accent" />
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
