"use client";

import { useI18n } from "@/lib/i18n";
import { motion } from "framer-motion";

export default function LanguageToggle() {
    const { language, setLanguage } = useI18n();

    return (
        <div className="glass flex items-center gap-1 bg-obsidian/40 p-1.5 rounded-full border border-white/5 shadow-2xl backdrop-blur-xl">
            <button
                onClick={() => setLanguage("pt")}
                className={`relative px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all z-10 ${language === "pt" ? "text-white" : "text-gray-500 hover:text-gray-300"
                    }`}
            >
                PT
                {language === "pt" && (
                    <motion.div
                        layoutId="lang-active"
                        className="absolute inset-0 bg-accent-cobalt rounded-full -z-10 shadow-[0_0_20px_rgba(46,91,255,0.4)] border border-white/20"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                )}
            </button>

            <button
                onClick={() => setLanguage("en")}
                className={`relative px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all z-10 ${language === "en" ? "text-white" : "text-gray-500 hover:text-gray-300"
                    }`}
            >
                EN
                {language === "en" && (
                    <motion.div
                        layoutId="lang-active"
                        className="absolute inset-0 bg-accent-cobalt rounded-full -z-10 shadow-[0_0_20px_rgba(46,91,255,0.4)] border border-white/20"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                )}
            </button>
        </div>
    );
}
