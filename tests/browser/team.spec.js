import { test, expect } from "@playwright/test";
test("20-task deck can be demonstrated and replayed without deleting custom work", async ({
  page,
}) => {
  await page.goto("/discover");
  await expect(page.getByText("20 tasks to explore")).toBeVisible();
  for (let i = 0; i < 12; i++)
    await page
      .getByRole("button", {
        name: i % 2 ? "Pass on task" : "Interested in task",
      })
      .click();
  await expect(page.getByText("8 tasks to explore")).toBeVisible();
  await page.evaluate(() => {
    const d = JSON.parse(localStorage.getItem("taskswap-decisions"));
    d["user-task"] = "liked";
    localStorage.setItem("taskswap-decisions", JSON.stringify(d));
    localStorage.setItem(
      "taskswap-brief",
      JSON.stringify({
        title: "Keep my notes",
        goal: "My goal",
        deliverable: "My deliverable",
        deadline: "",
        constraints: "",
        done: "My criteria",
      }),
    );
  });
  await page.reload();
  await page
    .getByRole("button", { name: "Demo controls", exact: true })
    .click();
  await page.getByRole("button", { name: "Replay sample deck" }).click();
  await expect(page.getByText("20 tasks to explore")).toBeVisible();
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem("taskswap-decisions")),
    ),
  ).toEqual({ "user-task": "liked" });
  await page
    .getByRole("button", { name: "Project notes", exact: true })
    .click();
  await expect(page.getByLabel("Project name")).toHaveValue("Keep my notes");
});
test("sample exchange moves through agreement, delivery, and completion with persistent activity", async ({
  page,
}) => {
  await page.goto("/team");
  await page.getByRole("button", { name: "Swap status", exact: true }).click();
  await page.getByRole("button", { name: "Open exchange SW-101" }).click();
  await expect(
    page.getByRole("button", { name: "Start demo exchange" }),
  ).toBeDisabled();
  await page.getByRole("dialog").getByRole("checkbox").check();
  await page.getByRole("button", { name: "Start demo exchange" }).click();
  await expect(
    page.getByRole("button", { name: "Complete demo exchange" }),
  ).toBeDisabled();
  await page.getByRole("dialog").getByRole("checkbox").nth(0).check();
  await expect(
    page.getByRole("button", { name: "Complete demo exchange" }),
  ).toBeDisabled();
  await page.getByRole("dialog").getByRole("checkbox").nth(1).check();
  await page.getByRole("button", { name: "Complete demo exchange" }).click();
  await expect(
    page.getByText("Both deliveries confirmed; demo exchange completed."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect(
    page.getByRole("region", { name: "Done exchanges" }).getByText("SW-101"),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Swap status", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "Done exchanges" }).getByText("SW-101"),
  ).toBeVisible();
});
test("saved task becomes a two-sided team exchange; adding the same draft twice is idempotent", async ({
  page,
}) => {
  await page.goto("/discover");
  await page.getByRole("button", { name: "Interested in task" }).click();
  await page.getByRole("button", { name: /My swaps/ }).click();
  await page.getByRole("button", { name: "Propose swap" }).click();
  await page
    .getByLabel("What can this teammate help you with?")
    .fill("Check the formulas in my report");
  await page
    .getByLabel("When should both tasks be ready?")
    .fill("Thursday afternoon");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Save draft" }).click();
  await page.getByRole("button", { name: "Create demo swap" }).click();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("heading", { name: "Refresh our quarterly presentation" }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("heading", { name: "Check the formulas in my report" }),
  ).toBeVisible();
  await expect(page.getByText("Helping Olivia Chen")).toBeVisible();
  await expect(page.getByText("Helping Jamie Davis")).toBeVisible();
  await page.getByRole("button", { name: "Close dialog" }).click();
  expect(await page.locator(".assignment-table tbody tr").count()).toBe(14);
  await page.getByRole("button", { name: /My swaps/ }).click();
  await page.getByRole("button", { name: /Trade drafts/ }).click();
  await page.getByRole("button", { name: "View on team board" }).click();
  await page.getByRole("button", { name: "Close dialog" }).click();
  expect(await page.locator(".assignment-table tbody tr").count()).toBe(14);
  await page
    .getByRole("button", { name: "Demo controls", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Restore sample exchanges" }).click();
  expect(await page.locator(".assignment-table tbody tr").count()).toBe(14);
  await expect(page.locator(".assignment-table")).toContainText(
    "Check the formulas in my report",
  );
});
test("task table and teammate filters make individual responsibilities explicit", async ({
  page,
}) => {
  await page.goto("/team");
  await expect(page.locator(".assignment-table tbody tr")).toHaveCount(12);
  await expect(
    page.getByRole("columnheader", { name: "Working on it" }),
  ).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "Task owner" }),
  ).toBeVisible();
  await page.getByLabel("Filter by teammate").selectOption("Jamie Davis");
  await expect(page.locator(".assignment-table tbody tr")).toHaveCount(1);
  await expect(page.locator(".assignment-table tbody tr")).toContainText(
    "Olivia Chen",
  );
  await page
    .getByRole("textbox", { name: "Search exchanges" })
    .fill("nothing matches");
  await expect(
    page.getByText("No exchanges match your filters."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.locator(".assignment-table tbody tr")).toHaveCount(12);
  await page.getByLabel("My work only", { exact: true }).check();
  await expect(page.locator(".assignment-table tbody tr")).toHaveCount(1);
});
test("team board refresh and browser history work and mobile has no horizontal overflow", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/team");
  await expect(
    page.getByRole("heading", { name: "Team board." }),
  ).toBeVisible();
  await page.screenshot({ path: "/tmp/taskswap-team.png", fullPage: true });
  await page.getByRole("button", { name: "Find tasks", exact: true }).click();
  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "Team board." }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "/tmp/taskswap-team-mobile.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "View Jamie Davis's task in SW-103" })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.keyboard.press("Escape");
  expect(errors).toEqual([]);
});
