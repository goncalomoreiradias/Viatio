"use client";

import { useState } from "react";
import { ArrowLeft, Users, Activity, LogOut, Search, Filter, Mail, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

interface AdminClientProps {
    initialUsers: any[];
    initialLogs: any[];
    initialCoupons: any[];
    initialTickets: any[];
    initialConfig: any;
    stats: any;
}

export default function AdminClient({ initialUsers, initialLogs, initialCoupons, initialTickets, initialConfig, stats }: AdminClientProps) {
    const [activeTab, setActiveTab] = useState<"users" | "tickets" | "logs" | "config">("users");
    const [searchQuery, setSearchQuery] = useState("");
    const [planFilter, setPlanFilter] = useState("ALL");
    const [tickets, setTickets] = useState(initialTickets);
    const [users, setUsers] = useState(initialUsers);

    // Config state
    const [config, setConfig] = useState(initialConfig);
    const [isSavingConfig, setIsSavingConfig] = useState(false);
    const [configMessage, setConfigMessage] = useState("");
    
    const handleSaveConfig = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingConfig(true);
        setConfigMessage("");
        try {
            const res = await fetch("/api/admin/config", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config)
            });
            if (res.ok) {
                setConfigMessage("Configurações guardadas com sucesso! ✅");
                setTimeout(() => setConfigMessage(""), 3000);
            } else {
                setConfigMessage("Erro ao guardar as configurações.");
            }
        } catch (error) {
            setConfigMessage("Erro na ligação à API.");
        } finally {
            setIsSavingConfig(false);
        }
    };

    const filteredUsers = users.filter((user: any) => {
        const matchesSearch = user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPlan = planFilter === "ALL" || user.plan === planFilter;
        return matchesSearch && matchesPlan;
    });

    const handleToggleBan = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/admin/users/${id}/ban`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isBanned: !currentStatus })
            });
            if (res.ok) {
                setUsers(users.map((u: any) => u.id === id ? { ...u, isBanned: !currentStatus } : u));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleResolveTicket = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === "RESOLVED" ? "OPEN" : "RESOLVED";
        try {
            const res = await fetch(`/api/admin/tickets/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                setTickets(tickets.map((t: any) => t.id === id ? { ...t, status: newStatus } : t));
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-canvas text-text-high p-6 md:p-12 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full" />
                <div className="absolute top-1/2 right-[-5%] w-[30%] h-[30%] bg-accent/5 blur-[120px] rounded-full" />
            </div>

            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16 relative z-10">
                <div className="flex items-center gap-6">
                    <Link href="/" className="group p-4 bg-surface border border-stroke rounded-full hover:bg-stroke transition-all shadow-2xl active:scale-90">
                        <ArrowLeft size={22} className="text-text-medium group-hover:text-text-high transition-colors" />
                    </Link>
                    <div>
                        <p className="text-[10px] font-black text-accent tracking-[0.4em] uppercase mb-1">Admin Central</p>
                        <h1 className="text-4xl font-black font-outfit text-text-high tracking-tighter leading-none uppercase">
                            Dashboard
                        </h1>
                    </div>
                </div>

                <div className="flex bg-surface border border-stroke rounded-full p-1 shadow-lg">
                    {(["users", "tickets", "logs", "config"] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 md:px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                                activeTab === tab ? "bg-text-high text-canvas shadow-md" : "text-text-medium hover:text-text-high"
                            }`}
                        >
                            {tab === "config" ? "Preços & AI" : tab}
                        </button>
                    ))}
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 relative z-10">
                <div className="bg-surface p-10 rounded-[3rem] border border-stroke shadow-2xl group hover:border-accent/30 transition-all">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-accent/10 rounded-2xl">
                            <Users size={24} className="text-accent" />
                        </div>
                        <h3 className="text-[10px] font-black text-text-medium uppercase tracking-[0.3em]">Total Users</h3>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="text-6xl font-black font-outfit text-text-high tracking-tighter">{stats.userCount}</p>
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    </div>
                </div>

                <div className="bg-surface p-10 rounded-[3rem] border border-stroke shadow-2xl group hover:border-accent/30 transition-all">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-accent/10 rounded-2xl">
                            <Activity size={24} className="text-accent" />
                        </div>
                        <h3 className="text-[10px] font-black text-text-medium uppercase tracking-[0.3em]">Total Trips</h3>
                    </div>
                    <p className="text-6xl font-black font-outfit text-text-high tracking-tighter">{stats.tripCount}</p>
                </div>

                <div className="bg-surface p-10 rounded-[3rem] border border-stroke shadow-2xl group hover:border-accent/30 transition-all">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-accent/10 rounded-2xl">
                            <Activity size={24} className="text-accent" />
                        </div>
                        <h3 className="text-[10px] font-black text-text-medium uppercase tracking-[0.3em]">AI Spend</h3>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="text-6xl font-black font-outfit text-text-high tracking-tighter">€{stats.totalAiCost.toFixed(3)}</p>
                        <span className="text-[10px] font-black text-text-medium uppercase tracking-widest">{stats.totalAiRequests} Req</span>
                    </div>
                </div>
            </div>

            {/* TAB: USERS */}
            {activeTab === "users" && (
                <div className="bg-surface p-6 sm:p-10 rounded-[3rem] border border-stroke shadow-2xl mb-12 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <h2 className="text-2xl font-black font-outfit text-text-high uppercase tracking-tight">Gestão de Utilizadores</h2>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <div className="relative w-full sm:w-auto">
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-medium" />
                                <input 
                                    type="text" 
                                    placeholder="Pesquisar por nome ou email..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full sm:w-64 bg-canvas border border-stroke rounded-full py-3.5 pl-12 pr-6 text-sm outline-none focus:ring-2 focus:ring-accent"
                                />
                            </div>
                            <div className="flex bg-canvas border border-stroke rounded-full p-1 overflow-x-auto hidden-scrollbar">
                                {["ALL", "FREE", "SINGLE_TRIP", "MONTHLY", "YEARLY"].map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setPlanFilter(p)}
                                        className={`px-4 py-2 rounded-full text-[10px] whitespace-nowrap font-black uppercase tracking-widest transition-all ${planFilter === p ? "bg-accent/10 text-accent" : "text-text-medium hover:text-text-high"}`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-separate border-spacing-y-3 min-w-[800px]">
                            <thead>
                                <tr>
                                    <th className="pb-4 px-6 text-[10px] font-black text-text-medium uppercase tracking-[0.3em]">User</th>
                                    <th className="pb-4 px-6 text-[10px] font-black text-text-medium uppercase tracking-[0.3em]">Plan</th>
                                    <th className="pb-4 px-6 text-[10px] font-black text-text-medium uppercase tracking-[0.3em]">Trips</th>
                                    <th className="pb-4 px-6 text-[10px] font-black text-text-medium uppercase tracking-[0.3em]">AI Cost</th>
                                    <th className="pb-4 px-6 text-[10px] font-black text-text-medium uppercase tracking-[0.3em]">Joined</th>
                                    <th className="pb-4 px-6 text-[10px] font-black text-text-medium uppercase tracking-[0.3em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user: any) => (
                                    <tr key={user.id} className={`group ${user.isBanned ? 'opacity-50' : 'cursor-default'}`}>
                                        <td className="py-5 px-6 bg-canvas first:rounded-l-[1.5rem] border-y border-stroke border-l group-hover:bg-stroke transition-all relative">
                                            {user.isBanned && <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 rounded-l-[1.5rem]" />}
                                            <div className="flex flex-col">
                                                <span className="font-black text-text-high tracking-tight flex items-center gap-2">
                                                    {user.name || "Anonymous"}
                                                    {user.isBanned && <span className="text-[8px] font-black bg-rose-500/20 text-rose-500 px-2 py-0.5 rounded-sm uppercase tracking-widest">Banned</span>}
                                                </span>
                                                <span className="text-[11px] font-medium text-text-medium">{user.email}</span>
                                            </div>
                                        </td>
                                        <td className="py-5 px-6 bg-canvas border-y border-stroke group-hover:bg-stroke transition-all">
                                            <span className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full border ${
                                                user.plan !== 'FREE' 
                                                    ? 'bg-accent/10 text-accent border-accent/20' 
                                                    : 'bg-surface text-text-medium border-stroke'
                                            }`}>
                                                {user.plan}
                                            </span>
                                        </td>
                                        <td className="py-5 px-6 bg-canvas border-y border-stroke group-hover:bg-stroke transition-all">
                                            <span className="text-sm font-black text-text-high">{user.tripCount}</span>
                                        </td>
                                        <td className="py-5 px-6 bg-canvas border-y border-stroke group-hover:bg-stroke transition-all">
                                            <span className="text-sm font-black text-accent tracking-tighter">€{user.totalAiSpend?.toFixed(3) || "0.000"}</span>
                                        </td>
                                        <td className="py-5 px-6 bg-canvas border-y border-stroke group-hover:bg-stroke transition-all">
                                            <span className="text-xs font-bold text-text-medium opacity-50">{new Date(user.createdAt).toLocaleDateString()}</span>
                                        </td>
                                        <td className="py-5 px-6 bg-canvas last:rounded-r-[1.5rem] border-y border-stroke border-r group-hover:bg-stroke transition-all text-right">
                                            <button
                                                onClick={() => handleToggleBan(user.id, user.isBanned)}
                                                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                                    user.isBanned 
                                                        ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' 
                                                        : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'
                                                }`}
                                            >
                                                {user.isBanned ? 'Unban' : 'Suspend'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredUsers.length === 0 && (
                            <div className="text-center py-12 text-text-medium font-bold uppercase tracking-widest text-xs">
                                Nenhum utilizador encontrado
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB: CONFIGURATIONS */}
            {activeTab === "config" && (
                <div className="bg-surface p-6 sm:p-10 rounded-[3rem] border border-stroke shadow-2xl mb-12 relative z-10">
                    <div className="mb-8">
                        <h2 className="text-2xl font-black font-outfit text-text-high uppercase tracking-tight">Preços & Algoritmos de AI</h2>
                        <p className="text-sm font-medium text-text-medium mt-1">Gere os parâmetros financeiros cobrados aos utilizadores e as margens de tolerância de Custo da API da OpenAI dependendo do plano associado.</p>
                    </div>

                    <form onSubmit={handleSaveConfig} className="space-y-12">
                        {/* SINGLE TRIP */}
                        <div className="p-8 rounded-[2rem] bg-canvas border border-stroke flex flex-col md:flex-row gap-8">
                            <div className="md:w-1/3">
                                <h3 className="text-lg font-black uppercase tracking-widest text-text-high">Plano Única</h3>
                                <p className="text-xs font-medium text-text-medium mt-2">Dá direito a apenas 1 Geração completa. Volta depois ao plano FREE.</p>
                            </div>
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-medium">Preço Cobrado (€)</label>
                                    <input type="number" step="0.01" value={config.singleTripPrice} onChange={e => setConfig({ ...config, singleTripPrice: parseFloat(e.target.value) })} className="w-full bg-surface border border-stroke rounded-xl px-4 py-3 font-bold text-text-high outline-none focus:border-accent" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-medium">Limite Gasto AI (€)</label>
                                    <input type="number" step="0.01" value={config.singleTripAiMax} onChange={e => setConfig({ ...config, singleTripAiMax: parseFloat(e.target.value) })} className="w-full bg-surface border border-stroke rounded-xl px-4 py-3 font-bold text-text-high outline-none focus:border-accent" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-medium">Ativar Bucketlist?</label>
                                    <select value={config.singleTripBList ? "true" : "false"} onChange={e => setConfig({ ...config, singleTripBList: e.target.value === "true" })} className="w-full bg-surface border border-stroke rounded-xl px-4 py-3 font-bold text-text-high outline-none focus:border-accent appearance-none">
                                        <option value="true">Sim, Acesso Total</option>
                                        <option value="false">Não, Bloquear</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* MONTHLY */}
                        <div className="p-8 rounded-[2rem] bg-canvas border border-stroke flex flex-col md:flex-row gap-8">
                            <div className="md:w-1/3">
                                <h3 className="text-lg font-black uppercase tracking-widest text-text-high">Plano Mensal</h3>
                                <p className="text-xs font-medium text-text-medium mt-2">Subscrição recorrente para acesso moderado mensal com arquitetura AI completa.</p>
                            </div>
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-medium">Mensalidade (€)</label>
                                    <input type="number" step="0.01" value={config.monthlyPrice} onChange={e => setConfig({ ...config, monthlyPrice: parseFloat(e.target.value) })} className="w-full bg-surface border border-stroke rounded-xl px-4 py-3 font-bold text-text-high outline-none focus:border-accent" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-medium">Limite Gasto AI (€)</label>
                                    <input type="number" step="0.01" value={config.monthlyAiMax} onChange={e => setConfig({ ...config, monthlyAiMax: parseFloat(e.target.value) })} className="w-full bg-surface border border-stroke rounded-xl px-4 py-3 font-bold text-text-high outline-none focus:border-accent" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-medium">Ativar Bucketlist?</label>
                                    <select value={config.monthlyBList ? "true" : "false"} onChange={e => setConfig({ ...config, monthlyBList: e.target.value === "true" })} className="w-full bg-surface border border-stroke rounded-xl px-4 py-3 font-bold text-text-high outline-none focus:border-accent appearance-none">
                                        <option value="true">Sim, Acesso Total</option>
                                        <option value="false">Não, Bloquear</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* YEARLY */}
                        <div className="p-8 rounded-[2rem] bg-canvas border border-stroke flex flex-col md:flex-row gap-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none"><Activity size={64} className="text-emerald-500" /></div>
                            <div className="md:w-1/3">
                                <h3 className="text-lg font-black uppercase tracking-widest text-emerald-500">Plano Anual</h3>
                                <p className="text-xs font-medium text-text-medium mt-2">Plano de fidelização longa. Oferece o maior plafond de tolerância para APIs da plataforma.</p>
                            </div>
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-medium">Anuidade (€)</label>
                                    <input type="number" step="0.01" value={config.yearlyPrice} onChange={e => setConfig({ ...config, yearlyPrice: parseFloat(e.target.value) })} className="w-full bg-surface border border-stroke rounded-xl px-4 py-3 font-bold text-text-high outline-none focus:border-emerald-500" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-medium">Limite Gasto AI (€)</label>
                                    <input type="number" step="0.01" value={config.yearlyAiMax} onChange={e => setConfig({ ...config, yearlyAiMax: parseFloat(e.target.value) })} className="w-full bg-surface border border-stroke rounded-xl px-4 py-3 font-bold text-text-high outline-none focus:border-emerald-500" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-medium">Ativar Bucketlist?</label>
                                    <select value={config.yearlyBList ? "true" : "false"} onChange={e => setConfig({ ...config, yearlyBList: e.target.value === "true" })} className="w-full bg-surface border border-stroke rounded-xl px-4 py-3 font-bold text-text-high outline-none focus:border-emerald-500 appearance-none">
                                        <option value="true">Sim, Acesso Total</option>
                                        <option value="false">Não, Bloquear</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-stroke pt-8">
                            <p className="text-sm font-bold text-emerald-500">{configMessage}</p>
                            <button
                                type="submit"
                                disabled={isSavingConfig}
                                className="px-8 py-4 bg-text-high text-canvas font-black uppercase tracking-widest text-xs rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all outline-none"
                            >
                                {isSavingConfig ? "A Guardar..." : "Guardar Alterações Finais"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* TAB: TICKETS */}
            {activeTab === "tickets" && (
                <div className="bg-surface p-6 sm:p-10 rounded-[3rem] border border-stroke shadow-2xl mb-12 relative z-10">
                    <h2 className="text-2xl font-black font-outfit text-text-high uppercase tracking-tight mb-8">Support Tickets</h2>
                    <div className="grid grid-cols-1 gap-6">
                        {tickets.length > 0 ? tickets.map((ticket: any) => (
                            <div key={ticket.id} className={`p-6 bg-canvas rounded-[2rem] border ${ticket.status === 'OPEN' ? 'border-accent/50 shadow-lg' : 'border-stroke opacity-75'}`}>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                    <div>
                                        <h3 className="text-lg font-black text-text-high uppercase leading-none">{ticket.subject}</h3>
                                        <p className="text-xs font-bold text-text-medium mt-1 uppercase tracking-wider">{ticket.user.name || ticket.user.email} <span className="opacity-50">· {new Date(ticket.createdAt).toLocaleString()}</span></p>
                                    </div>
                                    <button 
                                        onClick={() => handleResolveTicket(ticket.id, ticket.status)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${ticket.status === 'RESOLVED' ? 'bg-stroke text-text-medium' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'}`}
                                    >
                                        <CheckCircle size={16} /> {ticket.status === 'RESOLVED' ? 'Reopen' : 'Mark Resolved'}
                                    </button>
                                </div>
                                <p className="text-sm text-text-high leading-relaxed px-4 py-3 bg-stroke/30 rounded-xl font-medium">{ticket.message}</p>
                            </div>
                        )) : (
                            <div className="text-center py-12 text-text-medium font-bold uppercase tracking-widest text-xs">
                                Todos os tickets estão resolvidos.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB: LOGS */}
            {activeTab === "logs" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10">
                    {/* Admin Logs */}
                    <div className="bg-surface p-10 rounded-[3rem] border border-stroke shadow-2xl h-[500px] flex flex-col">
                        <h2 className="text-2xl font-black font-outfit mb-8 text-text-high uppercase tracking-tight">System Logs</h2>
                        <div className="overflow-y-auto flex-grow space-y-4 pr-4 custom-scrollbar">
                            {initialLogs.length > 0 ? initialLogs.map((log: any) => (
                                <div key={log.id} className="p-6 bg-canvas rounded-[2rem] border border-stroke hover:border-accent/20 transition-all group">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[9px] font-black text-accent bg-accent/10 px-3 py-1 rounded-full uppercase tracking-widest border border-accent/10">
                                            {log.action}
                                        </span>
                                        <span className="text-[10px] font-medium text-text-medium opacity-50 uppercase tracking-tighter">
                                            {new Date(log.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-sm font-bold text-text-high mb-2 leading-relaxed">{log.details}</p>
                                    <p className="text-[10px] font-black text-text-medium uppercase tracking-[0.2em] group-hover:text-accent transition-colors">By: {log.user.name || log.user.email}</p>
                                </div>
                            )) : (
                                <div className="h-full flex items-center justify-center">
                                    <p className="text-text-medium text-[10px] font-black uppercase tracking-[0.3em]">No recent activity</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Coupons */}
                    <div className="bg-surface p-10 rounded-[3rem] border border-stroke shadow-2xl h-[500px] flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black font-outfit text-text-high uppercase tracking-tight">Active Codes</h2>
                            <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                        </div>
                        <div className="overflow-y-auto flex-grow space-y-4 pr-4 custom-scrollbar mb-8">
                            {initialCoupons.length > 0 ? initialCoupons.map((coupon: any) => (
                                <div key={coupon.id} className="p-6 bg-canvas rounded-[2rem] border border-stroke flex justify-between items-center group hover:bg-stroke transition-all">
                                    <div>
                                        <p className="text-lg font-black font-outfit text-accent tracking-widest uppercase">{coupon.code}</p>
                                        <p className="text-[9px] font-black text-text-medium uppercase tracking-[0.2em] mt-1">Tier: <span className="text-accent">{coupon.planGranted}</span></p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[12px] font-black text-text-high">{coupon.usesLeft} <span className="text-[10px] text-text-medium uppercase ml-1">left</span></p>
                                        <p className="text-[10px] font-medium text-text-medium opacity-50 mt-0.5">{coupon.expiresAt ? `Exp: ${new Date(coupon.expiresAt).toLocaleDateString()}` : '∞'}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="h-full flex items-center justify-center">
                                    <p className="text-text-medium text-[10px] font-black uppercase tracking-[0.3em]">No active coupons</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="pt-8 border-t border-stroke">
                            <Link href="/admin/coupons" className="w-full btn-primary py-5 text-[11px] !bg-text-high !text-canvas border-none text-center">
                                Generate New Promo
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
