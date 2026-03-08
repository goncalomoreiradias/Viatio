"use client";

import { useEffect, useState } from "react";
import { Trip } from "@/types";
import { motion } from "framer-motion";
import { Loader2, Plus, Plane, MapPin, Calendar, Users } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import LanguageToggle from "@/components/LanguageToggle";
import { useRouter } from "next/navigation";

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

    // New Trip Form State
    const [newTripTitle, setNewTripTitle] = useState("");
    const [newTripDesc, setNewTripDesc] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    // i18n
    // const { t } = useI18n(); // Already declared above

    useEffect(() => {
        // Basic auth check from previous implementation - Removed, handled by session prop
        // const authStatus = sessionStorage.getItem("bali_auth");
        // const storedName = sessionStorage.getItem("bali_username");
        // if (authStatus === "true" && storedName) {
        //     setIsAuthenticated(true);
        //     setUserName(storedName);
        // }
        fetchTrips();
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
        <main className="min-h-screen bg-brand-bg relative pb-24">
            {/* Premium Header */}
            <header className="sticky top-0 z-40 glass border-b border-black/5 dark:border-white/5 pt-12 pb-6 px-6 sm:px-12 shadow-sm">
                <div className="max-w-7xl mx-auto flex justify-between items-end">
                    <div>
                        <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-sm font-semibold text-brand-secondary tracking-widest uppercase mb-1"
                        >
                            {t("dash.hello")}, {session.userId}
                        </motion.p>
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl sm:text-5xl font-bold font-outfit text-brand-dark dark:text-white tracking-tight"
                        >
                            {t("dash.yourTrips")}
                        </motion.h1>
                    </div>
                    <div className="flex flex-col sm:flex-row items-end gap-3 sm:gap-4 md:items-center">
                        <LanguageToggle />
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="hidden sm:flex px-6 py-3 bg-brand-primary hover:bg-brand-secondary text-white font-semibold rounded-2xl shadow-lg shadow-brand-primary/20 transition-all active:scale-[0.98] items-center gap-2"
                        >
                            <Plus size={20} /> {t("dash.newTrip")}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-6 sm:px-12 py-12">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 size={40} className="text-brand-primary animate-spin" />
                    </div>
                ) : trips.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20 px-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-3xl"
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
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    whileHover={{ y: -5, scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="group relative bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm hover:shadow-2xl hover:shadow-brand-secondary/10 border border-gray-100 dark:border-gray-800 transition-all h-full flex flex-col overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Plane size={80} className="text-brand-secondary -rotate-45 translate-x-4 -translate-y-4" />
                                    </div>

                                    <div className="relative z-10 flex-1">
                                        <h2 className="text-2xl font-bold font-outfit text-brand-dark dark:text-white mb-2 group-hover:text-brand-secondary transition-colors line-clamp-2">
                                            {trip.title}
                                        </h2>
                                        {trip.description && (
                                            <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-6">
                                                {trip.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="relative z-10 pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 font-medium">
                                        <div className="flex items-center gap-1.5">
                                            <Users size={16} />
                                            <span>{trip.participants?.length || 1} {t("dash.participants")}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Mobile FAB */}
            <button
                onClick={() => setIsCreateModalOpen(true)}
                className="sm:hidden fixed bottom-8 right-8 z-[50] w-16 h-16 bg-brand-primary text-white rounded-full shadow-2xl shadow-brand-primary/40 flex items-center justify-center transition-all hover:scale-105 active:scale-95 border border-white/20"
            >
                <Plus size={32} />
            </button>

            <div className="mt-12 text-center pb-8 flex flex-col items-center">
                <button
                    onClick={handleLogout}
                    className="px-6 py-2 text-sm font-semibold text-rose-500 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 rounded-full transition-colors mb-4"
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => !isCreating && setIsCreateModalOpen(false)}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/10"
                    >
                        <h2 className="text-2xl font-bold font-outfit text-brand-dark dark:text-white mb-6">{t("dash.createTitle")}</h2>

                        <form onSubmit={handleCreateTrip} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t("dash.destinationTitle")}</label>
                                <input
                                    type="text"
                                    required
                                    placeholder={t("dash.destPlaceholder")}
                                    value={newTripTitle}
                                    onChange={(e) => setNewTripTitle(e.target.value)}
                                    className="w-full px-5 py-4 bg-gray-50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-brand-secondary outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t("dash.descOptional")}</label>
                                <textarea
                                    placeholder={t("dash.descPlaceholder")}
                                    value={newTripDesc}
                                    onChange={(e) => setNewTripDesc(e.target.value)}
                                    className="w-full px-5 py-4 bg-gray-50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-brand-secondary outline-none transition-all min-h-[100px] resize-none"
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-bold rounded-2xl transition-all"
                                >
                                    {t("dash.cancel")}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="flex-1 py-4 bg-brand-primary hover:bg-brand-secondary disabled:opacity-70 text-white font-bold rounded-2xl shadow-xl shadow-brand-primary/20 transition-all flex items-center justify-center gap-2"
                                >
                                    {isCreating ? <Loader2 size={20} className="animate-spin" /> : t("dash.createBtn")}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </main>
    );
}
