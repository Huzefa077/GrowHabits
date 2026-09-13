"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";

import { usePageLoader } from "@/components/common/PageLoader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ROUTE: /forgot-password — asks for an email before the server sends a reset link.
export default function ForgotPasswordPage() {
    const { startLoading, stopLoading } = usePageLoader();
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setMessage("");
        setError("");
        setIsSubmitting(true);
        startLoading();

        try {
            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Unable to send a reset link.");
                return;
            }

            setMessage(data.message);
        } catch {
            setError("Unable to reach the server. Please try again.");
        } finally {
            setIsSubmitting(false);
            stopLoading();
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
            <section className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
                {message ? (
                    <div className="text-center">
                        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Mail className="size-6" />
                        </div>

                        <h1 className="mt-5 text-3xl font-bold">Check your inbox</h1>

                        <p className="mt-3 text-gray-600">
                            If an account exists for <span className="font-medium text-foreground">{email}</span>,
                            you&apos;ll receive a password-reset link shortly.
                        </p>

                        <p className="mt-3 text-sm text-gray-500">
                            The link expires in 15 minutes. Check your spam folder if it does not arrive.
                        </p>

                        <p className="mt-4 text-sm text-gray-500">
                            Created your account with Google? Google manages that password. Use{" "}
                            {/* This API route redirects the whole browser to Google's sign-in page. */}
                            <a className="password-help-link hover:underline" href="/api/auth/google">
                                Continue with Google
                            </a>
                            {" "}instead.
                        </p>

                        <Button className="mt-7 w-full" render={<Link href="/login" />} nativeButton={false}>
                            Back to sign in
                        </Button>

                        <button
                            className="mt-4 text-sm password-help-link hover:underline"
                            onClick={() => setMessage("")}
                            type="button"
                        >
                            Use a different email
                        </button>
                    </div>
                ) : (
                    <>
                        <h1 className="text-center text-3xl font-bold">Reset your password</h1>
                        <p className="mt-2 text-center text-gray-500">
                            Enter the email address linked to the account whose password you forgot. We&apos;ll send a reset link to that address.
                        </p>

                        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                            <div>
                                <label className="font-medium" htmlFor="reset-email">Email</label>
                                <Input
                                    id="reset-email"
                                    required
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                />
                            </div>

                            {error && <p className="text-sm text-red-600">{error}</p>}

                            <Button className="w-full" disabled={isSubmitting} type="submit">
                                {isSubmitting ? "Sending reset link..." : "Send reset link"}
                            </Button>
                        </form>

                        <p className="mt-6 text-center text-sm text-gray-600">
                            Signed up with Google? Use{" "}
                            <Link className="password-help-link hover:underline" href="/login">
                                Continue with Google
                            </Link>
                            .
                        </p>
                    </>
                )}
            </section>
        </main>
    );
}
