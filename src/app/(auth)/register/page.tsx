"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Mail, User, Loader2, ArrowLeft, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import LanguageToggle from "@/components/LanguageToggle";

export default function RegisterPage() {
    const router = useRouter();
    const { t } = useI18n();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            if (res.ok) {
                window.location.href = "/";
            } else {
                const data = await res.json();
                setError(data.error || "An error occurred. Please try again.");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    const handleGoogleAuth = () => {
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        if (!clientId) {
            setError("Google Login is not configured yet. Missing Client ID.");
            return;
        }

        const redirectUri = `${window.location.origin}/api/auth/google/callback`;
        const scope = "email profile";
        const responseType = "code";
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&access_type=offline&prompt=consent`;

        window.location.href = authUrl;
    };

    return (
        <main className="min-h-screen bg-obsidian text-white relative overflow-hidden flex flex-col items-center justify-center p-6 selection:bg-accent-cobalt selection:text-white">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent-cobalt/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent-magenta/5 blur-[120px] rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.02] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:36px_36px]" />
            </div>

            {/* Top Navigation */}
            <div className="absolute top-8 left-8 z-50">
                <Link href="/" className="group flex items-center gap-3 glass bg-obsidian/40 border-white/5 px-6 py-3 rounded-full hover:bg-white/10 transition-all border shadow-2xl active:scale-95">
                    <ArrowLeft size={18} className="text-accent-cobalt group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">{t("auth.back")}</span>
                </Link>
            </div>
            <div className="absolute top-8 right-8 z-50">
                <LanguageToggle />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="glass bg-[#141820]/60 p-10 sm:p-14 rounded-[3.5rem] border border-white/5 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] relative overflow-hidden">
                    {/* Decorative Blob */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent-cobalt/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                    
                    <div className="text-center mb-12 relative z-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/5 border border-white/10 rounded-3xl mb-8 group-hover:scale-110 transition-transform">
                            <Sparkles className="text-accent-cobalt" size={32} />
                        </div>
                        <h1 className="text-4xl font-black font-outfit text-white tracking-tight mb-3 uppercase leading-none">
                            {t("auth.register_title")}
                        </h1>
                        <p className="text-gray-500 font-medium tracking-tight">{t("auth.register_subtitle")}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-[0.2em] p-5 rounded-2xl text-center shadow-2xl shadow-rose-500/10"
                            >
                                {error}
                            </motion.div>
                        )}

                        <div className="space-y-4">
                            <button
                                type="button"
                                onClick={handleGoogleAuth}
                                disabled={loading}
                                className="group w-full flex justify-center items-center py-4.5 px-6 bg-white border border-white/10 rounded-full shadow-[0_20px_40px_-10px_rgba(255,255,255,0.1)] text-xs font-black text-obsidian uppercase tracking-[0.2em] hover:bg-gray-100 transition-all active:scale-95 disabled:opacity-50"
                            >
                                <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Continue with Google
                            </button>
                        </div>

                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-white/5"></div>
                            <span className="flex-shrink-0 mx-6 text-gray-700 text-[10px] font-black uppercase tracking-[0.3em]">ou e-mail</span>
                            <div className="flex-grow border-t border-white/5"></div>
                        </div>

                        <div className="space-y-4">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-7 flex items-center pointer-events-none text-gray-700 group-focus-within:text-accent-cobalt transition-colors">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    required
                                    placeholder={t("auth.name")}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 focus:border-accent-cobalt rounded-full pl-16 pr-8 py-4.5 outline-none font-black text-white placeholder:text-gray-800 text-sm tracking-tight transition-all"
                                />
                            </div>

                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-7 flex items-center pointer-events-none text-gray-700 group-focus-within:text-accent-cobalt transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    placeholder={t("auth.email")}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 focus:border-accent-cobalt rounded-full pl-16 pr-8 py-4.5 outline-none font-black text-white placeholder:text-gray-800 text-sm tracking-tight transition-all"
                                />
                            </div>

                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-7 flex items-center pointer-events-none text-gray-700 group-focus-within:text-accent-cobalt transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    placeholder={t("auth.password")}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 focus:border-accent-cobalt rounded-full pl-16 pr-8 py-4.5 outline-none font-black text-white placeholder:text-gray-800 text-sm tracking-tight transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-gradient-to-br from-accent-cobalt via-accent-indigo to-accent-magenta text-white font-black rounded-full shadow-[0_20px_40px_-10px_rgba(46,91,255,0.4)] flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 text-[11px] uppercase tracking-[0.2em] border border-white/20 mt-4"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>
                                    {t("auth.register_btn")} <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-12 text-center text-gray-500 font-black text-[10px] uppercase tracking-[0.2em] relative z-10">
                        {t("auth.has_account")}{" "}
                        <Link href="/login" className="text-accent-cobalt hover:text-white transition-colors">
                            {t("auth.signin_link")}
                        </Link>
                    </p>
                </div>
            </motion.div>
        </main>
    );
}
