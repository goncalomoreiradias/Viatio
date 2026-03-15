"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, ArrowRight, Loader2, Key, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import LanguageToggle from "@/components/LanguageToggle";
import Link from "next/link";

export default function PricingPage() {
    const router = useRouter();
    const { t, language } = useI18n();
    const [couponCode, setCouponCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const handleRedeem = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: "", text: "" });
        setIsLoading(true);

        try {
            const res = await fetch("/api/pricing/redeem", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: couponCode }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: "success", text: data.message });
                setCouponCode("");
                // Optionally redirect to dashboard after a delay
                setTimeout(() => {
                    router.push("/");
                    router.refresh();
                }, 2000);
            } else {
                setMessage({ type: "error", text: data.error });
            }
        } catch (err) {
            setMessage({ type: "error", text: "Connection error. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    const isPT = language === "pt";

    const plans = [
        {
            name: isPT ? "1 Viagem" : "Single Trip",
            price: "€2.99",
            period: isPT ? "pagamento único" : "one-time payment",
            description: isPT ? "Perfeito para organizar a sua próxima grande aventura." : "Perfect for organizing your next big adventure.",
            features: [
                "1 Full Itinerary",
                "Unlimited Locations & Days",
                "Collaborator Invites",
                "Expense Splitting"
            ],
            recommended: false,
        },
        {
            name: isPT ? "Mensal" : "Monthly",
            price: "€5.99",
            period: "/mês",
            description: isPT ? "Acesso total contínuo para nómadas digitais." : "Continuous full access for digital nomads.",
            features: [
                "Unlimited Trips",
                "Priority Support",
                "Advanced Exporting (PDF)",
                "Custom Themes"
            ],
            recommended: true,
        },
        {
            name: isPT ? "Anual" : "Yearly",
            price: "€49.99",
            period: "/ano",
            description: isPT ? "Acesso vitalício à plataforma e 30% de desconto." : "The best value. 30% discount on monthly tier.",
            features: [
                "All Monthly Features",
                "Admin Agency Features",
                "White-label Reports",
                "Early Access to Betas"
            ],
            recommended: false,
        }
    ];

    return (
        <main className="min-h-screen bg-obsidian text-white pb-32 selection:bg-accent-cobalt selection:text-white relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-cobalt/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-magenta/5 blur-[120px] rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.02] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:32px_32px]" />
            </div>

            {/* Navigation / Back Button */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex justify-between items-center">
                <Link href="/" className="group flex items-center gap-3 glass bg-obsidian/40 border-white/5 px-6 py-3 rounded-full hover:bg-white/10 transition-all border shadow-2xl">
                    <ArrowRight className="rotate-180 text-accent-cobalt group-hover:-translate-x-1 transition-transform" size={20} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">{isPT ? "Voltar ao Dashboard" : "Back to Dashboard"}</span>
                </Link>
                <LanguageToggle />
            </nav>

            <div className="max-w-7xl mx-auto px-8 sm:px-12 pt-40 relative z-10">
                <div className="text-center max-w-4xl mx-auto mb-24">
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[12px] font-black text-accent-cobalt tracking-[0.4em] uppercase mb-4"
                    >
                        {isPT ? "Planos e Preços" : "Plans & Pricing"}
                    </motion.p>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-black font-outfit mb-8 tracking-tight leading-none"
                    >
                        {isPT ? "Eleva a tua próxima aventura" : "Elevate your next adventure"}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed"
                    >
                        {isPT ? "Desbloqueia ferramentas de IA premium e planeamento ilimitado para garantir que a tua viagem flui sem problemas." : "Unlock premium AI tools and unlimited planning to ensure your next trip is legendary from start to finish."}
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32 items-center">
                    {plans.map((plan, idx) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * (idx + 1) }}
                            className={`group relative rounded-[3rem] p-10 flex flex-col h-full bg-[#141820] border transition-all duration-500 overflow-hidden shadow-2xl
                                ${plan.recommended 
                                    ? 'border-accent-cobalt scale-[1.05] z-10 shadow-[0_30px_60px_-15px_rgba(46,91,255,0.2)]' 
                                    : 'border-white/5 hover:border-white/10 opacity-90 hover:opacity-100'}
                            `}
                        >
                            {plan.recommended && (
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-all duration-500">
                                    <Sparkles size={80} className="text-accent-cobalt" />
                                </div>
                            )}

                            {plan.recommended && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 translate-y-[-50%] bg-gradient-to-r from-accent-indigo to-accent-magenta text-white text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-[0.2em] shadow-2xl border border-white/20">
                                    {isPT ? "Recomendado" : "Recommended"}
                                </div>
                            )}

                            <div className="mb-10 relative z-10 space-y-2">
                                <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-500">{plan.name}</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black font-outfit text-white tracking-tighter">{plan.price}</span>
                                    <span className="text-gray-500 font-bold text-xs uppercase tracking-widest">{plan.period}</span>
                                </div>
                                <p className="text-gray-400 text-sm font-medium leading-relaxed pt-2">{plan.description}</p>
                            </div>

                            <ul className="space-y-5 mb-12 flex-grow relative z-10">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-4 group/li">
                                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all ${plan.recommended ? 'bg-accent-cobalt/20 shadow-[0_0_15px_rgba(46,91,255,0.3)]' : 'bg-white/5'}`}>
                                            <Check className={`w-3.5 h-3.5 ${plan.recommended ? 'text-accent-cobalt' : 'text-gray-600'}`} strokeWidth={3} />
                                        </div>
                                        <span className="text-gray-300 font-bold text-[13px] tracking-tight group-hover/li:text-white transition-colors">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[11px] transition-all relative z-10 border active:scale-95 flex items-center justify-center gap-2
                                ${plan.recommended
                                    ? 'bg-gradient-to-br from-accent-cobalt via-accent-indigo to-accent-magenta text-white shadow-xl shadow-accent-indigo/20 border-white/20'
                                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border-white/5'
                                }`}>
                                {isPT ? "Selecionar Plano" : "Select Plan"}
                                <ArrowRight size={14} className={plan.recommended ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 transition-opacity'} />
                            </button>
                        </motion.div>
                    ))}
                </div>

                <div className="max-w-2xl mx-auto mt-20 relative">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-accent-cobalt/10 blur-[100px] opacity-30 rounded-full" />
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass bg-obsidian/60 p-12 sm:p-16 rounded-[3.5rem] border border-white/5 shadow-2xl relative z-10"
                    >
                        <h3 className="text-2xl font-black font-outfit mb-3 text-white flex items-center gap-3 uppercase tracking-tight">
                            <Key className="text-accent-cobalt" size={24} />
                            {isPT ? "Código de Acesso" : "Access Code"}
                        </h3>
                        <p className="text-gray-500 text-sm mb-10 font-medium leading-relaxed">
                            {isPT ? "Insira o código promocional fornecido pela administração para desbloquear a sua conta instantaneamente." : "Enter your promotional code provided by administration to unlock your account instantly."}
                        </p>

                        <form onSubmit={handleRedeem} className="flex flex-col sm:flex-row gap-4">
                            <input
                                type="text"
                                placeholder="XXXX-1234"
                                required
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                className="flex-grow bg-white/5 border border-white/10 focus:border-accent-cobalt rounded-[1.5rem] px-8 py-4.5 outline-none font-black uppercase tracking-[0.3em] transition-all text-white placeholder:text-gray-800 text-sm"
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !couponCode}
                                className="px-10 py-4.5 bg-white text-obsidian font-black rounded-full flex items-center justify-center gap-3 transition-all disabled:opacity-50 hover:bg-gray-200 active:scale-95 shadow-2xl uppercase tracking-[0.2em] text-[11px]"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={20} /> : (isPT ? "Ativar" : "Redeem")}
                            </button>
                        </form>

                        {message.text && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`mt-8 p-5 rounded-2xl text-[10px] font-black text-center uppercase tracking-[0.2em] border shadow-2xl ${message.type === 'success'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/10'
                                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-rose-500/10'
                                    }`}
                            >
                                {message.text}
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
