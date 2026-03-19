"use client";

import { motion } from "framer-motion";
import { UserPlus, Shield, Info } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface Participant {
    id: string;
    name: string;
    role: "Owner" | "Editor" | "Viewer";
    online?: boolean;
}

interface CollaborationModuleProps {
    participants: Participant[];
    onInvite: () => void;
}

export default function CollaborationModule({ participants, onInvite }: CollaborationModuleProps) {
    const { t } = useI18n();
    return (
        <div className="flex items-center gap-3 md:gap-6 bg-surface/50 p-2 md:p-3 rounded-full border border-stroke shadow-2xl backdrop-blur-xl group transition-all">
            <div className="flex -space-x-2 md:-space-x-3 px-1 md:px-2">
                {participants.map((p, i) => (
                    <motion.div
                        key={p.id}
                        initial={{ scale: 0, x: -20 }}
                        animate={{ scale: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="relative group/avatar"
                    >
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-accent text-canvas border-2 md:border-4 border-surface flex items-center justify-center text-[8px] md:text-[10px] font-black shadow-xl cursor-help">
                            {p.name.charAt(0).toUpperCase()}
                        </div>
                        
                        {/* Status Indicator */}
                        {p.online && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-accent-emerald rounded-full border-2 border-[#141820] shadow-[0_0_10px_#10B981]" />
                        )}

                        {/* Hover Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 group-hover/avatar:opacity-100 transition-all pointer-events-none z-50">
                            <div className="bg-obsidian border border-white/10 px-4 py-2 rounded-xl shadow-2xl space-y-1 min-w-[120px]">
                                <p className="text-[10px] font-black text-white uppercase tracking-tight">{p.name}</p>
                                <div className="flex items-center gap-1.5">
                                    <Shield size={10} className={p.role === 'Owner' ? 'text-accent-magenta' : 'text-accent-cobalt'} />
                                    <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">{p.role}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="h-6 w-px bg-white/10" />

            <button
                onClick={onInvite}
                className="flex items-center gap-1.5 md:gap-2 px-4 md:px-6 py-2 bg-accent text-canvas rounded-full font-black uppercase tracking-widest text-[8px] md:text-[9px] transition-all active:scale-95 whitespace-nowrap"
            >
                <UserPlus size={12} className="md:w-[14px] md:h-[14px]" />
                <span className="hidden xs:inline">{t("collab.invite")}</span>
                <span className="xs:hidden">+</span>
            </button>
        </div>
    );
}
