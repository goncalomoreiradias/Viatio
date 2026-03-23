"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Plane, MapPin, CreditCard, Users, ArrowRight, ShieldCheck, Sparkles, PieChart, Layout, MessageSquare, CheckCircle } from "lucide-react";
import LanguageToggle from "@/components/LanguageToggle";
import { useI18n } from "@/lib/i18n";
import { useEffect, useState } from "react";

export default function LandingPage({ pricingConfig }: { pricingConfig?: any }) {
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
                
                {/* Visual Glow behind text (Mobile optimization) */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full h-[60%] bg-accent-cobalt/10 blur-[150px] sm:hidden" />
                
                <div className="absolute inset-0 noise-overlay opacity-[0.05] sm:opacity-[0.4] mix-blend-overlay" />
            </div>

            {/* Glassy Navbar */}
            <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${isScrolled ? 'py-4 bg-slate-950/50 backdrop-blur-xl border-b border-white/5' : 'py-6 md:py-8 bg-transparent'}`}>
                <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-3 group cursor-pointer">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-accent-cobalt via-accent-indigo to-accent-magenta rounded-xl md:rounded-2xl flex items-center justify-center shadow-2xl shadow-accent-indigo/20 group-hover:scale-110 transition-transform duration-500 rotate-[-5deg] group-hover:rotate-0">
                            <Plane size={24} className="text-white -rotate-45 md:size-[28px]" />
                        </div>
                        <span className="text-xl md:text-2xl font-black tracking-tighter uppercase italic">Viatio</span>
                    </div>

                    <div className="flex items-center gap-3 md:gap-8">
                        <div className="scale-75 md:scale-100 origin-right">
                            <LanguageToggle />
                        </div>
                        <Link
                            href="/login"
                            className="hidden md:inline-flex text-sm font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-colors"
                        >
                            {t("auth.signin_link")}
                        </Link>
                        <Link
                            href="/register"
                            className="px-5 py-2.5 md:px-8 md:py-3.5 bg-white text-slate-950 text-[10px] md:text-sm font-black rounded-full uppercase tracking-widest hover:bg-accent-indigo hover:text-white transition-all transform hover:scale-105 active:scale-95 shadow-[0_20px_40px_-10px_rgba(255,255,255,0.2)] whitespace-nowrap"
                        >
                            {t("auth.register_btn")}
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-12 md:pt-40 pb-20">
                <div className="grid lg:grid-cols-2 gap-12 md:gap-20 items-center min-h-[85dvh] lg:min-h-0">
                    
                    <motion.div
                        style={{ opacity, scale }}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="mt-20 md:mt-0"
                    >
                        <div className="inline-flex items-center gap-3 px-4 md:px-5 py-2 md:py-2.5 rounded-full bg-white/5 border border-white/10 text-white font-black text-[8px] md:text-[10px] mb-8 md:mb-12 shadow-2xl tracking-[0.2em] md:tracking-[0.3em] uppercase backdrop-blur-md max-w-full">
                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-accent-magenta rounded-full animate-pulse shadow-[0_0_10px_rgba(217,70,239,0.8)]" />
                            <span className="truncate">{t("landing.social.trusted")}</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl lg:text-[5.5rem] font-serif font-medium leading-[1.1] md:leading-[0.95] tracking-tight mb-8">
                            {t("landing.hero.title")} <br />
                            <span className="italic font-light text-accent-indigo brightness-125">{t("landing.hero.title2")}</span>
                        </h1>

                        <p className="text-base md:text-xl text-white/80 md:text-gray-400 mb-10 md:mb-12 leading-relaxed md:leading-relaxed max-w-xl font-light tracking-wide lg:pr-12">
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

                {/* App Showcase Section */}
                <section className="mt-40 mb-32 relative z-10">
                    <div className="text-center mb-24 max-w-3xl mx-auto">
                        <span className="text-accent-indigo font-black text-[10px] tracking-[0.4em] uppercase mb-4 block">A Experiência Viatio</span>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-6 tracking-tight">
                            Planeamento Elevado à <span className="text-accent-magenta italic font-light">Perfeição</span>.
                        </h2>
                        <p className="text-gray-400 font-light text-lg lg:text-xl leading-relaxed">
                            Esqueça folhas de cálculo e blocos de notas caóticos. O nosso Arquiteto de Inteligência Artificial desenha, organiza e otimiza cada segundo da sua viagem em tempo recorde.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center mb-40">
                        {/* Planner Mockup */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8 }}
                            className="relative group perspective-1000"
                        >
                            <div className="absolute inset-0 bg-accent-indigo/20 blur-[100px] rounded-full scale-75 group-hover:scale-100 transition-transform duration-700" />
                            <div className="glass bg-[#0F172A]/90 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden backdrop-blur-3xl transform rotate-2 hover:rotate-0 transition-transform duration-700">
                                <div className="h-10 border-b border-white/5 flex items-center px-4 bg-white/5">
                                    <div className="flex gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                                    </div>
                                </div>
                                <div className="p-6 md:p-10 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-accent-indigo mb-1">Dia 1 • Cultural</p>
                                            <h4 className="text-2xl font-black font-outfit text-white">Exploração em Ubud</h4>
                                        </div>
                                        <div className="bg-white/10 p-3 rounded-2xl">
                                            <Sparkles size={20} className="text-accent-indigo" />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {[
                                            { time: "09:00", title: "Sacred Monkey Forest", detail: "Santuário Natural • 2h" },
                                            { time: "11:30", title: "Campuhan Ridge Walk", detail: "Caminhada Panorâmica • 1.5h" },
                                            { time: "13:30", title: "Locavore", detail: "Restaurante Estrela Michelin" }
                                        ].map((item, i) => (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.2 }}
                                                key={i} 
                                                className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 items-center hover:bg-white/10 transition-colors"
                                            >
                                                <span className="text-xs font-black text-gray-500 w-12">{item.time}</span>
                                                <div>
                                                    <p className="font-bold text-white text-sm">{item.title}</p>
                                                    <p className="text-[10px] font-medium text-gray-400 mt-1">{item.detail}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <div>
                            <div className="w-14 h-14 bg-gradient-to-br from-accent-indigo to-accent-magenta rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(139,92,246,0.5)]">
                                <Sparkles size={28} className="text-white" />
                            </div>
                            <h3 className="text-3xl md:text-4xl font-black tracking-tight mb-6">Arquiteto AI <br/><span className="italic font-light text-gray-400">O seu tempo é precioso.</span></h3>
                            <p className="text-gray-400 leading-relaxed mb-8">
                                Insira as datas, o destino e as suas preferências logísticas. O Arquiteto constrói roteiros detalhados, clusterizando pontos geograficamente próximos, calculando tempos de deslocação reais e considerando as horas de ponta.
                            </p>
                            <ul className="space-y-4">
                                {["Geração em Segundos", "Agrupamento por Zonas Geográficas", "Sincronizado na Cloud", "Ajustes Flexíveis Drag & Drop"].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <ShieldCheck size={18} className="text-accent-indigo" />
                                        <span className="font-bold text-sm tracking-wide text-gray-300">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Bucket List Section */}
                    <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center flex-col-reverse lg:flex-row-reverse mb-40">
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8 }}
                            className="relative group perspective-1000 order-1 lg:order-none"
                        >
                            <div className="absolute inset-0 bg-accent-emerald/10 blur-[100px] rounded-full scale-75 group-hover:scale-100 transition-transform duration-700" />
                            <div className="glass bg-[#0F172A]/90 border border-emerald-500/20 rounded-[2.5rem] shadow-2xl p-8 backdrop-blur-3xl transform rotate-[-2deg] hover:rotate-0 transition-transform duration-700">
                                <div className="border border-stroke/20 bg-black/40 rounded-xl p-4 mb-6 shadow-inner">
                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                        <MapPin size={12} /> Colar Link Google Maps
                                    </p>
                                    <p className="text-xs text-gray-400 truncate font-mono">https://maps.app.goo.gl/xyz123...</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { name: "Sushiteca", cat: "Restaurante" },
                                        { name: "Miradouro do Sol", cat: "Ponto de Interesse" },
                                        { name: "Praia Secreta", cat: "Praia" },
                                        { name: "Museu de Arte", cat: "Cultura" }
                                    ].map((item, i) => (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.15 }}
                                            key={i} 
                                            className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl hover:bg-emerald-500/20 transition-all cursor-pointer"
                                        >
                                            <MapPin size={16} className="text-emerald-500 mb-3" />
                                            <p className="font-bold text-white text-xs truncate">{item.name}</p>
                                            <p className="text-[9px] text-emerald-500/80 font-black uppercase mt-1">{item.cat}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        <div className="order-2 lg:order-none">
                            <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center mb-8">
                                <MapPin size={28} className="text-emerald-500" />
                            </div>
                            <h3 className="text-3xl md:text-4xl font-black tracking-tight mb-6">Bucket Lists Mágicas <br/><span className="italic font-light text-gray-400">Do Google para a sua App.</span></h3>
                            <p className="text-gray-400 leading-relaxed mb-8">
                                Tem dezenas de locais guardados no Google Maps ao longo de anos? Basta colar os URLs partilhados das suas listas e a nossa plataforma extrai todos os locais num catálogo imersivo para os distribuir pelos dias da viagem.
                            </p>
                            <Link
                                href="/register"
                                className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/30 transition-all font-black text-xs uppercase tracking-widest text-white group"
                            >
                                Experimentar Agora <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-emerald-500" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* PRICING SECTION */}
                <section id="pricing" className="mt-40 mb-32 relative z-10 pt-20 border-t border-white/5">
                    <div className="text-center mb-24 max-w-3xl mx-auto">
                         <span className="text-amber-500 font-black text-[10px] tracking-[0.4em] uppercase mb-4 block">Planos e Preços</span>
                         <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-6 tracking-tight">O Investimento na Sua <br/> <span className="italic font-light text-amber-500">Paz de Espírito</span>.</h2>
                         <p className="text-gray-400 font-light text-lg">Pague o justo. Escolha entre criar roteiros manuais de forma gratuita, um passe para uma expedição única, ou um passaporte anual ilimitado.</p>
                    </div>

                    <div className="grid lg:grid-cols-4 gap-6 max-w-7xl mx-auto items-stretch">
                        {/* FREE */}
                        <div className="bg-surface/30 border border-white/5 p-6 md:p-8 rounded-[3rem] backdrop-blur-xl hover:border-white/20 transition-all flex flex-col">
                            <h3 className="text-3xl font-black font-outfit uppercase tracking-tighter mb-2">Basic</h3>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-8">Viagens Manuais</p>
                            <div className="mb-10 flex items-baseline gap-2">
                                <span className="text-5xl font-black text-white">€0</span>
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">/ para sempre</span>
                            </div>
                            <ul className="space-y-4 mb-12 flex-1">
                                {["Planeador Manual", "Até 3 Viagens", "Convites Ilimitados"].map((f,i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckCircle size={16} className="text-gray-400 shrink-0 mt-0.5" />
                                        <span className="text-xs font-medium text-gray-300">{f}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link href="/register" className="w-full py-4 text-center rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest">
                                Começar Grátis
                            </Link>
                        </div>

                        {/* SINGLE TRIP */}
                        <div className="bg-gradient-to-br from-accent-cobalt/20 to-accent-indigo/20 border border-accent-indigo/30 p-6 md:p-8 rounded-[3rem] backdrop-blur-xl relative overflow-hidden flex flex-col transform lg:scale-105 shadow-2xl shadow-accent-indigo/10 z-10">
                            <div className="absolute top-0 right-0 py-2 px-6 bg-accent-indigo text-white text-[8px] font-black uppercase tracking-[0.3em] rounded-bl-3xl">Popular</div>
                            <div className="relative z-10 flex flex-col h-full">
                                <h3 className="text-3xl font-black font-outfit uppercase tracking-tighter mb-2 text-white">Única</h3>
                                <p className="text-[10px] font-bold text-accent-indigo uppercase tracking-widest mb-8">Passe Expedição</p>
                                <div className="mb-10 flex items-baseline gap-2">
                                    <span className="text-5xl font-black text-white">€{(pricingConfig?.singleTripPrice ?? 0.99).toString().split('.')[0]}<span className="text-2xl">.{(pricingConfig?.singleTripPrice ?? 0.99).toFixed(2).split('.')[1]}</span></span>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">/ Roteiro</span>
                                </div>
                                <ul className="space-y-4 mb-12 flex-1">
                                    {["Tudo do Basic", "1 Geração Completa por IA", "Pendente de Config Bucketlist"].map((f,i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <Sparkles size={16} className="text-accent-indigo shrink-0 mt-0.5" />
                                            <span className="text-xs font-medium text-white">{f}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/register" className="w-full py-4 text-center rounded-2xl bg-white text-slate-950 hover:bg-gray-200 transition-all text-[10px] font-black uppercase tracking-widest shadow-xl">
                                    Comprar
                                </Link>
                            </div>
                        </div>

                        {/* MONTHLY */}
                        <div className="bg-surface/50 border border-white/10 p-6 md:p-8 rounded-[3rem] backdrop-blur-xl hover:border-white/30 transition-all flex flex-col">
                            <h3 className="text-3xl font-black font-outfit uppercase tracking-tighter mb-2">Mensal</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8">Passaporte Mensal</p>
                            <div className="mb-10 flex items-baseline gap-2">
                                <span className="text-5xl font-black text-white">€{(pricingConfig?.monthlyPrice ?? 2.99).toString().split('.')[0]}<span className="text-2xl">.{(pricingConfig?.monthlyPrice ?? 2.99).toFixed(2).split('.')[1]}</span></span>
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">/ mês</span>
                            </div>
                            <ul className="space-y-4 mb-12 flex-1">
                                {["Tudo do plano Única", `Até €${(pricingConfig?.monthlyAiMax ?? 1.00).toFixed(2)} em Consumo IA`, "Acesso a Bucketlist Google", "Múltiplos Roteiros"].map((f,i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                                        <span className="text-xs font-medium text-gray-300">{f}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link href="/register" className="w-full py-4 text-center rounded-2xl bg-white/10 border border-white/20 hover:bg-white/20 hover:border-emerald-500/50 transition-all text-[10px] font-black uppercase tracking-widest">
                                Assinar Mensal
                            </Link>
                        </div>

                        {/* YEARLY */}
                        <div className="bg-surface/50 border border-emerald-500/20 p-6 md:p-8 rounded-[3rem] backdrop-blur-xl hover:border-emerald-500/40 transition-all flex flex-col">
                            <h3 className="text-3xl font-black font-outfit uppercase tracking-tighter mb-2 text-emerald-500">Anual</h3>
                            <p className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest mb-8">Acesso Completo</p>
                            <div className="mb-10 flex items-baseline gap-2">
                                <span className="text-5xl font-black text-white">€{(pricingConfig?.yearlyPrice ?? 9.99).toString().split('.')[0]}<span className="text-2xl">.{(pricingConfig?.yearlyPrice ?? 9.99).toFixed(2).split('.')[1]}</span></span>
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">/ por ano</span>
                            </div>
                            <ul className="space-y-4 mb-12 flex-1">
                                {["Tudo do plano Mensal", `Tolerância Premium AI (€${(pricingConfig?.yearlyAiMax ?? 5.00).toFixed(2)})`, "Preço Reduzido Anual", "Suporte Prioritário"].map((f,i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                                        <span className="text-xs font-medium text-gray-300">{f}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link href="/register" className="w-full py-4 text-center rounded-2xl bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 transition-all text-[10px] font-black uppercase tracking-widest">
                                Assinar Anual
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="relative z-10 py-20 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-accent-cobalt to-accent-indigo rounded-xl flex items-center justify-center shadow-lg">
                            <Plane size={24} className="text-white -rotate-45" />
                        </div>
                        <span className="text-lg font-black tracking-tighter uppercase italic">Viatio</span>
                    </div>
                    <p className="text-gray-500 font-black text-[10px] uppercase tracking-widest">© 2026 Premium Travel Technologies. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
}
