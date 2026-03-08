"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, ArrowRight, Loader2, Key } from "lucide-react";
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
        <div className="min-h-screen bg-brand-bg text-brand-dark dark:text-white pb-20">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-extrabold font-outfit mb-6"
                    >
                        {isPT ? "Escolha o seu nível de aventura" : "Choose your adventure tier"}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-gray-500"
                    >
                        {isPT ? "Desbloqueie ferramentas premium para garantir que a sua viagem flui sem problemas do planeamento ao pagamento de forma justa." : "Unlock premium tools to ensure your trip flows seamlessly from planning to splitting the bill."}
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {plans.map((plan, idx) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * (idx + 1) }}
                            className={`relative rounded-[2rem] p-8 flex flex-col h-full bg-white dark:bg-black/40 border backdrop-blur-sm transition-all hover:shadow-2xl hover:-translate-y-2
                                ${plan.recommended ? 'border-brand-primary shadow-xl shadow-brand-primary/10' : 'border-gray-200 dark:border-gray-800 shadow-lg'}
                            `}
                        >
                            {plan.recommended && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide">
                                    {isPT ? "Recomendado" : "Recommended"}
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mb-3">
                                    <span className="text-4xl font-extrabold font-outfit">{plan.price}</span>
                                    <span className="text-gray-500 font-medium">{plan.period}</span>
                                </div>
                                <p className="text-gray-500 text-sm h-10">{plan.description}</p>
                            </div>

                            <ul className="space-y-4 mb-8 flex-grow">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-primary/20 flex items-center justify-center mt-0.5">
                                            <Check className="w-3.5 h-3.5 text-brand-primary" />
                                        </div>
                                        <span className="text-gray-600 dark:text-gray-300 text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button className={`w-full py-4 rounded-xl font-bold flex justify-center items-center transition-all ${plan.recommended
                                ? 'bg-brand-primary text-white hover:bg-brand-secondary shadow-lg shadow-brand-primary/30'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}>
                                {isPT ? "Selecionar Plano" : "Select Plan"}
                            </button>
                        </motion.div>
                    ))}
                </div>

                <div className="max-w-xl mx-auto glass-card p-8 rounded-3xl border border-brand-primary/30 shadow-2xl shadow-brand-primary/5">
                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                        <Key className="text-brand-primary" />
                        {isPT ? "Tem um Código de Acesso?" : "Have an Access Code?"}
                    </h3>
                    <p className="text-gray-500 text-sm mb-6">
                        {isPT ? "Insira o código promocional fornecido pela administração para desbloquear a sua conta instantaneamente." : "Enter your promotional code provided by administration to unlock your account instantly."}
                    </p>

                    <form onSubmit={handleRedeem} className="flex gap-3">
                        <input
                            type="text"
                            placeholder="XXXX-1234"
                            required
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            className="flex-grow bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 rounded-xl px-4 py-3 outline-none font-medium uppercase tracking-widest transition-all"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !couponCode}
                            className="py-3 px-6 bg-brand-dark dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 hover:bg-black dark:hover:bg-gray-200"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Redeem"}
                        </button>
                    </form>

                    {message.text && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`mt-4 p-3 rounded-lg text-sm font-bold text-center ${message.type === 'success'
                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                }`}
                        >
                            {message.text}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
