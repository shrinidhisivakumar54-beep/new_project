import { test, expect } from "@playwright/test";
test("primary flow goes directly from a saved task to a proposed team swap", async ({
  page,
}) => {
  await page.goto("/discover");
  await page.getByRole("button", { name: "Interested in task" }).click();
  await page
    .getByRole("button", { name: "Review saved tasks", exact: true })
    .click();
  await expect(page).toHaveURL(/\/board$/);
  await page.getByRole("button", { name: "Propose swap" }).click();
  await page
    .getByLabel("What can this teammate help you with?")
    .fill("Check my spreadsheet totals");
  await page
    .getByLabel("When should both tasks be ready?")
    .fill("Friday afternoon");
  await page.getByRole("dialog").getByRole("checkbox").check();
  await page
    .getByRole("button", { name: "Create demo swap", exact: true })
    .click();
  await expect(page).toHaveURL(/\/team$/);
  await expect(page.getByRole("dialog")).toContainText("Helping Olivia Chen");
  await expect(page.getByRole("dialog")).toContainText(
    "Check my spreadsheet totals",
  );
  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect(page.locator(".assignment-table tbody tr")).toHaveCount(14);
  await page.reload();
  await expect(page.locator(".assignment-table tbody tr")).toHaveCount(14);
});
test("an old saved deck has a useful next action instead of a no-op reset", async ({
  page,
}) => {
  await page.goto("/discover");
  await page.evaluate(() => {
    const decisions = Object.fromEntries(
      Array.from({ length: 20 }, (_, i) => ["s" + (i + 1), "liked"]),
    );
    localStorage.setItem("taskswap-decisions", JSON.stringify(decisions));
    localStorage.setItem(
      "taskswap-brief",
      JSON.stringify({
        title: "Preserve this project",
        goal: "Goal",
        deliverable: "Deliverable",
        done: "Approved",
        constraints: "",
        deadline: "",
      }),
    );
  });
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "You’ve reviewed every task." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "View saved tasks", exact: true })
    .click();
  await expect(page.locator(".board-card")).toHaveCount(20);
  await page.getByRole("button", { name: "Find tasks", exact: true }).click();
  await page
    .getByRole("button", { name: "Replay demo tasks", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Replay sample deck", exact: true })
    .click();
  await expect(page.getByText("20 tasks to explore")).toBeVisible();
  await page
    .getByRole("button", { name: "Project notes", exact: true })
    .click();
  await expect(page.getByLabel("Project name")).toHaveValue(
    "Preserve this project",
  );
});
test("home has a direct team-board route and the default task table is usable on mobile", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Team board", exact: true }).click();
  await expect(page).toHaveURL(/\/team$/);
  await expect(
    page.getByRole("columnheader", { name: "Task owner" }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(
    page.getByRole("button", { name: "View Jamie Davis's task in SW-103" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "View Jamie Davis's task in SW-103" })
    .click();
  await expect(page.getByRole("dialog")).toContainText("Helping Olivia Chen");
});
