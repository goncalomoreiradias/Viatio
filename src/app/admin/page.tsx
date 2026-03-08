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
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, role: true, plan: true, createdAt: true }
    });

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
        <div className="min-h-screen bg-brand-bg p-4 md:p-8">
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 bg-white dark:bg-gray-800 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                        <ArrowLeft size={20} className="text-brand-dark dark:text-white" />
                    </Link>
                    <h1 className="text-3xl font-extrabold font-outfit text-brand-dark dark:text-white">
                        Admin Dashboard
                    </h1>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass-card p-6 rounded-3xl">
                    <div className="flex items-center gap-3 mb-2">
                        <Users size={20} className="text-brand-primary" />
                        <h3 className="font-semibold text-gray-500">Total Users</h3>
                    </div>
                    <p className="text-4xl font-extrabold text-brand-dark dark:text-white">{userCount}</p>
                </div>

                <div className="glass-card p-6 rounded-3xl">
                    <div className="flex items-center gap-3 mb-2">
                        <Activity size={20} className="text-brand-secondary" />
                        <h3 className="font-semibold text-gray-500">Total Trips</h3>
                    </div>
                    <p className="text-4xl font-extrabold text-brand-dark dark:text-white">{tripCount}</p>
                </div>

                <div className="glass-card p-6 rounded-3xl">
                    <div className="flex items-center gap-3 mb-2">
                        <Activity size={20} className="text-bali-terra" />
                        <h3 className="font-semibold text-gray-500">Total Expenses</h3>
                    </div>
                    <p className="text-4xl font-extrabold text-brand-dark dark:text-white">{expenseCount}</p>
                </div>
            </div>

            <div className="glass-card p-6 rounded-3xl">
                <h2 className="text-xl font-bold font-outfit mb-4 text-brand-dark dark:text-white">Recent Users</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-800">
                                <th className="py-3 px-4 text-sm font-semibold text-gray-500">Name</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-500">Email</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-500">Plan</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-500">Role</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-500">Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentUsers.map(user => (
                                <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="py-3 px-4 font-medium text-brand-dark dark:text-white">{user.name || "N/A"}</td>
                                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{user.email}</td>
                                    <td className="py-3 px-4 font-bold text-brand-primary">{user.plan}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${user.role === 'ADMIN' ? 'bg-brand-secondary/20 text-brand-secondary' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-gray-500 text-sm">{user.createdAt.toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Admin Logs */}
                <div className="glass-card p-6 rounded-3xl h-96 flex flex-col">
                    <h2 className="text-xl font-bold font-outfit mb-4 text-brand-dark dark:text-white">System Logs</h2>
                    <div className="overflow-y-auto flex-grow space-y-3 pr-2">
                        {recentLogs.length > 0 ? recentLogs.map(log => (
                            <div key={log.id} className="p-3 bg-white/50 dark:bg-black/20 rounded-xl border border-gray-100 dark:border-gray-800">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full">
                                        {log.action}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {log.createdAt.toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-brand-dark dark:text-white">{log.details}</p>
                                <p className="text-xs text-gray-500 mt-1">Admin: {log.user.name || log.user.email}</p>
                            </div>
                        )) : (
                            <p className="text-gray-500 text-sm text-center py-4">No recent logs found.</p>
                        )}
                    </div>
                </div>

                {/* Coupons */}
                <div className="glass-card p-6 rounded-3xl h-96 flex flex-col">
                    <h2 className="text-xl font-bold font-outfit mb-4 text-brand-dark dark:text-white">Active Promo Codes</h2>
                    <div className="overflow-y-auto flex-grow space-y-3 pr-2 mb-4">
                        {activeCoupons.length > 0 ? activeCoupons.map(coupon => (
                            <div key={coupon.id} className="p-3 bg-white/50 dark:bg-black/20 rounded-xl border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                <div>
                                    <p className="font-bold font-mono text-brand-secondary">{coupon.code}</p>
                                    <p className="text-xs text-brand-dark dark:text-gray-300">Unlocks: <strong>{coupon.planGranted}</strong></p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-gray-600 dark:text-gray-400">{coupon.usesLeft} uses left</p>
                                    <p className="text-xs text-gray-500">{coupon.expiresAt ? `Exp: ${coupon.expiresAt.toLocaleDateString()}` : 'No Expiry'}</p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-gray-500 text-sm text-center py-4">No active promo codes.</p>
                        )}
                    </div>
                    {/* The Generator form could be broken out into a client component. Let's just link to a hypothetical generator route or render a client component wrapper */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                        <Link href="/admin/coupons" className="w-full py-3 bg-brand-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-brand-secondary transition">
                            Generate New Coupon
                        </Link>
                    </div>
                </div>
            </div>

        </div>
    );
}
