"use client";

import { useEffect, useState } from "react";
import { Trip } from "@/types";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Loader2, Plus, Plane, MapPin, Calendar, Users, Sparkles, MoreVertical, Edit2, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import LanguageToggle from "@/components/LanguageToggle";
import AIPlannerTrigger from "@/components/AIPlannerTrigger";
import { useRouter } from "next/navigation";
import AIPlannerModal from "@/components/AIPlannerModal";
import UpgradeModal from "@/components/UpgradeModal";

interface Props {
    session: { userId: string; role: string } | any;
}

export default function DashboardClient({ session }: Props) {
    const { t } = useI18n();
    const router = useRouter();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    // const [isAuthenticated, setIsAuthenticated] = useState(false); // Removed, handled by session prop
    // const [userName, setUserName] = useState(""); // Removed, handled by session prop
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isAIPlannerOpen, setIsAIPlannerOpen] = useState(false);
    const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
    const [userPlan, setUserPlan] = useState<string>("FREE");

    // New Trip Form State
    const [newTripTitle, setNewTripTitle] = useState("");
    const [newTripDesc, setNewTripDesc] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    // i18n
    // const { t } = useI18n(); // Already declared above

    useEffect(() => {
        fetchTrips();
        // Fetch user plan for AI gating
        fetch("/api/auth/session")
            .then(res => res.json())
            .then(data => {
                if (data?.session?.plan) setUserPlan(data.session.plan);
            })
            .catch(() => { });
    }, []);

    const fetchTrips = async () => {
        try {
            const res = await fetch("/api/trips");
            if (res.ok) {
                const data = await res.json();
                setTrips(data);
            }
        } catch (error) {
            console.error("Failed to load trips", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/login";
    };

    // const handleLogin = (e: React.FormEvent) => { // Removed, handled by session prop
    //     e.preventDefault();
    //     if (!userName.trim()) {
    //         alert(t("dash.pleaseEnterName"));
    //         return;
    //     }
    //     setIsAuthenticated(true);
    //     sessionStorage.setItem("bali_auth", "true");
    //     sessionStorage.setItem("bali_username", userName.trim());
    // };

    const handleCreateTrip = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTripTitle.trim()) return;

        setIsCreating(true);
        try {
            const res = await fetch("/api/trips", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newTripTitle,
                    description: newTripDesc,
                    participants: [session.userId], // Use session.userId
                }),
            });

            if (res.ok) {
                const newTrip = await res.json();
                setTrips([newTrip, ...trips]);
                setIsCreateModalOpen(false);
                setNewTripTitle("");
                setNewTripDesc("");
            }
        } catch (error) {
            console.error("Failed to create trip", error);
        } finally {
            setIsCreating(false);
        }
    };

    // if (!isAuthenticated) { // Removed, authentication handled by session prop
    //     return (
    //         <div className="min-h-screen flex items-center justify-center bg-brand-bg p-4 text-center">
    //             <motion.div
    //                 initial={{ opacity: 0, y: 20 }}
    //                 animate={{ opacity: 1, y: 0 }}
    //                 className="glass-card flex flex-col items-center justify-center p-10 max-w-md w-full border border-black/5 dark:border-white/10 shadow-2xl"
    //             >
    //                 <div className="w-20 h-20 bg-brand-primary rounded-full flex items-center justify-center mb-6 shadow-lg shadow-brand-primary/20">
    //                     <Plane size={32} className="text-white" />
    //                 </div>
    //                 <h1 className="text-4xl font-bold font-outfit text-brand-dark dark:text-white mb-3">{t("dash.title")}</h1>
    //                 <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-[250px] mx-auto text-sm">{t("dash.subtitle")}</p>

    //                 <form onSubmit={handleLogin} className="space-y-4 w-full">
    //                     <input
    //                         type="text"
    //                         placeholder={t("dash.yourName")}
    //                         value={userName}
    //                         onChange={(e) => setUserName(e.target.value)}
    //                         className="w-full px-5 py-4 bg-white/60 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-brand-primary outline-none text-center font-medium transition-all"
    //                     />
    //                     <button
    //                         type="submit"
    //                         className="w-full py-4 bg-brand-primary hover:bg-brand-secondary text-white font-bold rounded-2xl shadow-xl shadow-brand-primary/20 transition-all active:scale-[0.98]"
    //                     >
    //                         {t("dash.enter")}
    //                     </button>
    //                 </form>
    //             </motion.div>
    //         </div>
    //     );
    // }

    const [viewMode, setViewMode] = useState<"personal" | "group">("personal");

    // Filtered Trips
    const filteredTrips = trips.filter(trip => {
        const isGroup = (trip.participants?.length || 0) > 1;
        return viewMode === "group" ? isGroup : !isGroup;
    });

    // Preparation Progress Calculation (Mock logic for now: based on locations vs duration)
    const getProgress = (trip: Trip) => {
        const anyTrip = trip as any;
        const totalLocations = anyTrip.utils?.totalLocations || (trip.days?.reduce((sum, d) => sum + d.locations.length, 0) || 0);
        const hasExpenses = (trip.expenses?.length || 0) > 0;
        let progress = Math.min(100, (totalLocations / 10) * 100);
        if (hasExpenses) progress = Math.min(100, progress + 20);
        return Math.round(progress);
    };

    const templates = [
        { title: "Safari de Luxo", desc: "Explora o Serengeti com conforto total.", icon: "🦁", color: "from-amber-500 to-orange-600" },
        { title: "Backpacking Europa", desc: "A rota definitiva pelas capitais europeias.", icon: "🎒", color: "from-blue-500 to-indigo-600" },
        { title: "Escapadinha em Roma", desc: "História, massa e vinhos inesquecíveis.", icon: "🇮🇹", color: "from-rose-500 to-magenta-600" }
    ];

    const { scrollY } = useScroll();
    
    // Dynamic Header Transforms
    const headerHeight = useTransform(scrollY, [0, 100], ["auto", "120px"]);
    const headerPadding = useTransform(scrollY, [0, 100], ["32px", "16px"]);
    const titleScale = useTransform(scrollY, [0, 100], [1, 0.7]);
    const titleOpacity = useTransform(scrollY, [0, 100], [1, 0]);
    const subtitleOpacity = useTransform(scrollY, [0, 80], [1, 0]);
    const headerBg = useTransform(scrollY, [0, 50], ["rgba(13, 13, 13, 0)", "rgba(13, 13, 13, 0.8)"]);

    const [activeTripMenu, setActiveTripMenu] = useState<string | null>(null);

    return (
        <main className="min-h-screen bg-[#0D0D0D] relative pb-24 selection:bg-accent-cobalt selection:text-white">
            {/* Premium Dynamic Header */}
            <motion.header 
                style={{ height: headerHeight, backgroundColor: headerBg }}
                className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/5 overflow-hidden"
            >
                {/* Micro-pattern overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
                
                <motion.div 
                    style={{ padding: headerPadding }}
                    className="max-w-7xl mx-auto flex flex-col relative z-10 transition-all"
                >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-2 md:space-y-4 max-w-2xl">
                            <motion.div
                                style={{ opacity: subtitleOpacity }}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 px-3 py-1 bg-accent-cobalt/10 border border-accent-cobalt/20 rounded-full"
                            >
                                <span className="w-1.5 h-1.5 bg-accent-cobalt rounded-full animate-pulse" />
                                <span className="text-[10px] font-black text-accent-cobalt tracking-[0.2em] uppercase">
                                    {t("dash.hello")}, {session.name || "Viajante"}
                                </span>
                            </motion.div>
                            
                            <div className="relative">
                                <motion.h1
                                    style={{ scale: titleScale, originX: 0 }}
                                    className="text-3xl sm:text-7xl font-black font-outfit text-white tracking-tight leading-[0.9] whitespace-nowrap"
                                >
                                    Viatio <span className="hidden sm:inline text-transparent bg-clip-text bg-gradient-to-r from-accent-cobalt to-accent-magenta">Dashboard</span>
                                </motion.h1>
                                <motion.p 
                                    style={{ opacity: subtitleOpacity }}
                                    className="text-gray-500 text-xs sm:text-lg font-medium max-w-xl mt-2 sm:mt-4 line-clamp-1 sm:line-clamp-none"
                                >
                                    A sua viagem definitiva, otimizada por IA.
                                </motion.p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end mt-2 md:mt-0">
                            <div className="neumorphic-inset p-1 rounded-2xl flex items-center gap-0.5 bg-black/20 flex-1 md:flex-none">
                                <button 
                                    onClick={() => setViewMode("personal")}
                                    className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === "personal" ? "bg-white text-obsidian shadow-xl" : "text-gray-500 hover:text-white"}`}
                                >
                                    Pessoais
                                </button>
                                <button 
                                    onClick={() => setViewMode("group")}
                                    className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === "group" ? "bg-white text-obsidian shadow-xl" : "text-gray-500 hover:text-white"}`}
                                >
                                    Grupo
                                </button>
                            </div>
                            <LanguageToggle />
                        </div>
                    </div>
                </motion.div>
            </motion.header>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-8 sm:px-12 py-16">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 size={40} className="text-accent-cobalt animate-spin" />
                    </div>
                ) : filteredTrips.length === 0 ? (
                    <div className="space-y-12">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-24 px-10 border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.02]"
                        >
                            <div className="w-24 h-24 bg-accent-cobalt/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                                <Plane size={48} className="text-accent-cobalt" />
                            </div>
                            <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tight">{t("dash.noTrips")}</h3>
                            <p className="text-gray-500 mb-10 max-w-md mx-auto font-medium">
                                Parece que ainda não tens planos para a tua próxima aventura. Começa agora ou inspira-te com um dos nossos templates!
                            </p>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="px-10 py-5 bg-accent-cobalt text-white font-black rounded-full shadow-2xl shadow-accent-cobalt/40 transition-all active:scale-95 uppercase tracking-widest text-xs border border-white/20"
                            >
                                Criar Primeira Viagem
                            </button>
                        </motion.div>

                        {/* Sales Templates */}
                        <div className="space-y-8">
                            <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] text-center">Templates em Destaque</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {templates.map((tpl, i) => (
                                    <motion.div
                                        key={tpl.title}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="bg-[#1A1A1A] rounded-[2rem] p-8 border border-white/5 group hover:border-white/20 transition-all cursor-pointer"
                                    >
                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tpl.color} flex items-center justify-center text-2xl mb-6 shadow-xl`}>
                                            {tpl.icon}
                                        </div>
                                        <h5 className="text-xl font-black text-white mb-2 tracking-tight group-hover:text-accent-cobalt transition-colors">{tpl.title}</h5>
                                        <p className="text-sm text-gray-500 font-medium leading-relaxed">{tpl.desc}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {/* Premium AI Trigger */}
                        <div className="max-w-4xl mx-auto">
                            <AIPlannerTrigger onClick={() => userPlan === "FREE" ? setIsUpgradeOpen(true) : setIsAIPlannerOpen(true)} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredTrips.map((trip, i) => {
                            const prog = getProgress(trip);
                            return (
                                <div key={trip.id} className="relative">
                                    <Link href={`/trips/${trip.id}`}>
                                        <motion.div
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            onTap={() => setActiveTripMenu(null)}
                                            onContextMenu={(e) => {
                                                e.preventDefault();
                                                setActiveTripMenu(trip.id);
                                            }}
                                            whileTap={{ scale: 0.98 }}
                                            className="group relative bg-[#1A1A1A] rounded-[2rem] p-8 md:p-10 shadow-2xl border border-white/5 transition-all h-full flex flex-col overflow-hidden cursor-pointer"
                                        >
                                            {/* Background Decor */}
                                            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-all duration-700 group-hover:rotate-12 pointer-events-none">
                                                <Plane size={120} className="text-accent-cobalt -rotate-45" />
                                            </div>

                                            <div className="relative z-10 flex-1 space-y-6">
                                                <div className="flex justify-between items-start gap-4">
                                                    <div className="space-y-2">
                                                        <h2 className="text-2xl md:text-3xl font-black font-outfit text-white leading-tight group-hover:text-accent-cobalt transition-colors duration-300 tracking-tight line-clamp-2">
                                                            {trip.title}
                                                        </h2>
                                                        <div className="flex items-center gap-2">
                                                            <Calendar size={12} className="text-gray-600" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Updated Recently</span>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setActiveTripMenu(activeTripMenu === trip.id ? null : trip.id);
                                                        }}
                                                        className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all relative z-20"
                                                    >
                                                        <MoreVertical size={20} />
                                                    </button>
                                                </div>
                                                
                                                {/* Progress Bar with Clamp for fluid spacing */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Progress</span>
                                                        <span className="text-[9px] font-black text-accent-cobalt">{prog}%</span>
                                                    </div>
                                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                        <motion.div 
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${prog}%` }}
                                                            className="h-full bg-accent-cobalt shadow-[0_0_15px_rgba(46,91,255,0.5)]"
                                                        />
                                                    </div>
                                                </div>

                                                {trip.description && (
                                                    <p className="text-gray-500 text-xs font-medium leading-relaxed line-clamp-2 pr-4">
                                                        {trip.description}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="relative z-10 pt-8 mt-auto flex items-center justify-between border-t border-white/5">
                                                <div className="flex -space-x-2">
                                                    {/* Mock Avatars */}
                                                    {(trip.participants?.length || 1) > 1 ? (
                                                        [1, 2].map(n => (
                                                            <div key={n} className="w-8 h-8 rounded-full bg-accent-indigo border-2 border-[#1A1A1A] flex items-center justify-center text-[9px] font-black text-white">
                                                                P{n}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-accent-cobalt border-2 border-[#1A1A1A] flex items-center justify-center text-[9px] font-black text-white">
                                                            ME
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-accent-cobalt group-hover:translate-x-1 transition-transform">
                                                    Open Details <ArrowRight size={12} />
                                                </div>
                                            </div>
                                        </motion.div>
                                    </Link>

                                    {/* Context Menu / Management Menu */}
                                    <AnimatePresence>
                                        {activeTripMenu === trip.id && (
                                            <>
                                                <div 
                                                    className="fixed inset-0 z-40" 
                                                    onClick={() => setActiveTripMenu(null)}
                                                />
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                    className="absolute top-20 right-8 z-50 w-48 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-2 backdrop-blur-3xl"
                                                >
                                                    <button className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                                                        <Edit2 size={16} /> Edit Info
                                                    </button>
                                                    <button 
                                                        className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            // Logic for delete would go here
                                                            setActiveTripMenu(null);
                                                        }}
                                                    >
                                                        <Trash2 size={16} /> Delete Trip
                                                    </button>
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile FAB */}
            {/* Mobile FABs */}
            <div className="sm:hidden fixed bottom-10 left-0 right-0 px-8 flex justify-between items-center z-50">
                <button
                    onClick={() => userPlan === "FREE" ? setIsUpgradeOpen(true) : setIsAIPlannerOpen(true)}
                    className="w-16 h-16 bg-gradient-to-br from-accent-magenta via-accent-indigo to-accent-cobalt text-white rounded-full shadow-[0_20px_40px_-10px_rgba(139,92,246,0.5)] flex items-center justify-center transition-all active:scale-90 border border-white/20"
                >
                    <Sparkles size={28} />
                </button>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="w-16 h-16 bg-white text-obsidian rounded-full shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] flex items-center justify-center transition-all active:scale-90 border border-white/10"
                >
                    <Plus size={32} />
                </button>
            </div>

            <div className="mt-20 text-center pb-12 flex flex-col items-center gap-6">
                <button
                    onClick={handleLogout}
                    className="px-8 py-3 text-xs font-black uppercase tracking-[0.3em] text-rose-500 bg-rose-500/5 hover:bg-rose-500/10 rounded-full border border-rose-500/10 transition-all active:scale-95"
                >
                    {t("dash.logout") || 'Logout'}
                </button>

                {session.role === "ADMIN" && (
                    <button
                        onClick={() => router.push("/admin")}
                        className="px-6 py-2 text-sm font-semibold text-brand-secondary bg-brand-secondary/10 hover:bg-brand-secondary/20 rounded-full transition-colors"
                    >
                        Admin Dashboard
                    </button>
                )}
            </div>

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        onClick={() => !isCreating && setIsCreateModalOpen(false)}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="glass bg-obsidian/95 relative sm:rounded-[2.5rem] rounded-[2rem] p-10 max-w-md w-full shadow-2xl border border-white/10"
                    >
                        <h2 className="text-3xl font-black font-outfit text-white mb-8 tracking-tight uppercase leading-none">Novo Destino</h2>

                        <form onSubmit={handleCreateTrip} className="space-y-8">
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] px-2 leading-none">
                                    Onde vamos?
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Bali, Indonésia"
                                    value={newTripTitle}
                                    onChange={(e) => setNewTripTitle(e.target.value)}
                                    className="w-full px-6 py-4.5 bg-white/5 border border-white/10 rounded-full focus:border-accent-cobalt outline-none transition-all font-black text-white placeholder:text-gray-800 text-lg tracking-tight"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] px-2 leading-none">
                                    Notas Curtas (Opcional)
                                </label>
                                <textarea
                                    placeholder="Breve descrição da aventura..."
                                    value={newTripDesc}
                                    onChange={(e) => setNewTripDesc(e.target.value)}
                                    className="w-full px-6 py-4.5 bg-white/5 border border-white/10 rounded-[2rem] focus:border-accent-cobalt outline-none transition-all min-h-[120px] resize-none font-medium text-white placeholder:text-gray-800"
                                />
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    disabled={isCreating}
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 py-4.5 bg-white/5 hover:bg-white/10 text-gray-400 font-black rounded-full transition-all uppercase tracking-widest text-[10px] border border-white/5"
                                >
                                    {t("dash.cancel")}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="flex-1 py-4.5 bg-gradient-to-br from-accent-cobalt to-accent-indigo text-white font-black rounded-full shadow-[0_20px_40px_-10px_rgba(46,91,255,0.4)] transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-[10px] border border-white/20 active:scale-95"
                                >
                                    {isCreating ? <Loader2 size={18} className="animate-spin" /> : "Criar Viagem"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* AI Planner Modal */}
            <AIPlannerModal isOpen={isAIPlannerOpen} onClose={() => setIsAIPlannerOpen(false)} />

            {/* Upgrade Modal */}
            <UpgradeModal
                isOpen={isUpgradeOpen}
                onClose={() => setIsUpgradeOpen(false)}
                onUpgraded={() => {
                    setUserPlan("SINGLE_TRIP");
                    setIsUpgradeOpen(false);
                    setIsAIPlannerOpen(true);
                }}
            />
        </main>
    );
}
