"use client";

import { useState } from "react";
import { X, Copy, Check, Shield, Globe, Users, Link as LinkIcon, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Participant {
    id: string;
    name: string;
    role: "Owner" | "Editor" | "Viewer";
    online?: boolean;
}

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    inviteLink: string;
    participants: Participant[];
}

export default function ShareModal({ isOpen, onClose, inviteLink, participants }: ShareModalProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="bg-surface w-full max-w-lg max-h-[90vh] sm:rounded-[2.5rem] rounded-t-[2.5rem] shadow-2xl flex flex-col overflow-hidden border-t border-x border-stroke sm:border"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 sm:p-8 flex items-start justify-between border-b border-stroke bg-canvas/40">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight font-outfit text-text-high flex items-center gap-3">
                                <span className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                                    <UserPlus size={20} />
                                </span>
                                Partilhar Viagem
                            </h2>
                            <p className="text-xs font-bold text-text-medium mt-2">
                                Convida amigos e familiares para planear esta viagem em conjunto.
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 sm:p-3 bg-surface hover:bg-stroke rounded-full transition-all active:scale-95 border border-stroke text-text-medium hover:text-text-high">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
                        {/* Link Section */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black text-text-medium uppercase tracking-[0.2em]">
                                <LinkIcon size={12} /> Link de Convite
                            </label>
                            <div className="flex items-center gap-2 bg-canvas border border-stroke rounded-2xl p-2 pl-4 transition-all focus-within:ring-2 focus-within:ring-accent/50 focus-within:border-accent">
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-sm font-semibold text-text-high truncate select-all">{inviteLink}</p>
                                </div>
                                <button
                                    onClick={handleCopy}
                                    className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shrink-0 ${
                                        copied 
                                        ? "bg-emerald-500 text-white" 
                                        : "bg-accent text-canvas hover:brightness-110 active:scale-95"
                                    }`}
                                >
                                    {copied ? <Check size={14} /> : <Copy size={14} />}
                                    {copied ? "Copiado!" : "Copiar"}
                                </button>
                            </div>
                            <p className="text-[10px] text-text-dim font-bold flex items-center gap-1.5 px-1">
                                <Globe size={10} /> Qualquer pessoa com este link pode ver e editar o roteiro.
                            </p>
                        </div>

                        {/* Participants List */}
                        <div className="space-y-4">
                            <label className="flex items-center gap-2 text-[10px] font-black text-text-medium uppercase tracking-[0.2em]">
                                <Users size={12} /> Pessoas com Acesso ({participants.length})
                            </label>
                            <div className="space-y-2">
                                {participants.map((p, idx) => (
                                    <div key={p.id} className="flex items-center justify-between p-4 bg-canvas/50 border border-stroke rounded-2xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-accent text-canvas flex items-center justify-center text-sm font-black shadow-md border-2 border-surface">
                                                {p.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-text-high leading-tight">{p.name}</span>
                                                {p.online && (
                                                    <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online agora
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-stroke">
                                            <Shield size={10} className="text-text-dim" />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-text-medium">
                                                {p.role}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
