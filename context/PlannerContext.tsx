"use client";

import {
    createContext,
    useCallback,
    useEffect,
    useState,
    ReactNode,
    Dispatch,
    SetStateAction,
} from "react";

// sessionStorage belongs to one browser tab and is never sent to PostgreSQL.
const DRAFT_STORAGE_KEY = "growhabits-draft";
const GUEST_PLANNERS_STORAGE_KEY = "growhabits-guest-planners";

/*
Shared Planner State

Sections Page
↓
Activity Page
↓
Preview Page
*/

export interface PlannerSection {
    id: string;
    name: string;
    isBlank: boolean;
    isDefault: boolean;
}

export interface PlannerActivity {
    id: string;
    name: string;
    isBlank: boolean;
}

// A guest planner has the same planning data, but its ID exists only in this browser session.
export interface GuestPlanner {
    id: string;
    title: string;
    availableSections: PlannerSection[];
    selectedSections: string[];
    activities: Record<string, PlannerActivity[]>;
    createdAt: string;
}

interface PlannerContextType {
    // Database ID of the planner currently being edited. Null means a new planner.
    editingPlannerId: number | null;
    setEditingPlannerId: Dispatch<SetStateAction<number | null>>;

    // The title is kept while moving between the planner's client-side steps.
    plannerTitle: string;
    setPlannerTitle: Dispatch<SetStateAction<string>>;

    // All available sections.
    availableSections: PlannerSection[];

    // Update available sections.
    setAvailableSections: Dispatch<
        SetStateAction<PlannerSection[]>
    >;

    // IDs of the selected sections.
    selectedSections: string[];

    // Update selected section IDs.
    setSelectedSections: Dispatch<
        SetStateAction<string[]>
    >;

    // Activities grouped by section ID.
    activities: Record<string, PlannerActivity[]>;

    // Update activities.
    setActivities: Dispatch<
        SetStateAction<Record<string, PlannerActivity[]>>
    >;

    // Clears old planner data before starting a completely new planner.
    resetPlanner: () => void;

    // Guest planners are kept in sessionStorage instead of the PostgreSQL database.
    guestPlanners: GuestPlanner[];
    saveGuestPlanner: () => void;
    loadGuestPlanner: (guestPlanner: GuestPlanner) => void;
    deleteGuestPlanner: (guestPlannerId: string) => void;
}

// Create Context.
export const PlannerContext =
    createContext<PlannerContextType | null>(null);

interface PlannerProviderProps {
    children: ReactNode;
}

export function PlannerProvider({
    children,
}: PlannerProviderProps) {

    // Available sections.
    const [availableSections, setAvailableSections] =
        useState<PlannerSection[]>([]);

    // Selected section IDs.
    const [selectedSections, setSelectedSections] =
        useState<string[]>([]);

    // Activities grouped by section ID.
    const [activities, setActivities] =
        useState<Record<string, PlannerActivity[]>>({});

    const [editingPlannerId, setEditingPlannerId] =
        useState<number | null>(null);

    const [plannerTitle, setPlannerTitle] = useState("");

    const [guestPlanners, setGuestPlanners] = useState<GuestPlanner[]>([]);
    const [editingGuestPlannerId, setEditingGuestPlannerId] = useState<string | null>(null);

    /*
    React state disappears on a page refresh. sessionStorage lets an unfinished
    planner survive that refresh without becoming a saved database planner.
    We wait until the initial read finishes before writing, so an empty first
    render cannot overwrite an existing draft.
    */
    const [isDraftLoaded, setIsDraftLoaded] = useState(false);

    /*
    sessionStorage is an external browser store. This one-time effect must put
    its saved draft into React state after the page mounts, so the lint rule is
    disabled only for this deliberate hydration step.
    */
    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        try {
            const savedDraft = sessionStorage.getItem(DRAFT_STORAGE_KEY);

            if (savedDraft) {
                const draft = JSON.parse(savedDraft);

                setAvailableSections(draft.availableSections || []);
                setSelectedSections(draft.selectedSections || []);
                setActivities(draft.activities || {});
                setEditingPlannerId(draft.editingPlannerId ?? null);
                setPlannerTitle(draft.plannerTitle || "");
                setEditingGuestPlannerId(draft.editingGuestPlannerId ?? null);
            }

            const savedGuestPlanners = sessionStorage.getItem(GUEST_PLANNERS_STORAGE_KEY);

            if (savedGuestPlanners) {
                setGuestPlanners(JSON.parse(savedGuestPlanners));
            }
        } catch {
            // A broken old draft is ignored; the parent can start a fresh one.
        } finally {
            setIsDraftLoaded(true);
        }
    }, []);
    /* eslint-enable react-hooks/set-state-in-effect */

    useEffect(() => {
        if (!isDraftLoaded) {
            return;
        }

        const draft = {
            availableSections,
            selectedSections,
            activities,
            editingPlannerId,
            editingGuestPlannerId,
            plannerTitle,
        };

        sessionStorage.setItem(
            DRAFT_STORAGE_KEY,
            JSON.stringify(draft)
        );

        sessionStorage.setItem(
            GUEST_PLANNERS_STORAGE_KEY,
            JSON.stringify(guestPlanners)
        );
    }, [
        isDraftLoaded,
        availableSections,
        selectedSections,
        activities,
        editingPlannerId,
        editingGuestPlannerId,
        plannerTitle,
        guestPlanners,
    ]);

    const resetPlanner = useCallback(() => {
        setAvailableSections([]);
        setSelectedSections([]);
        setActivities({});
        setEditingPlannerId(null);
        setEditingGuestPlannerId(null);
        setPlannerTitle("");
    }, []);

    // Save a snapshot of the current planner in this tab only, without calling the server.
    const saveGuestPlanner = useCallback(() => {
        const existingPlanner = guestPlanners.find(
            (guestPlanner) => guestPlanner.id === editingGuestPlannerId
        );

        const guestPlanner: GuestPlanner = {
            id: existingPlanner?.id ?? crypto.randomUUID(),
            title: plannerTitle.trim() || "Untitled planner",
            availableSections,
            selectedSections,
            activities,
            createdAt: existingPlanner?.createdAt ?? new Date().toISOString(),
        };

        setGuestPlanners((previousGuestPlanners) => {
            const alreadyExists = previousGuestPlanners.some(
                (savedPlanner) => savedPlanner.id === guestPlanner.id
            );

            if (!alreadyExists) {
                return [guestPlanner, ...previousGuestPlanners];
            }

            return previousGuestPlanners.map((savedPlanner) =>
                savedPlanner.id === guestPlanner.id ? guestPlanner : savedPlanner
            );
        });

        setEditingGuestPlannerId(guestPlanner.id);
    }, [
        activities,
        availableSections,
        editingGuestPlannerId,
        guestPlanners,
        plannerTitle,
        selectedSections,
    ]);

    // Restore a temporary planner from the guest dashboard into the planner editor.
    const loadGuestPlanner = useCallback((guestPlanner: GuestPlanner) => {
        setAvailableSections(guestPlanner.availableSections);
        setSelectedSections(guestPlanner.selectedSections);
        setActivities(guestPlanner.activities);
        setPlannerTitle(guestPlanner.title);
        setEditingPlannerId(null);
        setEditingGuestPlannerId(guestPlanner.id);
    }, []);

    const deleteGuestPlanner = useCallback((guestPlannerId: string) => {
        setGuestPlanners((previousGuestPlanners) =>
            previousGuestPlanners.filter(
                (guestPlanner) => guestPlanner.id !== guestPlannerId
            )
        );

        if (editingGuestPlannerId === guestPlannerId) {
            setEditingGuestPlannerId(null);
        }
    }, [editingGuestPlannerId]);

    return (
        <PlannerContext.Provider
            value={{
                editingPlannerId,
                setEditingPlannerId,

                plannerTitle,
                setPlannerTitle,

                availableSections,
                setAvailableSections,

                selectedSections,
                setSelectedSections,

                activities,
                setActivities,

                resetPlanner,

                guestPlanners,
                saveGuestPlanner,
                loadGuestPlanner,
                deleteGuestPlanner,
            }}
        >
            {children}
        </PlannerContext.Provider>
    );
}
