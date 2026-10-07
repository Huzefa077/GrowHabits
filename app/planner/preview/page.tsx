"use client";

// ROUTE: /planner/preview — final wizard step; previews, prints, creates, or updates a planner.
import { useContext, useMemo, useState } from "react";
import { PlannerContext } from "@/context/PlannerContext";
import { Button } from "@/components/ui/button";
import { DeletePlannerButton } from "@/components/planner/DeletePlannerButton";
import { Input } from "@/components/ui/input";
import { usePageLoader } from "@/components/common/PageLoader";
import Link from "next/link";
import { useRouter } from "next/navigation";

const MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

// Keep activity names readable without taking too much room from the 31 day columns.
const ACTIVITY_COLUMN_MIN_WIDTH = 25;
const ACTIVITY_COLUMN_MAX_WIDTH = 50;

function getDaysInMonth(monthIndex: number) {
    return new Date(
        2024,
        monthIndex + 1,
        0
    ).getDate();
}

function BlankLine({
    minWidth = "4rem",
}: {
    minWidth?: string;
}) {
    return (
        <span
            className="inline-block"
            style={{ minWidth }}
        >
            &nbsp;
        </span>
    );
}

function DayColumns({
    dayCount,
}: {
    dayCount: number;
}) {
    return (
        <>
            {Array.from(
                { length: dayCount },
                (_, day) => (
                    <col
                        key={day}
                        className="planner-day-col"
                    />
                )
            )}
        </>
    );
}

/* Both planner tables use these columns so their day borders always align. */
function PlannerColumnGroup({
    dayCount,
    paperSize,
}: {
    dayCount: number;
    paperSize: "A4" | "A3";
}) {
    const preferredActivityWidth = paperSize === "A4" ? 38 : 40;
    const activityColumnWidth = Math.min(
        ACTIVITY_COLUMN_MAX_WIDTH,
        Math.max(ACTIVITY_COLUMN_MIN_WIDTH, preferredActivityWidth)
    );

    return (
        <colgroup>
            <col style={{ width: "9%" }} />
            <col style={{ width: `${activityColumnWidth}mm` }} />
            <DayColumns dayCount={dayCount} />
        </colgroup>
    );
}

function DayHeaderCells({
    dayCount,
}: {
    dayCount: number;
}) {
    return (
        <>
            {Array.from(
                { length: dayCount },
                (_, day) => (
                    <th
                        key={day}
                        className="planner-day-cell border border-black p-0 font-semibold"
                    >
                        {day + 1}
                    </th>
                )
            )}
        </>
    );
}

function DayCheckboxCells({
    dayCount,
    showInnerCheckboxes,
}: {
    dayCount: number;
    showInnerCheckboxes: boolean;
}) {
    return (
        <>
            {Array.from(
                { length: dayCount },
                (_, day) => (
                    <td
                        key={day}
                        className="planner-day-cell border border-black p-0 align-middle"
                    >
                        {showInnerCheckboxes && (
                            <div className="planner-checkbox" />
                        )}
                    </td>
                )
            )}
        </>
    );
}

function DailyCompletedActivitiesTable({
    dayCount,
    totalActivities,
    paperSize,
}: {
    dayCount: number;
    totalActivities: number;
    paperSize: "A4" | "A3";
}) {
    return (
        <table className="planner-table-main planner-daily-summary border-collapse border border-black text-center text-[10px]">
            <PlannerColumnGroup dayCount={dayCount} paperSize={paperSize} />

            <tbody>
                <tr className="planner-summary-row">
                    <td
                        colSpan={2}
                        className="border border-black px-2 text-center text-[13px] font-bold align-middle whitespace-nowrap"
                    >
                        Total completed activities{" "}
                        <span className="text-[9px] font-normal text-gray-500">
                            (out of {totalActivities})
                        </span>
                    </td>

                    {Array.from({ length: dayCount }, (_, day) => (
                        <td
                            className="planner-day-cell border border-black p-0 align-middle"
                            key={day}
                        />
                    ))}
                </tr>
            </tbody>
        </table>
    );
}

function StarShape({
    number,
}: {
    number: number;
}) {
    return (
        <div className="relative flex aspect-square items-center justify-center text-[30px] leading-none">
            <span>☆</span>

            <span className="absolute inset-0 flex items-center justify-center text-[8px] leading-none">
                {number}
            </span>
        </div>
    );
}

function DailyStarsGrid({
    dayCount,
}: {
    dayCount: number;
}) {
    const totalRows = 3;

    const perRow = Math.ceil(
        dayCount / totalRows
    );

    const rows = Array.from(
        { length: totalRows },
        (_, rowIndex) => {
            const start =
                rowIndex * perRow + 1;

            const end = Math.min(
                start + perRow - 1,
                dayCount
            );

            const count =
                end - start + 1;

            return {
                start,
                count,
            };
        }
    ).filter(
        (row) => row.count > 0
    );

    return (
        <div className="flex h-full flex-col justify-around p-1">
            {rows.map((row) => (
                <div
                    key={row.start}
                    className="grid gap-1"
                    style={{
                        gridTemplateColumns:
                            `repeat(${row.count}, minmax(0, 1fr))`,
                    }}
                >
                    {Array.from(
                        { length: row.count },
                        (_, index) => {
                            const day =
                                row.start + index;

                            return (
                                <StarShape
                                    key={day}
                                    number={day}
                                />
                            );
                        }
                    )}
                </div>
            ))}
        </div>
    );
}

function WeeklyRewardGrid() {
    const weeks = [
        "Week 1",
        "Week 2",
        "Week 3",
        "Week 4",
    ];

    return (
        <div className="absolute inset-1 grid grid-cols-2 grid-rows-2 gap-1">
            {weeks.map((week) => (
                <div
                    key={week}
                    className="flex items-start justify-center rounded-sm border border-black/20 px-1 pt-2 text-[10px]"
                >
                    <span className="font-semibold leading-none">
                        {week}
                    </span>
                </div>
            ))}
        </div>
    );
}

export default function PreviewPage() {
    const router = useRouter();
    const { startLoading } = usePageLoader();

    const planner =
        useContext(PlannerContext);

    const [
        selectedMonth,
        setSelectedMonth,
    ] = useState(
        new Date().getMonth()
    );

    const [
        paperSize,
        setPaperSize,
    ] = useState<"A4" | "A3">("A4");

    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [saveSuccess, setSaveSuccess] = useState("");
    // This affects the shared preview markup, so the browser prints the same version the user sees.
    const [showActivityCheckboxes, setShowActivityCheckboxes] = useState(true);

    // When a success message exists, the controls use the second grid row below it.
    const controlsRow = saveSuccess
        ? "sm:row-start-2"
        : "sm:row-start-1";

    if (!planner) {
        throw new Error(
            "PlannerContext not found"
        );
    }

    const {
        isSignedIn,
        availableSections,
        selectedSections,
        activities,
        editingPlannerId,
        plannerTitle,
        setEditingPlannerId,
        setPlannerTitle,
        saveGuestPlanner,
    } = planner;

    const dayCount = useMemo(
        () =>
            getDaysInMonth(
                selectedMonth
            ),
        [selectedMonth]
    );

    const monthName =
        MONTH_NAMES[selectedMonth];

    /*
     * Convert selected section IDs
     * into actual section objects.
     */
    const selectedSectionObjects =
        selectedSections
            .map((sectionId) =>
                availableSections.find(
                    (section) =>
                        section.id ===
                        sectionId
                )
            )
            .filter(
                (section) =>
                    section !== undefined
            );

    /*
     * Count every custom activity.

     * Maximum = 11 activities.
     */
    const totalActivities =
        selectedSectionObjects.reduce(
            (total, section) =>
                total +
                (
                    activities[
                    section.id
                    ] || []
                ).length,
            0
        );

    /*
     * Calculate the row height.

     * The available printable height is
     * larger for A3 than A4.

     * Fewer activities:
     * → taller rows

     * More activities:
     * → shorter rows
     */
    const activityCountForLayout = Math.max(totalActivities, 1);
    const trackerHeaderHeight = 6;
    // Use most of the remaining page height for the handwriting grid.
    const trackerHeight = paperSize === "A4" ? 107 : 194;
    const footerHeight = 49.5;
    const activityRowHeight =
        (trackerHeight - trackerHeaderHeight) / activityCountForLayout;

    async function handleSave() {
        setSaveError("");
        setSaveSuccess("");

        const sectionsToSave = selectedSectionObjects.map((section) => ({
            name: section.name,
            isBlank: section.isBlank,
            isDefault: section.isDefault,
            activities: (activities[section.id] || []).map((activity) => ({
                name: activity.name,
                isBlank: activity.isBlank,
            })),
        }));

        if (sectionsToSave.length === 0) {
            setSaveError("Choose at least one section before saving.");
            return;
        }

        // Guests never call the server: their planner is saved in this browser tab only.
        if (!isSignedIn) {
            saveGuestPlanner();
            setSaveSuccess("temporary");
            return;
        }

        setIsSaving(true);

        try {
            const response = await fetch(
                editingPlannerId
                    ? `/api/planner/${editingPlannerId}`
                    : "/api/planner",
                {
                method: editingPlannerId ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: plannerTitle, sections: sectionsToSave }),
                }
            );
            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    // The user was signed in when the page loaded, so a 401 means the login has expired.
                    // The draft stays in this tab, so they can log in and save again.
                    setSaveError("Your login session has expired. Please log in again, then save.");
                    return;
                }

                setSaveError(data.message || "Unable to save the planner.");
                return;
            }

            setEditingPlannerId(data.plannerId);
            setSaveSuccess(
                editingPlannerId
                    ? "updated"
                    : "created"
            );
        } catch {
            setSaveError("Unable to reach the server. Please try again.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <main
            className={`planner-preview-main ${paperSize === "A4"
                ? "planner-a4"
                : "planner-a3"
                } min-h-screen overflow-x-auto bg-gray-200 py-8 dark:bg-background`}
        >

            {/* =========================
                CONTROLS
            ========================== */}

            <div className={`no-print mx-auto mb-6 flex w-full flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${
                paperSize === "A4"
                    ? "max-w-[297mm]"
                    : "max-w-[420mm]"
            }`}>

                {/* Print setup stays above the left edge of the planner sheet. */}
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        className="border-gray-400 dark:border-gray-600"
                        onClick={() => {
                            startLoading();
                            router.back();
                        }}
                    >
                        ← Back
                    </Button>

                    <select
                        aria-label="Paper size"
                        value={paperSize}
                        onChange={(event) =>
                            setPaperSize(
                                event.target
                                    .value as
                                | "A4"
                                | "A3"
                            )
                        }
                        className="h-8 rounded border border-gray-400 bg-secondary px-3 text-sm text-secondary-foreground dark:border-gray-600"
                    >
                        <option value="A4">
                            A4 Landscape
                        </option>

                        <option value="A3">
                            A3 Landscape
                        </option>
                    </select>

                    <label className="flex h-8 items-center gap-2 rounded border border-gray-400 bg-secondary px-3 text-sm text-secondary-foreground dark:border-gray-600">
                        <input
                            checked={showActivityCheckboxes}
                            className="size-3.5"
                            onChange={(event) =>
                                setShowActivityCheckboxes(event.target.checked)
                            }
                            type="checkbox"
                        />
                        Checkboxes
                    </label>

                    <Button
                        className="border-gray-400 px-5 dark:border-gray-600"
                        onClick={() =>
                            window.print()
                        }
                    >
                        Print
                    </Button>
                </div>

                {/* The grid keeps the message above the title, while title, save, and delete share one row. */}
                <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-[14rem_auto] sm:items-center">
                    {saveSuccess && (
                        <div
                            role="status"
                            className="w-56 rounded-lg border border-green-600/30 bg-green-600/10 px-2 py-1.5 text-xs leading-5 text-green-800 dark:text-green-300 sm:col-start-1 sm:row-start-1"
                        >
                            {saveSuccess === "temporary" ? (
                                <p>
                                    <Link
                                        href="/dashboard"
                                        className="font-semibold underline underline-offset-4"
                                    >
                                        View on Dashboard
                                    </Link>
                                </p>
                            ) : (
                                <p>
                                    View your {saveSuccess} plan on{" "}
                                    <Link
                                        href="/dashboard"
                                        className="font-semibold underline underline-offset-4"
                                    >
                                        Dashboard
                                    </Link>.
                                </p>
                            )}
                        </div>
                    )}

                    <Input
                        aria-label="Planner title"
                        className={`w-56 bg-white text-gray-950 dark:bg-input/30 dark:text-foreground sm:col-start-1 ${controlsRow}`}
                        disabled={isSaving}
                        placeholder="Planner title"
                        value={plannerTitle}
                        onChange={(event) => setPlannerTitle(event.target.value)}
                        // This input is not inside a <form>, so Enter would otherwise do nothing.
                        // Run the same save function used by the Save Planner button.
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                event.preventDefault();
                                handleSave();
                            }
                        }}
                    />

                    <div className={`flex flex-wrap items-center gap-2 sm:col-start-2 ${controlsRow}`}>
                        <Button
                            className="border-gray-400 dark:border-gray-600"
                            disabled={isSaving}
                            onClick={handleSave}
                        >
                            {isSaving ? "Saving..." : "Save Planner"}
                        </Button>

                        {/* A new or guest planner has no database ID, so it cannot be deleted yet. */}
                        {editingPlannerId && (
                            <DeletePlannerButton
                                plannerId={editingPlannerId}
                                plannerTitle={plannerTitle}
                            />
                        )}
                    </div>

                    {saveError && (
                        <p className="text-sm text-red-600 sm:col-start-1">
                            {saveError}
                        </p>
                    )}
                </div>

            </div>

            {/* =========================
                PRINT SHEET
            ========================== */}

            <div className="planner-sheet rounded-xl shadow">

                {/* =========================
                    HEADER
                ========================== */}

                <div className="planner-header flex items-start justify-between gap-4">

                    <div className="shrink-0 text-sm">

                        <p>
                            <strong>
                                Name:
                            </strong>{" "}
                            ___________________
                        </p>

                        <p className="mt-3 flex items-center gap-2">

                            <strong>
                                Month:
                            </strong>

                            <select
                                className="no-print rounded border border-black/20 bg-white px-1 py-0.5 text-sm outline-none"
                                value={
                                    selectedMonth
                                }
                                onChange={(event) =>
                                    setSelectedMonth(
                                        Number(
                                            event
                                                .target
                                                .value
                                        )
                                    )
                                }
                            >
                                {MONTH_NAMES.map(
                                    (
                                        name,
                                        index
                                    ) => (
                                        <option
                                            key={
                                                name
                                            }
                                            value={
                                                index
                                            }
                                        >
                                            {name}
                                        </option>
                                    )
                                )}
                            </select>

                            <span className="hidden print:inline">
                                {monthName}
                            </span>

                        </p>

                    </div>

                    <div className="min-w-0 flex-1 text-center">

                        <h1 className="text-2xl font-bold tracking-tight">
                            My 30 Day Journey
                        </h1>

                        <p className="mt-1 text-xs text-gray-500">
                            Little steps today, better me tomorrow Insha&apos;Allah.
                        </p>

                    </div>

                    <div className="shrink-0 text-sm">

                        <p className="font-semibold">
                            Focus of the Month
                        </p>

                        <div className="mt-8 w-36 border-b border-black" />

                    </div>

                </div>

                {/* =========================
                    MAIN HABIT TRACKER
                ========================== */}

                <div
                    className="planner-tracker-wrapper mt-1"
                    style={{ height: `${trackerHeight}mm` }}
                >

                    <table
                        className="planner-table-main border-collapse border border-black text-center text-[10px]"
                        style={{
                            "--activity-row-height":
                                `${activityRowHeight}mm`,
                        } as React.CSSProperties}
                    >

                        <PlannerColumnGroup
                            dayCount={dayCount}
                            paperSize={paperSize}
                        />

                        <thead>

                            <tr className="planner-header-row">

                                <th className="border border-black p-1 font-semibold whitespace-nowrap">
                                    Section
                                </th>

                                <th className="border border-black p-1 font-semibold whitespace-nowrap">
                                    Activity
                                </th>

                                <DayHeaderCells
                                    dayCount={
                                        dayCount
                                    }
                                />

                            </tr>

                        </thead>

                        <tbody>

                            {selectedSectionObjects.map(
                                (section) => {
                                    const sectionActivities =
                                        activities[section.id] || [];

                                    if (
                                        sectionActivities.length === 0
                                    ) {
                                        return null;
                                    }

                                    return sectionActivities.map(
                                        (
                                            activity,
                                            activityIndex
                                        ) => (
                                            <tr
                                                key={activity.id}
                                                className="planner-habit-row"
                                            >

                                                {activityIndex === 0 && (
                                                    <td
                                                        rowSpan={
                                                            sectionActivities.length
                                                        }
                                                        className="border border-black p-2 text-[13px] font-bold align-middle whitespace-nowrap"
                                                    >
                                                        {section.isBlank ? (
                                                            <BlankLine
                                                                minWidth="8rem"
                                                            />
                                                        ) : (
                                                            section.name
                                                        )}
                                                    </td>
                                                )}

                                                <td className="border border-black p-1 text-[14px] text-center align-middle leading-tight">
                                                    {activity.isBlank ? (
                                                        <BlankLine
                                                            minWidth="7rem"
                                                        />
                                                    ) : (
                                                        activity.name
                                                    )}
                                                </td>

                                                <DayCheckboxCells
                                                    dayCount={dayCount}
                                                    showInnerCheckboxes={
                                                        showActivityCheckboxes
                                                    }
                                                />

                                            </tr>
                                        )
                                    );
                                }
                            )}

                        </tbody>

                    </table>

                </div>

                {/* A separate one-row table keeps the daily total easy to read and write in. */}
                <div className="planner-daily-summary-wrapper mt-2">
                    <DailyCompletedActivitiesTable
                        dayCount={dayCount}
                        totalActivities={totalActivities}
                        paperSize={paperSize}
                    />
                </div>

                {/* =========================
                    FOOTER
                ========================== */}

                <div
                    className="planner-footer mt-2"
                    style={
                        {
                            "--planner-footer-height": `${footerHeight}mm`,
                        } as React.CSSProperties
                    }
                >

                    <table className="planner-table border-collapse border border-black text-center text-[14px]">

                        <colgroup>

                            <col style={{ width: "30%" }} />

                            <col style={{ width: "15%" }} />

                            <col style={{ width: "40%" }} />

                            <col style={{ width: "15%" }} />

                        </colgroup>

                        <thead>

                            <tr>

                                <th className="border border-black p-1 font-semibold">
                                    Weekly Rewards
                                </th>

                                <th className="border border-black p-1 font-semibold">
                                    Month Reward
                                </th>

                                <th className="border border-black p-1 font-semibold">
                                    Daily Stars
                                </th>

                                <th className="border border-black p-1 font-semibold">
                                    Signatures
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            <tr>

                                <td className="border border-black align-top p-1 relative">
                                    <WeeklyRewardGrid />
                                </td>

                                <td className="border border-black align-top p-2">
                                </td>

                                <td className="border border-black p-0 align-middle">
                                    <DailyStarsGrid
                                        dayCount={
                                            dayCount
                                        }
                                    />
                                </td>

                                <td className="border border-black p-0 relative">

                                    <div className="absolute inset-0 grid grid-rows-2">

                                        <div className="flex items-end justify-center border-b border-black p-1">

                                            <p className="text-[10px] font-medium leading-none">
                                                Parent Signature
                                            </p>

                                        </div>

                                        <div className="flex items-end justify-center p-1">

                                            <p className="text-[10px] font-medium leading-none">
                                                Child Signature
                                            </p>

                                        </div>

                                    </div>

                                </td>

                            </tr>

                        </tbody>

                    </table>

                </div>
            </div>

        </main>
    );
}
