"use client";

// ROUTE: /register — browser-side form that creates a new parent account through the register API.
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import GoogleIcon from "@/components/common/GoogleIcon";
import { usePageLoader } from "@/components/common/PageLoader";

export default function RegisterPage() {
    const { startLoading, stopLoading } = usePageLoader();
    // Store the values entered by the parent.
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    // true means show the typed password; false keeps it hidden.
    const [showPassword, setShowPassword] = useState(false);

    // Used to disable the button while the request is running.
    const [isLoading, setIsLoading] = useState(false);

    // Stores an error message returned by the API.
    const [error, setError] = useState("");

    // Stores the successful registration message.
    const [success, setSuccess] = useState("");

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        // Clear messages from the previous request.
        setError("");
        setSuccess("");

        setIsLoading(true);
        startLoading();

        try {
            /*
            Send the form data to our backend.

            POST /api/auth/register
            */
            const response = await fetch(
                "/api/auth/register",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        fullName,
                        email,
                        password,
                    }),
                }
            );

            // Convert the backend response into JavaScript.
            const data = await response.json();

            /*
            The backend returns success: true/false.

            If the HTTP request itself failed, show the
            message returned by the API.
            */
            if (!response.ok) {
                setError(
                    data.message ||
                        "Registration failed."
                );

                return;
            }

            /*
            Registration succeeded.

            We don't need to store a token here because
            registration currently only creates the account.

            Login will create the authentication cookie.
            */
            setSuccess(
                data.message ||
                "Account created. Check your inbox to verify your email before signing in."
            );

            // Clear the form after successful registration.
            setFullName("");
            setEmail("");
            setPassword("");

        } catch (error) {

            /*
            This catches errors such as a network failure
            where the request could not reach the server.
            */
            console.error(
                "Registration request failed:",
                error
            );

            setError(
                "Unable to connect to the server."
            );

        } finally {
            // Re-enable the button.
            setIsLoading(false);
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
                    Create Account
                </h1>

                <p className="text-center text-gray-500 mt-2">
                    Start building your child&apos;s habits with GrowHabits
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

                    {/* Parent name */}
                    <div>
                        <label className="font-medium">
                            Parent Name
                        </label>

                        <Input
                            type="text"
                            placeholder="Enter your name"
                            value={fullName}
                            onChange={(event) =>
                                setFullName(
                                    event.target.value
                                )
                            }
                        />
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
                                setEmail(
                                    event.target.value
                                )
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

                            {/* type="button" prevents this toggle from submitting the registration form. */}
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

                    {/* Error message */}
                    {error && (
                        <p className="text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    {/* Success message */}
                    {success && (
                        <p className="text-sm text-green-600">
                            {success}
                        </p>
                    )}

                    {/* Submit */}
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading
                            ? "Creating account..."
                            : "Sign up"}
                    </Button>

                </form>

                <p className="text-center text-sm mt-6">
                    Already have an account?{" "}

                    <Link
                        href="/login"
                        className="text-blue-600 hover:underline"
                    >
                        Sign in
                    </Link>
                </p>

            </div>

        </main>
    );
}
