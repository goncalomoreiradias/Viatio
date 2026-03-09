"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Mail, Loader2, ArrowLeft } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import LanguageToggle from "@/components/LanguageToggle";

export default function LoginPage() {
    const router = useRouter();
    const { t } = useI18n();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Read URL errors from Google Auth callbacks
        const searchParams = new URLSearchParams(window.location.search);
        const urlError = searchParams.get("error");
        if (urlError) {
            setError(urlError);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (res.ok) {
                window.location.href = "/"; // Force full reload to update server layout state
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
        <div className="min-h-screen bg-brand-bg dark:bg-gray-950 relative flex flex-col items-center justify-center p-4">
            {/* Decorative Blur Orbs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-brand-primary/20 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-secondary/20 rounded-full blur-[100px] pointer-events-none translate-x-1/2 translate-y-1/2" />

            <div className="absolute top-6 left-6 z-50">
                <Link href="/" className="w-10 h-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 transition-all shadow-sm border border-gray-200 dark:border-gray-700">
                    <ArrowLeft size={20} />
                </Link>
            </div>
            <div className="absolute top-6 right-6 z-50">
                <LanguageToggle />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="glass-card p-10 sm:rounded-[2.5rem]">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-extrabold font-outfit text-brand-dark dark:text-white tracking-tight mb-3">
                            {t("auth.login_title")}
                        </h1>
                        <p className="text-gray-500 font-medium">{t("auth.login_subtitle")}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-bold p-4 rounded-2xl text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-3">
                            <button
                                type="button"
                                onClick={handleGoogleAuth}
                                disabled={loading}
                                className="w-full flex justify-center items-center py-3.5 px-4 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm bg-white dark:bg-black/50 text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-zinc-100 dark:focus:ring-zinc-900 transition-all disabled:opacity-50"
                            >
                                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Google
                            </button>
                        </div>

                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
                            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium">or</span>
                            <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
                        </div>

                        <div className="space-y-4">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-primary transition-colors">
                                    <Mail size={20} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    placeholder={t("auth.email")}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 rounded-2xl pl-12 pr-5 py-4 outline-none font-medium transition-all"
                                />
                            </div>

                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-primary transition-colors">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    placeholder={t("auth.password")}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 rounded-2xl pl-12 pr-5 py-4 outline-none font-medium transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-brand-primary hover:bg-brand-secondary text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 shadow-brand-primary/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 text-lg"
                        >
                            {loading ? <Loader2 className="animate-spin" size={24} /> : (
                                <>
                                    {t("auth.signin")} <ArrowRight size={20} className="ml-1" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-gray-500 font-medium">
                        {t("auth.no_account")}{" "}
                        <Link href="/register" className="text-brand-primary hover:text-brand-secondary font-bold transition-colors">
                            {t("auth.signup_link")}
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
