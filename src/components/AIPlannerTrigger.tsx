"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

interface AIPlannerTriggerProps {
    onClick: () => void;
}

export default function AIPlannerTrigger({ onClick }: AIPlannerTriggerProps) {
    return (
        <motion.button
            onClick={onClick}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="relative w-full overflow-hidden rounded-[3rem] p-1 group border border-white/10 shadow-2xl"
        >
            {/* Animated Mesh Gradient Background */}
            <div className="absolute inset-0 bg-[#0D0D0D]" />
            <motion.div 
                animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 0],
                    x: [-20, 20, -20],
                    y: [-20, 20, -20]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 left-0 w-[200%] h-[200%] opacity-30 pointer-events-none"
                style={{
                    background: "radial-gradient(circle at 50% 50%, #8B5CF6 0%, transparent 50%), radial-gradient(circle at 80% 20%, #D946EF 0%, transparent 40%), radial-gradient(circle at 20% 80%, #6366F1 0%, transparent 40%)"
                }}
            />

            {/* Content Overlay */}
            <div className="relative glass bg-black/60 backdrop-blur-3xl px-10 py-12 flex flex-col items-center text-center gap-6">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl relative">
                    <Sparkles size={32} className="text-white animate-pulse" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-magenta rounded-full shadow-[0_0_10px_#D946EF]" />
                </div>
                
                <div className="space-y-4">
                    <h3 className="text-3xl font-black font-outfit text-text-primary tracking-tight uppercase leading-[0.9]">
                        Arquiteto <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-indigo to-accent-magenta">AI</span>
                    </h3>
                    <p className="text-text-secondary font-medium text-sm max-w-xs leading-relaxed">
                        Deixe que a nossa inteligência artificial desenhe o itinerário perfeito em segundos. Personalizado, bilíngue e pronto a usar.
                    </p>
                </div>

                <div className="flex items-center gap-3 px-8 py-4 bg-white text-[#0D0D0D] rounded-full font-black uppercase tracking-widest text-xs transition-all group-hover:gap-5 shadow-xl">
                    Começar Agora
                    <ArrowRight size={16} />
                </div>
            </div>
        </motion.button>
    );
}
