import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { ArrowLeft, Users, Activity, LogOut } from "lucide-react";
import Link from "next/link";

const prisma = new PrismaClient();

export default async function AdminPage() {
    const session = await getSession();

    if (!session || session.role !== "ADMIN") {
        redirect("/");
    }

    // Fetch some metrics for the admin dashboard
    const userCount = await prisma.user.count();
    const tripCount = await prisma.trip.count();
    const expenseCount = await prisma.expense.count();

    // Fetch recent users
    const recentUsers = await prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: { 
            id: true, 
            name: true, 
            email: true, 
            role: true, 
            plan: true, 
            createdAt: true,
            aiUsages: {
                select: { estimatedCost: true }
            }
        }
    });

    const totalAiUsage = await prisma.aiUsage.aggregate({
        _sum: { estimatedCost: true },
        _count: { id: true }
    });

    const totalAiCost = totalAiUsage._sum.estimatedCost || 0;
    const totalAiRequests = totalAiUsage._count.id || 0;

    // Enhance users with total spend
    const usersWithSpend = recentUsers.map(user => ({
        ...user,
        totalAiSpend: user.aiUsages.reduce((sum, usage) => sum + usage.estimatedCost, 0)
    }));

    // Fetch Admin Logs
    const recentLogs = await prisma.adminLog.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } }
    });

    // Fetch Active Coupons
    const activeCoupons = await prisma.coupon.findMany({
        where: { usesLeft: { gt: 0 } },
        orderBy: { createdAt: "desc" }
    });

    return (
        <div className="min-h-screen bg-canvas text-text-high p-6 md:p-12 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full" />
                <div className="absolute top-1/2 right-[-5%] w-[30%] h-[30%] bg-accent/5 blur-[120px] rounded-full" />
            </div>

            <header className="flex items-center justify-between mb-16 relative z-10">
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
                        <p className="text-6xl font-black font-outfit text-text-high tracking-tighter">{userCount}</p>
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
                    <p className="text-6xl font-black font-outfit text-text-high tracking-tighter">{tripCount}</p>
                </div>

                <div className="bg-surface p-10 rounded-[3rem] border border-stroke shadow-2xl group hover:border-accent/30 transition-all">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-accent/10 rounded-2xl">
                            <Activity size={24} className="text-accent" />
                        </div>
                        <h3 className="text-[10px] font-black text-text-medium uppercase tracking-[0.3em]">AI Spend (Total)</h3>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="text-6xl font-black font-outfit text-text-high tracking-tighter">€{totalAiCost.toFixed(3)}</p>
                        <span className="text-[10px] font-black text-text-medium uppercase tracking-widest">{totalAiRequests} Req</span>
                    </div>
                </div>
            </div>

            <div className="bg-surface p-10 rounded-[3rem] border border-stroke shadow-2xl mb-12 relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black font-outfit text-text-high uppercase tracking-tight">Recent Users</h2>
                    <div className="px-4 py-2 bg-canvas border border-stroke rounded-full text-[10px] font-black text-text-medium uppercase tracking-[0.2em]">Live View</div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-y-3">
                        <thead>
                            <tr>
                                <th className="pb-4 px-6 text-[10px] font-black text-text-medium uppercase tracking-[0.3em]">User</th>
                                <th className="pb-4 px-6 text-[10px] font-black text-text-medium uppercase tracking-[0.3em]">Plan</th>
                                <th className="pb-4 px-6 text-[10px] font-black text-text-medium uppercase tracking-[0.3em]">AI Cost</th>
                                <th className="pb-4 px-6 text-[10px] font-black text-text-medium uppercase tracking-[0.3em]">Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usersWithSpend.map(user => (
                                <tr key={user.id} className="group cursor-default">
                                    <td className="py-5 px-6 bg-canvas first:rounded-l-[1.5rem] border-y border-stroke border-l group-hover:bg-stroke transition-all">
                                        <div className="flex flex-col">
                                            <span className="font-black text-text-high tracking-tight">{user.name || "Anonymous"}</span>
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
                                        <span className="text-sm font-black text-accent tracking-tighter">€{user.totalAiSpend.toFixed(3)}</span>
                                    </td>
                                    <td className="py-5 px-6 bg-canvas last:rounded-r-[1.5rem] border-y border-stroke border-r group-hover:bg-stroke transition-all">
                                        <span className="text-xs font-bold text-text-medium opacity-50">{user.createdAt.toLocaleDateString()}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10">
                {/* Admin Logs */}
                <div className="bg-surface p-10 rounded-[3rem] border border-stroke shadow-2xl h-[500px] flex flex-col">
                    <h2 className="text-2xl font-black font-outfit mb-8 text-text-high uppercase tracking-tight">System Logs</h2>
                    <div className="overflow-y-auto flex-grow space-y-4 pr-4 custom-scrollbar">
                        {recentLogs.length > 0 ? recentLogs.map(log => (
                            <div key={log.id} className="p-6 bg-canvas rounded-[2rem] border border-stroke hover:border-accent/20 transition-all group">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[9px] font-black text-accent bg-accent/10 px-3 py-1 rounded-full uppercase tracking-widest border border-accent/10">
                                        {log.action}
                                    </span>
                                    <span className="text-[10px] font-medium text-text-medium opacity-50 uppercase tracking-tighter">
                                        {log.createdAt.toLocaleString([], { hour: '2-digit', minute: '2-digit' })}
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
                        {activeCoupons.length > 0 ? activeCoupons.map(coupon => (
                            <div key={coupon.id} className="p-6 bg-canvas rounded-[2rem] border border-stroke flex justify-between items-center group hover:bg-stroke transition-all">
                                <div>
                                    <p className="text-lg font-black font-outfit text-accent tracking-widest uppercase">{coupon.code}</p>
                                    <p className="text-[9px] font-black text-text-medium uppercase tracking-[0.2em] mt-1">Tier: <span className="text-accent">{coupon.planGranted}</span></p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[12px] font-black text-text-high">{coupon.usesLeft} <span className="text-[10px] text-text-medium uppercase ml-1">left</span></p>
                                    <p className="text-[10px] font-medium text-text-medium opacity-50 mt-0.5">{coupon.expiresAt ? `Exp: ${coupon.expiresAt.toLocaleDateString()}` : '∞'}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="h-full flex items-center justify-center">
                                <p className="text-text-medium text-[10px] font-black uppercase tracking-[0.3em]">No active coupons</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="pt-8 border-t border-stroke">
                        <Link href="/admin/coupons" className="w-full btn-primary py-5 text-[11px] !bg-text-high !text-canvas border-none">
                            Generate New Promo
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
