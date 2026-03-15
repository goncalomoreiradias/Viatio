"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Plane, MapPin, CreditCard, Users, ArrowRight, ShieldCheck, Sparkles, PieChart, Layout, MessageSquare } from "lucide-react";
import LanguageToggle from "@/components/LanguageToggle";
import { useI18n } from "@/lib/i18n";
import { useEffect, useState } from "react";

export default function LandingPage() {
    const { t } = useI18n();
    const { scrollY } = useScroll();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        return scrollY.onChange((latest) => {
            setIsScrolled(latest > 50);
        });
    }, [scrollY]);

    const opacity = useTransform(scrollY, [0, 200], [1, 0]);
    const scale = useTransform(scrollY, [0, 200], [1, 0.95]);

    return (
        <div className="min-h-screen bg-slate-950 relative overflow-hidden font-outfit selection:bg-accent-indigo/30 text-white">
            {/* Cinematic Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent-indigo/20 rounded-full blur-[120px] animate-mesh" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent-magenta/10 rounded-full blur-[120px] animate-mesh" style={{ animationDelay: '-5s' }} />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-accent-cobalt/15 rounded-full blur-[100px] animate-mesh" style={{ animationDelay: '-10s' }} />
                <div className="absolute inset-0 noise-overlay opacity-[0.4] mix-blend-overlay" />
            </div>

            {/* Glassy Navbar */}
            <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${isScrolled ? 'py-4 bg-slate-950/50 backdrop-blur-xl border-b border-white/5' : 'py-8 bg-transparent'}`}>
                <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-12 h-12 bg-gradient-to-br from-accent-cobalt via-accent-indigo to-accent-magenta rounded-2xl flex items-center justify-center shadow-2xl shadow-accent-indigo/20 group-hover:scale-110 transition-transform duration-500 rotate-[-5deg] group-hover:rotate-0">
                            <Plane size={28} className="text-white -rotate-45" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter uppercase italic">Think Tracker</span>
                    </div>

                    <div className="flex items-center gap-8">
                        <LanguageToggle />
                        <Link
                            href="/login"
                            className="hidden md:inline-flex text-sm font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-colors"
                        >
                            {t("auth.signin_link")}
                        </Link>
                        <Link
                            href="/register"
                            className="px-8 py-3.5 bg-white text-slate-950 text-sm font-black rounded-full uppercase tracking-widest hover:bg-accent-indigo hover:text-white transition-all transform hover:scale-105 active:scale-95 shadow-[0_20px_40px_-10px_rgba(255,255,255,0.2)]"
                        >
                            {t("auth.register_btn")}
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-40 pb-20">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    
                    <motion.div
                        style={{ opacity, scale }}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-white font-black text-[10px] mb-8 shadow-2xl tracking-[0.3em] uppercase backdrop-blur-md">
                            <div className="w-2 h-2 bg-accent-magenta rounded-full animate-pulse" />
                            {t("landing.social.trusted")}
                        </div>

                        <h1 className="text-6xl lg:text-[5.5rem] font-serif font-medium leading-[0.95] tracking-tight mb-8">
                            {t("landing.hero.title")} <br />
                            <span className="italic font-light text-accent-indigo">{t("landing.hero.title2")}</span>
                        </h1>

                        <p className="text-xl text-gray-400 mb-12 leading-relaxed max-w-xl font-light tracking-wide lg:pr-12">
                            {t("landing.hero.subtitle")}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <Link
                                href="/register"
                                className="w-full sm:w-auto px-10 py-5 bg-gradient-to-br from-accent-cobalt to-accent-indigo text-white font-black rounded-[2rem] shadow-[0_25px_50px_-12px_rgba(46,91,255,0.5)] flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 uppercase tracking-widest text-xs border border-white/20 group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                <span className="relative z-10">{t("landing.hero.cta.primary")}</span>
                                <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <Link
                                href="/login"
                                className="w-full sm:w-auto px-10 py-5 bg-white/5 backdrop-blur-xl text-white font-black rounded-[2rem] border border-white/10 hover:bg-white/10 transition-all uppercase tracking-widest text-xs hover:border-white/20 flex items-center justify-center gap-3"
                            >
                                <Layout size={18} className="opacity-50" />
                                {t("landing.hero.cta.secondary")}
                            </Link>
                        </div>

                        {/* Social Proof Logos */}
                        <div className="mt-20 flex flex-wrap items-center gap-10 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                             <div className="flex items-center gap-2 font-black text-xl tracking-tighter opacity-50"><MapPin size={24} /> MAPS</div>
                             <div className="flex items-center gap-2 font-black text-xl tracking-tighter opacity-50"><CreditCard size={24} /> SPLITWISE</div>
                             <div className="flex items-center gap-2 font-black text-xl tracking-tighter opacity-50 uppercase italic">Booking.com</div>
                        </div>
                    </motion.div>

                    {/* Mockup App - The Right Side Visual */}
                    <div className="relative">
                         <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="relative z-20 perspective-1000"
                         >
                            <div className="glass bg-[#0F172A]/80 border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden backdrop-blur-3xl transform rotate-[-2deg] lg:rotate-[-4deg]">
                                {/* Browser Header */}
                                <div className="h-12 border-b border-white/5 flex items-center px-6 gap-2 bg-white/5">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-rose-500/30 border border-rose-500/20"></div>
                                        <div className="w-3 h-3 rounded-full bg-amber-500/30 border border-amber-500/20"></div>
                                        <div className="w-3 h-3 rounded-full bg-emerald-500/30 border border-emerald-500/20"></div>
                                    </div>
                                    <div className="flex-1 max-w-[200px] h-6 bg-black/20 rounded-full mx-auto" />
                                </div>

                                {/* Content */}
                                <div className="p-8 space-y-8">
                                    {/* Map & Live Pins Section */}
                                    <div className="relative h-48 bg-slate-800/50 rounded-3xl overflow-hidden border border-white/5 group">
                                         <div className="absolute inset-0 bg-[#1E293B] flex items-center justify-center opacity-30">
                                            <div className="w-full h-full noise-overlay opacity-20" />
                                         </div>
                                         <div className="absolute inset-0 flex items-center justify-center">
                                             <div className="relative w-full h-full">
                                                  {/* Pins with avatars */}
                                                  <motion.div 
                                                    animate={{ y: [0, -5, 0] }}
                                                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                                                    className="absolute top-10 left-[20%] p-1 bg-accent-cobalt rounded-full shadow-2xl border-2 border-slate-950"
                                                  >
                                                      <div className="w-8 h-8 rounded-full bg-slate-500 overflow-hidden">
                                                          <img src="https://ui-avatars.com/api/?name=John+Doe&background=random" alt="Avatar" className="w-full h-full object-cover" />
                                                      </div>
                                                  </motion.div>
                                                  <motion.div 
                                                    animate={{ y: [0, -5, 0] }}
                                                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }}
                                                    className="absolute bottom-12 right-[30%] p-1 bg-accent-magenta rounded-full shadow-2xl border-2 border-slate-950"
                                                  >
                                                      <div className="w-8 h-8 rounded-full bg-slate-500 overflow-hidden">
                                                          <img src="https://ui-avatars.com/api/?name=Jane+Smith&background=random" alt="Avatar" className="w-full h-full object-cover" />
                                                      </div>
                                                  </motion.div>
                                             </div>
                                         </div>
                                         <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/5 flex items-center gap-2">
                                             <div className="w-1.5 h-1.5 bg-accent-emerald rounded-full animate-pulse" />
                                             {t("landing.mockup.live")}
                                         </div>
                                    </div>

                                    {/* Shared Wallet Visual */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="p-6 bg-white/5 border border-white/5 rounded-3xl space-y-4">
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-500">
                                                <span>{t("landing.mockup.finance")}</span>
                                                <PieChart size={14} className="text-accent-indigo" />
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                                                        <motion.div 
                                                            initial={{ width: 0 }}
                                                            animate={{ width: '65%' }}
                                                            transition={{ duration: 1, delay: 1 }}
                                                            className="h-full bg-accent-indigo" 
                                                        />
                                                    </div>
                                                    <span className="text-[10px] font-black">€450</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                                                         <motion.div 
                                                            initial={{ width: 0 }}
                                                            animate={{ width: '40%' }}
                                                            transition={{ duration: 1, delay: 1.2 }}
                                                            className="h-full bg-accent-magenta opacity-50" 
                                                        />
                                                    </div>
                                                    <span className="text-[10px] font-black">€120</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-6 bg-accent-indigo/10 border border-accent-indigo/20 rounded-3xl flex flex-col justify-center">
                                             <p className="text-[9px] font-black uppercase tracking-widest text-accent-indigo mb-1">Spent Today</p>
                                             <h4 className="text-3xl font-black tracking-tight text-white italic">€570.80</h4>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating AI Insight Balloon */}
                            <motion.div
                                animate={{ y: [-15, 15, -15], rotate: [-1, 1, -1] }}
                                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                                className="absolute -top-12 -right-12 z-30 max-w-[220px]"
                            >
                                <div className="bg-white text-slate-950 p-6 rounded-[2.5rem] rounded-tr-none shadow-2xl border border-white/50 relative">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-accent-indigo rounded-xl text-white">
                                            <Sparkles size={18} />
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">Travel AI</span>
                                    </div>
                                    <p className="text-xs font-medium leading-relaxed italic">
                                        "{t("landing.mockup.ai")}"
                                    </p>
                                </div>
                            </motion.div>

                            {/* Floating Card: Group Sync */}
                            <motion.div
                                animate={{ y: [15, -15, 15] }}
                                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                                className="absolute -bottom-10 -left-10 z-30 transform rotate-[3deg]"
                            >
                                <div className="glass bg-[#0F172A]/80 p-6 rounded-[2rem] border border-white/10 shadow-2xl backdrop-blur-2xl flex items-center gap-4">
                                    <div className="w-12 h-12 bg-accent-emerald/20 text-accent-emerald rounded-full flex items-center justify-center">
                                        <Users size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-accent-emerald">Synced Members</p>
                                        <p className="text-sm font-black text-white">8 Friends Live</p>
                                    </div>
                                </div>
                            </motion.div>
                         </motion.div>
                    </div>
                </div>

                {/* Features Grid */}
                <section className="mt-40 mb-32">
                     <div className="text-center mb-24">
                         <h2 className="text-4xl lg:text-6xl font-serif mb-6 tracking-tight">Elegance in <span className="text-accent-indigo">Every Pixel.</span></h2>
                         <p className="text-gray-500 uppercase font-black text-[11px] tracking-[0.4em]">Designed for those who demand more from their travels</p>
                     </div>

                     <div className="grid md:grid-cols-3 gap-10">
                         {[
                             {
                                 title: t("landing.features.ai.title"),
                                 desc: t("landing.features.ai.desc"),
                                 icon: <Sparkles className="text-accent-magenta" />,
                                 bg: "bg-accent-magenta/5",
                                 border: "border-accent-magenta/10"
                             },
                             {
                                 title: t("landing.features.sync.title"),
                                 desc: t("landing.features.sync.desc"),
                                 icon: <CreditCard className="text-accent-indigo" />,
                                 bg: "bg-accent-indigo/5",
                                 border: "border-accent-indigo/10"
                             },
                             {
                                 title: t("landing.features.maps.title"),
                                 desc: t("landing.features.maps.desc"),
                                 icon: <MapPin className="text-accent-cobalt" />,
                                 bg: "bg-accent-cobalt/5",
                                 border: "border-accent-cobalt/10"
                             }
                         ].map((feature, idx) => (
                             <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.2 }}
                                className={`p-10 rounded-[3rem] ${feature.bg} border ${feature.border} hover:bg-white/5 transition-all duration-500 group cursor-default`}
                             >
                                 <div className="mb-8 p-5 bg-white shadow-2xl rounded-[2rem] w-fit transform group-hover:scale-110 transition-transform duration-500">
                                     {feature.icon ? feature.icon : null}
                                 </div>
                                 <h3 className="text-2xl font-black mb-4 tracking-tighter uppercase italic">{feature.title}</h3>
                                 <p className="text-gray-400 font-light leading-relaxed pr-4">
                                     {feature.desc}
                                 </p>
                             </motion.div>
                         ))}
                     </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="relative z-10 py-20 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                            <Plane size={24} className="text-slate-950 -rotate-45" />
                        </div>
                        <span className="text-lg font-black tracking-tighter uppercase italic">Think Tracker</span>
                    </div>
                    <p className="text-gray-500 font-black text-[10px] uppercase tracking-widest">© 2026 Premium Travel Technologies. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
}
