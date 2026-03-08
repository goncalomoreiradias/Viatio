import { getSession } from "@/lib/auth";
import DashboardClient from "./DashboardClient";
import LandingPage from "./LandingPage";

export default async function DashboardPage() {
    const session = await getSession();

    if (!session) {
        return <LandingPage />;
    }

    return <DashboardClient session={session} />;
}
