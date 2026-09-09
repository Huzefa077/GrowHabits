// ROUTE: /about — explains the product's purpose, current scope, and how to use it.
import Link from "next/link";
import { Globe2, Mail, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { developerProfile } from "@/config/developerProfile";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10 sm:px-8 sm:py-12">
      <article className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          About GrowHabits
        </p>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
          Small daily actions can build lasting routines.
        </h1>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">Why this project exists</h2>
          <p className="mt-3 leading-7 text-gray-600">
            Parents often have good intentions for their children&apos;s learning,
            character, and daily habits, but turning those intentions into a
            routine that a child can follow every day is difficult. GrowHabits
            was created to turn those ideas into one clear, printable
            monthly planner.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">What it helps you do</h2>
          <p className="mt-3 leading-7 text-gray-600">
            Create a balanced routine from focus areas such as learning, good
            deeds, movement, prayer, family time, and your own custom
            activities. The finished planner gives children a simple daily
            checklist and gives parents one place to review the routine.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">When to use it</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 leading-7 text-gray-600">
            <li>When starting a new daily routine at home.</li>
            <li>During school holidays, Ramadan, or a fresh start.</li>
            <li>When a child needs clear, repeatable goals to follow.</li>
            <li>When you want a printable way to track small daily actions.</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">How to use it</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7 text-gray-600">
            <li>Start a planner and choose an age group.</li>
            <li>Choose up to four focus areas for the routine.</li>
            <li>Add the activities your child should practise.</li>
            <li>Preview, print, and save the planner when you are ready.</li>
          </ol>
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-gray-200 p-5">
            <h2 className="text-xl font-semibold">Use it as a guest</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Guests can create, preview, and print planners without an
              account. Guest planners stay only in the current browser session.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-5">
            <h2 className="text-xl font-semibold">Save your work</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Create an account or sign in with Google to save planners, edit
              them later, and revisit them from your dashboard.
            </p>
          </div>
        </section>

        <section className="mt-10 rounded-lg border border-dashed border-primary/40 bg-secondary/30 p-5">
          <h2 className="text-xl font-semibold">Current scope</h2>
          <p className="mt-2 leading-7 text-gray-600">
            Age groups are collected when creating a planner, but they do not
            yet change the planner layout or suggestions. Tailored activities
            and age-based layouts are planned improvements.
          </p>
          <Link className="mt-3 inline-block font-medium text-primary underline underline-offset-4" href="/updates">
            View project updates
          </Link>
        </section>

        <section className="mt-10 border-t border-gray-200 pt-8">
          <h2 className="text-2xl font-semibold">Help improve the project</h2>
          <p className="mt-3 leading-7 text-gray-600">
            Have an idea, recommendation, or problem to report? Your feedback
            helps decide what should be improved next.
          </p>
          <Button
            className="mt-5"
            render={<Link href="/feedback" />}
            nativeButton={false}
            variant="outline"
          >
            Send feedback
          </Button>
        </section>

        <section className="mt-10 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-500">
            About the developer
          </p>
          <h2 className="mt-3 text-2xl font-bold text-zinc-900 dark:text-white">
            Huzaifa Sheikh
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Full Stack Developer and creator of GrowHabits. I build practical web products that turn everyday needs into simple, useful experiences.
          </p>

          <div className="my-7 h-px bg-zinc-200 dark:bg-zinc-800" />

          <div aria-label="Creator contact links" className="grid gap-3 sm:grid-cols-2">
            <a
              className="flex min-w-0 items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-3 text-sm font-medium text-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:border-zinc-700/60 dark:bg-zinc-800/60 dark:text-zinc-200"
              href={`mailto:${developerProfile.email}`}
            >
              <Mail aria-hidden="true" className="size-5 shrink-0 text-zinc-500 dark:text-zinc-400" />
              <span className="truncate">{developerProfile.email}</span>
            </a>

            {developerProfile.phoneNumbers.map((phoneNumber) => (
              <a
                className="flex min-w-0 items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-3 text-sm font-medium text-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:border-zinc-700/60 dark:bg-zinc-800/60 dark:text-zinc-200"
                href={`tel:${phoneNumber}`}
                key={phoneNumber}
              >
                <Phone aria-hidden="true" className="size-5 shrink-0 text-zinc-500 dark:text-zinc-400" />
                <span>{phoneNumber}</span>
              </a>
            ))}

            <a
              className="flex min-w-0 items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-3 text-sm font-medium text-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:border-zinc-700/60 dark:bg-zinc-800/60 dark:text-zinc-200"
              href={developerProfile.portfolioUrl}
              rel="noreferrer"
              target="_blank"
            >
              <Globe2 aria-hidden="true" className="size-5 shrink-0 text-zinc-500 dark:text-zinc-400" />
              <span>Portfolio</span>
            </a>
          </div>
        </section>
      </article>
    </main>
  );
}
