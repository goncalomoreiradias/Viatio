"use client";

import { useI18n } from "@/lib/i18n";
import { motion } from "framer-motion";

export default function LanguageToggle() {
    const { language, setLanguage } = useI18n();

    return (
        <div className="flex items-center gap-1 bg-black/5 dark:bg-white/10 p-1 rounded-full shadow-inner border border-black/5 dark:border-white/5">
            <button
                onClick={() => setLanguage("pt")}
                className={`relative px-3 py-1.5 text-xs font-bold rounded-full transition-colors z-10 ${language === "pt" ? "text-brand-primary dark:text-gray-900" : "text-gray-500 hover:text-brand-primary"
                    }`}
            >
                PT
                {language === "pt" && (
                    <motion.div
                        layoutId="lang-active"
                        className="absolute inset-0 bg-white rounded-full -z-10 shadow-sm"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                )}
            </button>

            <button
                onClick={() => setLanguage("en")}
                className={`relative px-3 py-1.5 text-xs font-bold rounded-full transition-colors z-10 ${language === "en" ? "text-brand-primary dark:text-gray-900" : "text-gray-500 hover:text-brand-primary"
                    }`}
            >
                EN
                {language === "en" && (
                    <motion.div
                        layoutId="lang-active"
                        className="absolute inset-0 bg-white rounded-full -z-10 shadow-sm"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                )}
            </button>
        </div>
    );
}
