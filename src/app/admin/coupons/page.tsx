"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Key, Loader2, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function CouponGeneratorPage() {
    const router = useRouter();
    const [planGranted, setPlanGranted] = useState("SINGLE_TRIP");
    const [usesLeft, setUsesLeft] = useState(1);
    const [expiresAt, setExpiresAt] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [generatedCode, setGeneratedCode] = useState("");
    const [copied, setCopied] = useState(false);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: "", text: "" });
        setGeneratedCode("");
        setIsLoading(true);

        try {
            const body = {
                planGranted,
                usesLeft: Number(usesLeft),
                ...(expiresAt && { expiresAt })
            };

            const res = await fetch("/api/admin/coupons", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: "success", text: "Coupon generated successfully!" });
                setGeneratedCode(data.coupon.code);
                router.refresh();
            } else {
                setMessage({ type: "error", text: data.error });
            }
        } catch (err) {
            setMessage({ type: "error", text: "Failed to generate coupon." });
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!generatedCode) return;
        navigator.clipboard.writeText(generatedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-brand-bg p-4 md:p-8">
            <header className="flex items-center gap-4 mb-8">
                <Link href="/admin" className="p-2 bg-white dark:bg-gray-800 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                    <ArrowLeft size={20} className="text-brand-dark dark:text-white" />
                </Link>
                <h1 className="text-3xl font-extrabold font-outfit text-brand-dark dark:text-white">
                    Coupon Generator
                </h1>
            </header>

            <div className="max-w-xl glass-card p-8 rounded-3xl mx-auto border border-brand-primary/20 shadow-2xl shadow-brand-primary/5">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-brand-dark dark:text-white">
                    <Key className="text-brand-primary" /> Create New Access Code
                </h2>

                <form onSubmit={handleGenerate} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Plan Tier to Grant</label>
                        <select
                            value={planGranted}
                            onChange={(e) => setPlanGranted(e.target.value)}
                            className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 rounded-xl px-4 py-3 outline-none font-medium transition-all"
                        >
                            <option value="SINGLE_TRIP">Single Trip (€2.99 value)</option>
                            <option value="MONTHLY">Monthly Subscription (€5.99 value)</option>
                            <option value="YEARLY">Yearly Subscription (€49.99 value)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Usage Limit</label>
                        <input
                            type="number"
                            min="1"
                            required
                            value={usesLeft}
                            onChange={(e) => setUsesLeft(parseInt(e.target.value))}
                            className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 rounded-xl px-4 py-3 outline-none font-medium transition-all"
                        />
                        <p className="text-xs text-gray-500 mt-1">How many users can redeem this specific code.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Expiration Date (Optional)</label>
                        <input
                            type="date"
                            value={expiresAt}
                            onChange={(e) => setExpiresAt(e.target.value)}
                            className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 rounded-xl px-4 py-3 outline-none font-medium transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-4 py-4 bg-brand-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-brand-secondary transition-all disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={24} /> : "Generate Secure Code"}
                    </button>

                    {message.text && !generatedCode && (
                        <div className={`mt-4 p-3 rounded-lg text-sm font-bold text-center ${message.type === 'success'
                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                            }`}>
                            {message.text}
                        </div>
                    )}
                </form>

                {generatedCode && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="mt-8 p-6 bg-brand-dark dark:bg-gray-900 rounded-2xl border border-brand-primary border-dashed shadow-2xl relative"
                    >
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                            CODE GENERATED
                        </div>
                        <p className="text-gray-400 text-sm text-center mb-2">Share this code with the user:</p>
                        <div className="flex items-center justify-between bg-black/50 p-4 rounded-xl">
                            <span className="font-mono font-bold text-2xl text-emerald-400 tracking-widest">{generatedCode}</span>
                            <button
                                onClick={copyToClipboard}
                                className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-white"
                                title="Copy to clipboard"
                            >
                                {copied ? <Check className="text-emerald-400" size={20} /> : <Copy size={20} />}
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
