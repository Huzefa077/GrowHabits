"use client";

import { FormEvent, useState } from "react";

import { usePageLoader } from "@/components/common/PageLoader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ROUTE: /feedback — lets visitors send product ideas, feedback, or problem reports.
export default function FeedbackPage() {
    const { startLoading, stopLoading } = usePageLoader();
    const [category, setCategory] = useState("idea");
    const [message, setMessage] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setResult("");
        setIsSubmitting(true);
        startLoading();

        try {
            const response = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ category, message, contactEmail }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Unable to send feedback.");
                return;
            }

            setResult(data.message);
            setMessage("");
            setContactEmail("");
        } catch {
            setError("Unable to reach the server. Please try again.");
        } finally {
            setIsSubmitting(false);
            stopLoading();
        }
    }

    return (
        <main className="min-h-screen bg-gray-100 px-4 py-12">
            <section className="mx-auto w-full max-w-xl rounded-xl bg-white p-8 shadow-lg">
                <p className="text-sm font-semibold text-primary">
                    Help improve GrowHabits
                </p>

                <h1 className="mt-2 text-3xl font-bold">
                    Share your feedback
                </h1>

                <p className="mt-3 text-gray-600">
                    Tell us what would make planning routines easier for your family.
                </p>

                <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label className="font-medium" htmlFor="feedback-category">
                            What would you like to share?
                        </label>

                        <select
                            id="feedback-category"
                            className="mt-2 h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm text-gray-950 outline-none focus:border-ring focus:ring-3 focus:ring-ring/50 dark:bg-input/30 dark:text-foreground"
                            value={category}
                            onChange={(event) => setCategory(event.target.value)}
                        >
                            {/* The browser's native option panel is light, even in dark mode. */}
                            <option className="bg-white text-gray-950" value="idea">Feature idea</option>
                            <option className="bg-white text-gray-950" value="feedback">Feedback or recommendation</option>
                            <option className="bg-white text-gray-950" value="problem">Report a problem</option>
                        </select>
                    </div>

                    <div>
                        <label className="font-medium" htmlFor="feedback-message">
                            Your message
                        </label>

                        <textarea
                            id="feedback-message"
                            className="mt-2 min-h-36 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/50 dark:bg-input/30"
                            maxLength={1200}
                            placeholder="For example: I would find weekly reminders helpful because..."
                            required
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                        />
                    </div>

                    <div>
                        <label className="font-medium" htmlFor="feedback-email">
                            Email for a reply <span className="text-gray-500">(optional)</span>
                        </label>

                        <Input
                            id="feedback-email"
                            type="email"
                            placeholder="you@example.com"
                            value={contactEmail}
                            onChange={(event) => setContactEmail(event.target.value)}
                        />
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}
                    {result && <p className="text-sm text-green-600">{result}</p>}

                    <Button className="w-full" disabled={isSubmitting} type="submit">
                        {isSubmitting ? "Sending feedback..." : "Send feedback"}
                    </Button>
                </form>
            </section>
        </main>
    );
}
