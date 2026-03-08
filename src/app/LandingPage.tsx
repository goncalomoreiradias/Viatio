"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Plane, MapPin, CreditCard, Users, ArrowRight, ShieldCheck } from "lucide-react";
import LanguageToggle from "@/components/LanguageToggle";
import { useI18n } from "@/lib/i18n";

export default function LandingPage() {
    const { t } = useI18n();

    return (
        <div className="min-h-screen bg-brand-bg relative overflow-hidden font-outfit selection:bg-brand-primary/30">
            {/* Dynamic Background Blurs */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-primary/10 rounded-full blur-[150px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-secondary/10 rounded-full blur-[120px] pointer-events-none -translate-x-1/3 translate-y-1/3" />

            {/* Navigation */}
            <nav className="relative z-50 flex items-center justify-between p-6 lg:px-12 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
                        <Plane size={24} className="text-white -rotate-45" />
                    </div>
                    <span className="text-xl font-extrabold text-brand-dark dark:text-white tracking-tight">Viagens Premium</span>
                </div>
                <div className="flex items-center gap-4">
                    <LanguageToggle />
                    <Link
                        href="/login"
                        className="hidden sm:inline-flex px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-brand-primary dark:hover:text-brand-primary transition-colors"
                    >
                        {t("auth.signin_link")}
                    </Link>
                    <Link
                        href="/register"
                        className="px-6 py-2.5 text-sm font-bold bg-brand-dark dark:bg-white text-white dark:text-brand-dark rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10 dark:shadow-white/10"
                    >
                        {t("auth.register_btn")}
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-20 pb-32 lg:pt-32">
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-8 items-center">

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="max-w-2xl"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary font-semibold text-sm mb-6 shadow-inner tracking-wide">
                            <ShieldCheck size={16} /> Secure Group Travel Management
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-extrabold text-brand-dark dark:text-white leading-[1.1] tracking-tight mb-6">
                            Plan the perfect trip. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">
                                Together.
                            </span>
                        </h1>

                        <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed max-w-xl font-inter">
                            The premium, all-in-one platform to orchestrate itineraries, split group expenses fairly, and pin real-time locations on interactive maps.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <Link
                                href="/register"
                                className="w-full sm:w-auto px-8 py-4 bg-brand-primary hover:bg-brand-secondary text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 shadow-brand-primary/30 flex items-center justify-center gap-2 transition-all text-lg"
                            >
                                Start For Free <ArrowRight size={20} className="ml-1" />
                            </Link>
                            <Link
                                href="/login"
                                className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-gray-800 text-brand-dark dark:text-white font-bold rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-brand-primary dark:hover:border-brand-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-center text-lg shadow-sm"
                            >
                                Sign In to Dashboard
                            </Link>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, rotateX: 15 }}
                        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                        transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="relative perspective-1000"
                    >
                        {/* Minimalist Dashboard Mockup */}
                        <div className="relative rounded-3xl overflow-hidden glass-card border border-white/20 shadow-2xl dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] bg-white/50 dark:bg-gray-900/60 backdrop-blur-3xl transform rotate-1 lg:rotate-2">
                            <div className="h-10 border-b border-gray-200/50 dark:border-gray-800/50 flex items-center px-4 gap-2 bg-gray-50/50 dark:bg-black/20">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="flex justify-between items-end mb-8">
                                    <div>
                                        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded-md mb-2"></div>
                                        <div className="h-8 w-48 bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg"></div>
                                    </div>
                                    <div className="h-10 w-24 bg-brand-primary/10 rounded-xl border border-brand-primary/20"></div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="h-32 rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-100 dark:border-gray-700/50 p-4 shadow-sm flex flex-col justify-between">
                                        <MapPin size={24} className="text-gray-400" />
                                        <div className="space-y-2">
                                            <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                            <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                                        </div>
                                    </div>
                                    <div className="h-32 rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-100 dark:border-gray-700/50 p-4 shadow-sm flex flex-col justify-between font-inter relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-5">
                                            <CreditCard size={48} />
                                        </div>
                                        <CreditCard size={24} className="text-brand-secondary" />
                                        <div className="space-y-2">
                                            <div className="h-3 w-20 bg-brand-secondary/30 rounded-full"></div>
                                            <div className="h-5 w-24 bg-brand-secondary/80 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="h-16 rounded-xl bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/50 flex items-center px-4 justify-between shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700"></div>
                                                <div className="space-y-2">
                                                    <div className="h-3 w-24 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                                                    <div className="h-2 w-16 bg-gray-100 dark:bg-gray-700 rounded-full"></div>
                                                </div>
                                            </div>
                                            <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Floating Elements overlay */}
                        <motion.div
                            animate={{ y: [-10, 10, -10] }}
                            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                            className="absolute -right-8 top-12 glass p-4 rounded-2xl shadow-xl border border-white/20 z-20"
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-green-500/20 text-green-500 p-2 rounded-full">
                                    <ShieldCheck size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold dark:text-white">Admin Logs</p>
                                    <p className="text-xs text-gray-500">Fully Protected</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            animate={{ y: [10, -10, 10] }}
                            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                            className="absolute -left-8 bottom-24 glass p-4 rounded-2xl shadow-xl border border-white/20 z-20"
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-brand-primary/20 text-brand-primary p-2 rounded-full">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold dark:text-white">Splitting Costs</p>
                                    <p className="text-xs text-brand-primary font-medium tracking-wide">€45.00 Settled</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
