// This is the single place to publish small public updates on the Updates page.
// Add a new object, then deploy the site to publish it. The page sorts newest first.
export type ProjectUpdate = {
  // Use a UTC ISO timestamp. The browser converts it to each visitor's local time zone.
  publishedAt: string;
  title: string;
  message: string;
  status: "In development" | "New" | "Improved";
};

export const projectUpdates: ProjectUpdate[] = [
  {
    publishedAt: "2026-08-26T10:13:00Z",
    title: "Age-based planner layouts",
    message:
      "The 5-8 and 9-13 age choices are collected now, but they currently use the same planner layout. Future updates will tailor activities and layouts to each age group.",
    status: "In development",
  },
  {
    publishedAt: "2026-08-25T10:00:00Z",
    title: "Welcome to GrowHabits",
    message: "Version: 1",
    status: "New",
  },
];
