"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";

export default function JoinTripPage() {
    const params = useParams();
    const router = useRouter();
    const { t, language } = useI18n();
    const token = params.token as string;

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");
    const [tripId, setTripId] = useState<string | null>(null);

    const isPT = language === "pt";

    useEffect(() => {
        if (!token) return;

        const joinTrip = async () => {
            try {
                const res = await fetch("/api/trips/join", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token }),
                });

                const data = await res.json();

                if (res.ok) {
                    setStatus("success");
                    setTripId(data.tripId);
                    setMessage(data.message || (isPT ? "Juntou-se à viagem com sucesso!" : "Successfully joined the trip!"));

                    // Auto-redirect to the trip after 3 seconds
                    setTimeout(() => {
                        router.push(`/trips/${data.tripId}`);
                    }, 3000);
                } else if (res.status === 401) {
                    // Not logged in. Redirect to login with callback
                    router.push(`/login?callbackUrl=/trips/join/${token}`);
                } else {
                    setStatus("error");
                    setMessage(data.error || (isPT ? "Link de convite inválido." : "Invalid invite link."));
                }
            } catch (err) {
                setStatus("error");
                setMessage(isPT ? "Ocorreu um erro ao processar o convite." : "An error occurred while processing the invite.");
            }
        };

        joinTrip();
    }, [token, router, isPT]);

    return (
        <div className="min-h-screen bg-brand-bg relative flex flex-col items-center justify-center p-4">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-secondary/20 rounded-full blur-[100px] pointer-events-none translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-primary/20 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 translate-y-1/2" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md glass-card p-10 text-center sm:rounded-[2.5rem] shadow-2xl relative z-10"
            >
                {status === "loading" && (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-16 h-16 text-brand-primary animate-spin mb-6" />
                        <h1 className="text-2xl font-bold text-brand-dark dark:text-white mb-2 font-outfit">
                            {isPT ? "A validar convite..." : "Validating invite..."}
                        </h1>
                        <p className="text-gray-500">
                            {isPT ? "Por favor aguarde enquanto preparamos a sua viagem." : "Please wait while we prepare your trip."}
                        </p>
                    </div>
                )}

                {status === "success" && (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                        <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
                        <h1 className="text-2xl font-bold text-brand-dark dark:text-white mb-2 font-outfit">
                            {isPT ? "Bem-vindo a bordo!" : "Welcome aboard!"}
                        </h1>
                        <p className="text-gray-500 mb-8">{message}</p>
                        <p className="text-sm font-bold text-brand-primary animate-pulse">
                            {isPT ? "A redirecionar para a viagem..." : "Redirecting to trip..."}
                        </p>
                        {tripId && (
                            <Link href={`/trips/${tripId}`} className="mt-6 inline-block py-3 px-6 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-secondary transition">
                                {isPT ? "Ir Agora" : "Go Now"}
                            </Link>
                        )}
                    </motion.div>
                )}

                {status === "error" && (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                        <XCircle className="w-20 h-20 text-rose-500 mx-auto mb-6" />
                        <h1 className="text-2xl font-bold text-brand-dark dark:text-white mb-2 font-outfit">
                            {isPT ? "Convite Inválido" : "Invalid Invite"}
                        </h1>
                        <p className="text-gray-500 mb-8">{message}</p>
                        <Link href="/" className="py-3 px-6 bg-brand-dark dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:bg-black dark:hover:bg-gray-200 transition">
                            {isPT ? "Voltar ao Início" : "Return to Home"}
                        </Link>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
