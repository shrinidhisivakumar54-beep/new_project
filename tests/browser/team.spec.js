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
  await expect(
    page.getByRole("region", { name: "Done exchanges" }).getByText("SW-101"),
  ).toBeVisible();
});
test("saved task becomes a two-sided team exchange; adding the same draft twice is idempotent", async ({
  page,
}) => {
  await page.goto("/discover");
  await page.getByRole("button", { name: "Interested in task" }).click();
  await page.getByRole("button", { name: /My board/ }).click();
  await page.getByRole("button", { name: "Build a trade" }).click();
  await page
    .getByLabel("What would you like help with in return?")
    .fill("Check the formulas in my report");
  await page.getByLabel("Proposed timing").fill("Thursday afternoon");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Save trade draft" }).click();
  await page.getByRole("button", { name: "Add to team demo" }).click();
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
  expect(await page.locator(".exchange-card").count()).toBe(7);
  await page.getByRole("button", { name: /My board/ }).click();
  await page.getByRole("button", { name: /Trade drafts/ }).click();
  await page.getByRole("button", { name: "View on team board" }).click();
  await page.getByRole("button", { name: "Close dialog" }).click();
  expect(await page.locator(".exchange-card").count()).toBe(7);
  await page
    .getByRole("button", { name: "Demo controls", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Restore sample exchanges" }).click();
  expect(await page.locator(".exchange-card").count()).toBe(7);
  await expect(page.getByText("Your demo exchange")).toBeVisible();
});
test("people view and teammate filters explain who is doing whose work", async ({
  page,
}) => {
  await page.goto("/team");
  await page.getByLabel("Filter by teammate").selectOption("Jamie Davis");
  expect(await page.locator(".exchange-card").count()).toBe(1);
  await expect(page.locator(".exchange-card")).toContainText("Olivia Chen");
  await page.getByRole("button", { name: "People", exact: true }).click();
  await expect(page.locator(".person-work-card")).toHaveCount(2);
  await expect(
    page
      .locator(".person-work-card")
      .filter({ hasText: "Jamie Davis" })
      .first(),
  ).toContainText("Helping");
  await page
    .getByRole("textbox", { name: "Search exchanges" })
    .fill("nothing matches");
  await expect(
    page.getByText("No exchanges match your filters."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.locator(".person-work-card")).toHaveCount(9);
  await page.getByLabel("My exchanges", { exact: true }).check();
  await expect(page.locator(".person-work-card")).toHaveCount(2);
});
test("team board refresh and browser history work and mobile has no horizontal overflow", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/team");
  await expect(
    page.getByRole("heading", { name: "Who’s helping whom." }),
  ).toBeVisible();
  await page.screenshot({ path: "/tmp/taskswap-team.png", fullPage: true });
  await page.getByRole("button", { name: "Discover", exact: true }).click();
  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "Who’s helping whom." }),
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
  await page.getByRole("button", { name: "Open exchange SW-103" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.keyboard.press("Escape");
  expect(errors).toEqual([]);
});
