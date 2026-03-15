"use client";

import { useEffect, useState } from "react";
import { Trip } from "@/types";
import { motion } from "framer-motion";
import { Loader2, Plus, Plane, MapPin, Calendar, Users, Sparkles } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import LanguageToggle from "@/components/LanguageToggle";
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

    return (
        <main className="min-h-screen bg-obsidian relative pb-24 selection:bg-accent-cobalt selection:text-white">
            {/* Premium Header */}
            <header className="sticky top-0 z-40 glass border-b border-white/5 pt-16 pb-8 px-8 sm:px-12 shadow-2xl">
                {/* Micro-pattern overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
                
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
                    <div className="space-y-1">
                        <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-[10px] font-black text-accent-cobalt tracking-[0.3em] uppercase"
                        >
                            {t("dash.hello")}, {session.name || "Viajante"}
                        </motion.p>
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl sm:text-6xl font-black font-outfit text-white tracking-tight"
                        >
                            {t("dash.yourTrips")}
                        </motion.h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:items-center">
                        <div className="neumorphic-inset p-1 rounded-2xl flex items-center gap-1">
                            <LanguageToggle />
                        </div>
                        
                        <button
                            onClick={() => userPlan === "FREE" ? setIsUpgradeOpen(true) : setIsAIPlannerOpen(true)}
                            className="px-6 py-3.5 bg-gradient-to-br from-[#D946EF] via-[#8B5CF6] to-[#6366F1] hover:scale-[1.04] hover:shadow-[0_20px_40px_-10px_rgba(139,92,246,0.5)] text-white font-black rounded-full transition-all active:scale-[0.96] items-center gap-2 border border-white/20 shadow-2xl group flex"
                        >
                            <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
                            <span className="text-xs uppercase tracking-widest">Planear com AI</span>
                        </button>
                        
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="px-6 py-3.5 bg-white text-obsidian hover:bg-gray-100 font-black rounded-full shadow-2xl transition-all active:scale-[0.96] items-center gap-2 border border-white/10 flex"
                        >
                            <Plus size={20} />
                            <span className="text-xs uppercase tracking-widest">{t("dash.newTrip")}</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-8 sm:px-12 py-12">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 size={40} className="text-brand-primary animate-spin" />
                    </div>
                ) : trips.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20 px-6 border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-3xl"
                    >
                        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <MapPin size={40} className="text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{t("dash.noTrips")}</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                            {t("dash.noTripsDesc")}
                        </p>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="sm:hidden px-8 py-4 bg-brand-primary text-white font-bold rounded-2xl shadow-xl shadow-brand-primary/20 transition-all active:scale-[0.98]"
                        >
                            {t("dash.createFirst")}
                        </button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trips.map((trip, i) => (
                            <Link href={`/trips/${trip.id}`} key={trip.id}>
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    whileHover={{ y: -8, scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="group relative bg-[#141820] rounded-[2.5rem] p-8 shadow-2xl hover:shadow-accent-cobalt/20 border border-white/5 transition-all h-full flex flex-col overflow-hidden"
                                >
                                    {/* Plane Glow Effect */}
                                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-all duration-500 group-hover:scale-110">
                                        <Plane size={100} className="text-accent-cobalt -rotate-45 translate-x-4 -translate-y-4 filter blur-[1px]" />
                                    </div>
                                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent-cobalt/10 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="relative z-10 flex-1 space-y-4">
                                        <h2 className="text-2xl sm:text-3xl font-black font-outfit text-white leading-tight group-hover:text-accent-cobalt transition-colors duration-300">
                                            {trip.title}
                                        </h2>
                                        {trip.description && (
                                            <p className="text-gray-400 text-sm font-medium leading-relaxed line-clamp-3">
                                                {trip.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="relative z-10 pt-8 mt-8 border-t border-white/5 flex items-center justify-between">
                                        <div className="px-4 py-2 bg-obsidian/50 rounded-full border border-white/5 flex items-center gap-2">
                                            <Users size={14} className="text-accent-cobalt" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">
                                                {trip.participants?.length || 1} {t("dash.participants")}
                                            </span>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-accent-cobalt/10 flex items-center justify-center group-hover:bg-accent-cobalt group-hover:text-white transition-all text-accent-cobalt">
                                            <Plane size={18} />
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
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
                    Sair / Logout
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
