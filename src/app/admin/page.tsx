import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { ArrowLeft, Users, Activity, LogOut } from "lucide-react";
import Link from "next/link";
import AdminClient from "./AdminClient";

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

    // Fetch all users
    const recentUsers = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: { 
            id: true, 
            name: true, 
            email: true, 
            role: true, 
            plan: true,
            isBanned: true,
            createdAt: true,
            _count: { select: { ownedTrips: true } },
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
    const usersWithSpendAndCount = recentUsers.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
        isBanned: user.isBanned,
        createdAt: user.createdAt,
        tripCount: user._count.ownedTrips,
        totalAiSpend: user.aiUsages.reduce((sum: number, usage: any) => sum + usage.estimatedCost, 0)
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

    // Tickets
    const tickets = await prisma.supportTicket.findMany({
        include: { user: { select: { name: true, email: true, plan: true } } },
        orderBy: { createdAt: "desc" }
    });

    return (
        <AdminClient 
            initialUsers={usersWithSpendAndCount}
            initialLogs={recentLogs}
            initialCoupons={activeCoupons}
            initialTickets={tickets}
            stats={{ userCount, tripCount, expenseCount, totalAiCost, totalAiRequests }}
        />
    );
}
