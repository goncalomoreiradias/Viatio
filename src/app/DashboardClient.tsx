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
    const [newTripStartDate, setNewTripStartDate] = useState("");
    const [newTripEndDate, setNewTripEndDate] = useState("");
    const [newTripBucketListUrls, setNewTripBucketListUrls] = useState("");
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
                    startDate: newTripStartDate || undefined,
                    endDate: newTripEndDate || undefined,
                    bucketListUrls: newTripBucketListUrls.split("\n").map(u => u.trim()).filter(Boolean),
                    participants: [session.userId],
                }),
            });

            if (res.ok) {
                const newTrip = await res.json();
                setTrips([newTrip, ...trips]);
                setIsCreateModalOpen(false);
                setNewTripTitle("");
                setNewTripDesc("");
                setNewTripStartDate("");
                setNewTripEndDate("");
                setNewTripBucketListUrls("");
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
        { 
            id: 'safari', 
            name: t("dash.template.safari.title"), 
            desc: t("dash.template.safari.desc"), 
            icon: "🦁", 
            color: "from-amber-500 to-orange-600",
            destination: "Serengeti National Park, Tanzânia",
            travelStyle: ["adventure", "balanced"]
        },
        { 
            id: 'bali', 
            name: t("dash.template.bali.title"), 
            desc: t("dash.template.bali.desc"), 
            icon: "🍣", 
            color: "from-indigo-500 to-purple-600",
            destination: "Tóquio, Japão",
            travelStyle: ["culture", "foodie"]
        },
        { 
            id: 'rome', 
            name: t("dash.template.rome.title"), 
            desc: t("dash.template.rome.desc"), 
            icon: "🇮🇹", 
            color: "from-rose-500 to-magenta-600",
            destination: "Roma, Itália",
            travelStyle: ["culture", "foodie"]
        }
    ];

    const [currentTemplate, setCurrentTemplate] = useState<{destination: string, travelStyle: string[]} | null>(null);

    const handleTemplateClick = (tpl: any) => {
        setCurrentTemplate({
            destination: tpl.destination,
            travelStyle: tpl.travelStyle
        });
        setIsAIPlannerOpen(true);
    };

    const { scrollY } = useScroll();
    
    // Dynamic Header Transforms
    const headerHeight = useTransform(scrollY, [0, 100], ["auto", "120px"]);
    const headerPadding = useTransform(scrollY, [0, 100], ["32px", "16px"]);
    const titleScale = useTransform(scrollY, [0, 100], [1, 0.7]);
    const titleOpacity = useTransform(scrollY, [0, 100], [1, 0]);
    const subtitleOpacity = useTransform(scrollY, [0, 80], [1, 0]);
    const headerBg = useTransform(scrollY, [0, 50], ["rgba(13, 13, 13, 0)", "rgba(13, 13, 13, 0.95)"]);
    const headerBorder = useTransform(scrollY, [0, 50], ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.1)"]);

    const [activeTripMenu, setActiveTripMenu] = useState<string | null>(null);

    return (
        <main className="min-h-screen bg-canvas relative pb-24 selection:bg-accent/20 selection:text-accent">
            {/* Premium Dynamic Header */}
            <motion.header 
                style={{ backgroundColor: headerBg, borderColor: headerBorder }}
                className="sticky top-0 z-40 backdrop-blur-xl border-b overflow-hidden transition-all duration-500"
            >
                {/* Micro-pattern overlay */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(var(--text-high)_1px,transparent_1px)] [background-size:20px_20px]" />
                
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
                                className="inline-flex items-center gap-2 px-3 py-1 bg-accent/5 border border-accent/10 rounded-full"
                            >
                                <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                                <span className="text-[10px] font-black text-text-medium tracking-[0.2em] uppercase">
                                    {t("dash.hello")}, {session.name || t("common.viajante")}
                                </span>
                            </motion.div>
                            
                            <div className="relative">
                                <motion.h1
                                    className="text-3xl sm:text-6xl font-black font-outfit text-text-high tracking-tight leading-[0.9] whitespace-nowrap"
                                >
                                    Viatio <span className="hidden sm:inline text-transparent bg-clip-text bg-gradient-to-r from-accent to-text-medium">{t("dash.dashboard")}</span>
                                </motion.h1>
                                <motion.p 
                                    style={{ opacity: subtitleOpacity }}
                                    className="hidden sm:block text-text-medium text-lg font-medium max-w-xl mt-4"
                                >
                                    {t("dash.optimizedAI")}
                                </motion.p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 w-full md:w-auto justify-end mt-2 md:mt-0">
                            {/* Desktop Quick Actions */}
                            <div className="hidden md:flex items-center gap-2">
                                <button 
                                    onClick={() => userPlan === "FREE" ? setIsUpgradeOpen(true) : setIsAIPlannerOpen(true)}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-accent text-canvas rounded-full border border-accent/20 transition-all text-[11px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95"
                                >
                                    <Sparkles size={16} className="animate-pulse" />
                                    <span>AI ARCHITECT</span>
                                </button>
                                <button 
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-surface hover:bg-stroke text-text-high rounded-full border border-stroke transition-all text-[11px] font-black uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95"
                                >
                                    <Plus size={16} />
                                    <span>{t("dash.newTrip")}</span>
                                </button>
                            </div>

                            <div className="bg-surface/50 border border-stroke p-1 rounded-2xl flex items-center gap-0.5">
                                <button 
                                    onClick={() => setViewMode("personal")}
                                    className={`px-4 md:px-6 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === "personal" ? "bg-accent text-canvas shadow-xl" : "text-text-medium hover:text-text-high"}`}
                                >
                                    {t("dash.personal")}
                                </button>
                                <button 
                                    onClick={() => setViewMode("group")}
                                    className={`px-4 md:px-6 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === "group" ? "bg-accent text-canvas shadow-xl" : "text-text-medium hover:text-text-high"}`}
                                >
                                    {t("dash.group")}
                                </button>
                            </div>
                            <div className="hidden sm:block">
                                <LanguageToggle />
                            </div>
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
                                className="text-center py-24 px-10 border border-stroke rounded-[3rem] bg-surface/50"
                            >
                                <div className="w-24 h-24 bg-accent/5 rounded-full flex items-center justify-center mx-auto mb-8">
                                    <Plane size={48} className="text-accent" />
                                </div>
                                <h3 className="text-3xl font-black text-text-high mb-4 uppercase tracking-tight">{t("dash.noTrips")}</h3>
                                <p className="text-text-medium mb-10 max-w-md mx-auto font-medium">
                                    {t("dash.noTripsDesc")}
                                </p>
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="btn-primary"
                                >
                                    {t("dash.createFirstTrip")}
                                </button>
                            </motion.div>

                        {/* Sales Templates */}
                        <div className="space-y-8">
                            <h4 className="text-[10px] font-black text-text-medium uppercase tracking-[0.4em] text-center">{t("dash.featuredTemplates")}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {templates.map((tpl, i) => (
                                    <motion.div
                                        key={tpl.id}
                                        onClick={() => handleTemplateClick(tpl)}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="bg-surface rounded-[2rem] p-8 border border-stroke group hover:border-accent transition-all cursor-pointer shadow-md"
                                    >
                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tpl.color} flex items-center justify-center text-2xl mb-6 shadow-xl`}>
                                            {tpl.icon}
                                        </div>
                                        <h5 className="text-xl font-black text-text-high mb-2 tracking-tight group-hover:text-accent transition-colors">{tpl.name}</h5>
                                        <p className="text-sm text-text-medium font-medium leading-relaxed">{tpl.desc}</p>
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
                                                className="group relative bg-surface rounded-[2rem] p-8 md:p-10 shadow-lg border border-stroke transition-all h-full flex flex-col overflow-hidden cursor-pointer"
                                            >
                                                {/* Background Decor */}
                                                <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover:opacity-[0.05] transition-all duration-700 group-hover:rotate-12 pointer-events-none">
                                                    <Plane size={120} className="text-accent -rotate-45" />
                                                </div>

                                                <div className="relative z-10 flex-1 space-y-6">
                                                    <div className="flex justify-between items-start gap-4">
                                                        <div className="space-y-2">
                                                            <h2 className="text-2xl md:text-3xl font-black font-outfit text-text-high leading-tight group-hover:text-accent transition-colors duration-300 tracking-tight line-clamp-2">
                                                                {trip.title}
                                                            </h2>
                                                            <div className="flex items-center gap-2">
                                                                <Calendar size={12} className="text-text-medium" />
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-text-medium">{t("dash.updatedRecently")}</span>
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                setActiveTripMenu(activeTripMenu === trip.id ? null : trip.id);
                                                            }}
                                                            className="p-2 hover:bg-accent/5 rounded-xl text-text-medium hover:text-text-high transition-all relative z-20"
                                                        >
                                                            <MoreVertical size={20} />
                                                        </button>
                                                    </div>
                                                    
                                                    {/* Progress Bar with Clamp for fluid spacing */}
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between items-end">
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-text-medium">{t("dash.progress")}</span>
                                                            <span className="text-[9px] font-black text-accent">{prog}%</span>
                                                        </div>
                                                        <div className="h-1 w-full bg-stroke rounded-full overflow-hidden">
                                                            <motion.div 
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${prog}%` }}
                                                                className="h-full bg-accent"
                                                            />
                                                        </div>
                                                    </div>

                                                    {trip.description && (
                                                        <p className="text-text-medium text-xs font-medium leading-relaxed line-clamp-2 pr-4">
                                                            {trip.description}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="relative z-10 pt-8 mt-auto flex items-center justify-between border-t border-stroke">
                                                    <div className="flex -space-x-2">
                                                        {/* Mock Avatars */}
                                                        {(trip.participants?.length || 1) > 1 ? (
                                                            [1, 2].map(n => (
                                                                <div key={n} className="w-8 h-8 rounded-full bg-accent text-canvas border-2 border-surface flex items-center justify-center text-[9px] font-black">
                                                                    P{n}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-full bg-accent text-canvas border-2 border-surface flex items-center justify-center text-[9px] font-black">
                                                                {t("fin.you")}
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-accent group-hover:translate-x-1 transition-transform">
                                                        {t("dash.openDetails")} <ArrowRight size={12} />
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
                                                        <Edit2 size={16} /> {t("dash.editInfo")}
                                                    </button>
                                                    <button 
                                                        className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            // Logic for delete would go here
                                                            setActiveTripMenu(null);
                                                        }}
                                                    >
                                                        <Trash2 size={16} /> {t("dash.deleteTrip")}
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
                    className="w-16 h-16 btn-ai"
                >
                    <Sparkles size={28} />
                </button>
                <button
                    onClick={() => {
                        if (userPlan === "FREE" && trips.length >= 3) {
                            setIsUpgradeOpen(true);
                        } else {
                            setIsCreateModalOpen(true);
                        }
                    }}
                    className="w-16 h-16 bg-accent text-canvas rounded-full shadow-2xl flex items-center justify-center transition-all active:scale-90 border border-canvas"
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
                        className="px-6 py-2 text-sm font-semibold text-text-medium hover:text-text-high transition-colors"
                    >
                        {t("dash.adminDashboard")}
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
                        className="glass bg-surface relative sm:rounded-[2.5rem] rounded-[2rem] p-10 max-w-md w-full shadow-2xl border border-stroke"
                    >
                        <h2 className="text-3xl font-black font-outfit text-text-high mb-8 tracking-tight uppercase leading-none">{t("dash.newDestination")}</h2>

                        <form onSubmit={handleCreateTrip} className="space-y-8">
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[10px] font-black text-text-medium uppercase tracking-[0.3em] px-2 leading-none">
                                    {t("dash.whereTo")}
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder={t("ai.placeholder.destination")}
                                    value={newTripTitle}
                                    onChange={(e) => setNewTripTitle(e.target.value)}
                                    className="input-surface w-full p-6 text-xl font-black"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[10px] font-black text-text-medium uppercase tracking-[0.3em] px-2 leading-none">
                                    {t("dash.shortNotes")}
                                </label>
                                <textarea
                                    placeholder={t("dash.shortNotesPlaceholder")}
                                    value={newTripDesc}
                                    onChange={(e) => setNewTripDesc(e.target.value)}
                                    className="input-surface w-full min-h-[120px] resize-none font-medium leading-relaxed rounded-[2rem]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-text-medium uppercase tracking-[0.3em] px-2 leading-none">
                                        Data Início
                                    </label>
                                    <input
                                        type="date"
                                        value={newTripStartDate}
                                        onChange={(e) => setNewTripStartDate(e.target.value)}
                                        className="input-surface w-full p-4 text-xs font-black uppercase tracking-widest text-accent text-center"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-text-medium uppercase tracking-[0.3em] px-2 leading-none">
                                        Data Fim
                                    </label>
                                    <input
                                        type="date"
                                        value={newTripEndDate}
                                        onChange={(e) => setNewTripEndDate(e.target.value)}
                                        className="input-surface w-full p-4 text-xs font-black uppercase tracking-widest text-accent text-center"
                                    />
                                </div>
                            </div>

                            {/* Bucket List URLs */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] px-2 leading-none">
                                    📍 Bucket List <span className="text-[8px] bg-emerald-500/10 text-emerald-500 tracking-widest px-1.5 py-0.5 rounded-sm">{userPlan === 'FREE' ? 'PREMIUM' : 'INCLUÍDO'}</span>
                                </label>
                                <textarea
                                    disabled={userPlan === "FREE"}
                                    placeholder={userPlan === "FREE" ? "Funcionalidade premium. Faz upgrade para importar as tuas listas do Maps." : "Cola links de listas do Maps...\nUm link por linha"}
                                    value={newTripBucketListUrls}
                                    onChange={(e) => setNewTripBucketListUrls(e.target.value)}
                                    rows={3}
                                    className={`input-surface w-full p-6 text-xs font-bold resize-none border-emerald-500/20 ${userPlan === "FREE" ? "bg-emerald-500/5 opacity-50 cursor-not-allowed hidden-scrollbar" : "bg-emerald-500/5 placeholder:text-emerald-500/30"}`}
                                />
                                <p className="text-[8px] font-bold text-text-dim px-2 uppercase tracking-widest leading-relaxed">
                                    {userPlan === "FREE" 
                                        ? "Faz upgrade para extraírmos os pontos das tuas listas do Google Maps automaticamente."
                                        : "Adiciona um link por linha. Vamos extrair os pontos automaticamente para o teu catálogo."}
                                </p>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    disabled={isCreating}
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 py-4.5 text-text-medium font-black rounded-full transition-all uppercase tracking-widest text-[10px]"
                                >
                                    {t("dash.cancel")}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="btn-primary flex-1"
                                >
                                    {isCreating ? <Loader2 size={18} className="animate-spin" /> : t("dash.createTrip")}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* AI Planner Modal */}
            <AIPlannerModal 
                isOpen={isAIPlannerOpen} 
                onClose={() => {
                    setIsAIPlannerOpen(false);
                    setCurrentTemplate(null);
                }} 
                initialData={currentTemplate || undefined} 
            />

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
