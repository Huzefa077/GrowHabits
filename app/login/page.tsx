"use client";

// ROUTE: /login — browser-side form that sends a parent's credentials to the login API.
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GoogleIcon from "@/components/common/GoogleIcon";
import { usePageLoader } from "@/components/common/PageLoader";

export default function LoginPage() {
    const router = useRouter();
    const { startLoading, stopLoading } = usePageLoader();

    // Store the values entered by the user.
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    // true means show the typed password; false keeps it hidden.
    const [showPassword, setShowPassword] = useState(false);

    // Used while the login request is running.
    const [isLoading, setIsLoading] = useState(false);

    // Stores an error returned by the backend.
    const [error, setError] = useState("");
    // Controls the resend option only for a pending password account.
    const [needsEmailVerification, setNeedsEmailVerification] = useState(false);
    const [isResendingVerification, setIsResendingVerification] = useState(false);
    const [verificationMessage, setVerificationMessage] = useState("");

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        // Clear any previous error.
        setError("");
        setNeedsEmailVerification(false);
        setVerificationMessage("");

        setIsLoading(true);
        startLoading();

        try {
            /*
            Send the login data to our backend.

            POST /api/auth/login
            */
            const response = await fetch(
                "/api/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        email,
                        password,
                    }),
                }
            );

            // Read the JSON response from the API.
            const data = await response.json();

            /*
            If login failed, display the message returned
            by the backend.
            */
            if (!response.ok) {
                stopLoading();
                setError(
                    data.message ||
                        "Login failed."
                );
                setNeedsEmailVerification(Boolean(data.needsEmailVerification));

                return;
            }

            /*
            Login succeeded.

            The backend has already stored the JWT in the
            HTTP-only auth_token cookie.

            We don't manually store the token in React,
            localStorage, or sessionStorage.
            */

            // Send the authenticated user to the dashboard.
            router.push("/dashboard");

            // Refresh the route so server-side code can
            // immediately see the new authentication cookie.
            router.refresh();

        } catch (error) {
            stopLoading();

            /*
            This catches network errors where the browser
            could not reach the API at all.
            */
            console.error(
                "Login request failed:",
                error
            );

            setError(
                "Unable to connect to the server."
            );

        } finally {
            setIsLoading(false);
        }
    }

    // Send a fresh verification link after the sign-in API identified a pending account.
    async function handleResendVerification() {
        setVerificationMessage("");
        setIsResendingVerification(true);
        startLoading();

        try {
            const response = await fetch("/api/auth/resend-verification", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Unable to resend the verification email.");
                return;
            }

            setVerificationMessage(data.message);
        } catch (requestError) {
            console.error("Resend-verification request failed:", requestError);
            setError("Unable to connect to the server.");
        } finally {
            setIsResendingVerification(false);
            stopLoading();
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-100">

            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">

                <Link
                    className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    href="/"
                >
                    <ArrowLeft aria-hidden="true" className="size-4" />
                    Back to home
                </Link>

                <h1 className="text-3xl font-bold text-center">
                    Sign in
                </h1>

                <p className="text-center text-gray-500 mt-2">
                    Welcome back!
                </p>

                <form
                    className="mt-8 space-y-5"
                    onSubmit={handleSubmit}
                >

                    {/* Both sign-in and sign-up use the same Google account flow. */}
                    <Button
                        className="w-full"
                        nativeButton={false}
                        // Google OAuth must use a full browser redirect, not Next.js client navigation.
                        render={<a href="/api/auth/google" />}
                        type="button"
                        variant="outline"
                    >
                        <span className="flex items-center gap-2">
                            <GoogleIcon />
                            Continue with Google
                        </span>
                    </Button>

                    <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="h-px flex-1 bg-border" />
                        <span>or use email</span>
                        <span className="h-px flex-1 bg-border" />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="font-medium">
                            Email
                        </label>

                        <Input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(event) =>
                                {
                                    setEmail(event.target.value);
                                    setNeedsEmailVerification(false);
                                    setVerificationMessage("");
                                }
                            }
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="font-medium">
                            Password
                        </label>

                        <div className="relative mt-2">
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                className="pr-16"
                                value={password}
                                onChange={(event) =>
                                    setPassword(
                                        event.target.value
                                    )
                                }
                            />

                            {/* type="button" prevents this toggle from submitting the sign-in form. */}
                            <button
                                type="button"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <Eye className="size-4" />
                                ) : (
                                    <EyeOff className="size-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    <p className="text-right text-sm">
                        <Link
                            href="/forgot-password"
                            className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                            Forgot password?
                        </Link>
                    </p>

                    {/* Error message */}
                    {error && (
                        <p className="text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    {needsEmailVerification && (
                        <div className="space-y-2 text-sm">
                            <p className="text-gray-600">
                                Didn&apos;t receive the verification email?
                            </p>

                            <button
                                className="text-blue-600 hover:underline dark:text-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
                                disabled={isResendingVerification}
                                onClick={handleResendVerification}
                                type="button"
                            >
                                {isResendingVerification
                                    ? "Sending verification email..."
                                    : "Resend verification email"}
                            </button>

                            {verificationMessage && (
                                <p className="text-green-600">
                                    {verificationMessage}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Submit */}
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading
                            ? "Signing in..."
                            : "Sign in"}
                    </Button>

                </form>

                <p className="text-center text-sm mt-6">
                    Don&apos;t have an account?{" "}

                    <Link
                        href="/register"
                        className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                        Sign up
                    </Link>
                </p>

            </div>

        </main>
    );
}
