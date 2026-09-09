"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";

import { usePageLoader } from "@/components/common/PageLoader";
import { Button } from "@/components/ui/button";

// This form uses the one-time token that arrived in the verification email.
export default function VerifyEmailForm({ token }: { token: string }) {
    const { startLoading, stopLoading } = usePageLoader();
    const [isVerifying, setIsVerifying] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    async function verifyEmail() {
        setError("");
        setIsVerifying(true);
        startLoading();

        try {
            const response = await fetch("/api/auth/verify-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
            });
            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Unable to verify your email.");
                return;
            }

            setMessage(data.message);
        } catch {
            setError("Unable to reach the server. Please try again.");
        } finally {
            setIsVerifying(false);
            stopLoading();
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
            <section className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-lg">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <MailCheck className="size-6" />
                </div>

                <h1 className="mt-5 text-3xl font-bold">
                    {message ? "Email verified" : "Verify your email"}
                </h1>

                {message ? (
                    <>
                        <p className="mt-3 text-green-600">{message}</p>
                        <Button className="mt-7 w-full" render={<Link href="/login" />} nativeButton={false}>
                            Sign in
                        </Button>
                    </>
                ) : !token ? (
                    <>
                        <p className="mt-3 text-gray-600">This verification link is incomplete. Open the full link from your email.</p>
                        <Button className="mt-7" render={<Link href="/register" />} nativeButton={false}>
                            Back to sign up
                        </Button>
                    </>
                ) : (
                    <>
                        <p className="mt-3 text-gray-600">Confirm that you want to verify this email address for GrowHabits.</p>
                        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
                        <Button className="mt-7 w-full" disabled={isVerifying} onClick={verifyEmail}>
                            {isVerifying ? "Verifying email..." : "Verify email"}
                        </Button>
                    </>
                )}
            </section>
        </main>
    );
}
