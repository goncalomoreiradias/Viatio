"use client";

import { useI18n } from "@/lib/i18n";
import { motion } from "framer-motion";

export default function LanguageToggle() {
    const { language, setLanguage } = useI18n();

    return (
        <div className="glass flex items-center gap-1 bg-obsidian/40 p-1.5 rounded-full border border-white/5 shadow-2xl backdrop-blur-xl">
            <button
                onClick={() => setLanguage("pt")}
                className={`relative px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all z-10 ${
                    language === "pt" ? "text-canvas" : "text-text-medium hover:text-text-high"
                }`}
            >
                PT
                {language === "pt" && (
                    <motion.div
                        layoutId="lang-active"
                        className="absolute inset-0 bg-accent rounded-full -z-10 shadow-lg border border-white/20"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                )}
            </button>

            <button
                onClick={() => setLanguage("en")}
                className={`relative px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all z-10 ${
                    language === "en" ? "text-canvas" : "text-text-medium hover:text-text-high"
                }`}
            >
                EN
                {language === "en" && (
                    <motion.div
                        layoutId="lang-active"
                        className="absolute inset-0 bg-accent rounded-full -z-10 shadow-lg border border-white/20"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                )}
            </button>
        </div>
    );
}
