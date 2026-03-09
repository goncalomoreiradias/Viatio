"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import pt from "./pt";
import en from "./en";

type Language = "pt" | "en";
type Translations = typeof pt;

interface I18nContextType {
    language: Language;
    t: (key: keyof Translations) => string;
    setLanguage: (lang: Language) => void;
}

const I18nContext = createContext<I18nContextType>({
    language: "pt",
    t: (key) => pt[key] || key,
    setLanguage: () => { },
});

export function I18nProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>("pt");

    useEffect(() => {
        const savedLang = localStorage.getItem("app_lang") as Language;
        if (savedLang === "en" || savedLang === "pt") {
            // eslint-disable-next-line
            setLanguage(savedLang);
        }
    }, []);

    const changeLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem("app_lang", lang);
    };

    const t = (key: keyof Translations) => {
        const dict = language === "en" ? en : pt;
        return dict[key] || key;
    };

    return (
        <I18nContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
            {children}
        </I18nContext.Provider>
    );
}

export const useI18n = () => useContext(I18nContext);
