import { test, expect } from "@playwright/test";
test("swipe buttons, undo, filter and persisted board", async ({ page }) => {
  await page.goto("/discover");
  await expect(
    page.getByRole("heading", { name: "Find a task." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Interested in task" }).click();
  await expect(
    page.getByRole("heading", { name: "Summarize our customer survey" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Undo last swipe" }).click();
  await expect(
    page.getByRole("heading", { name: "Refresh our quarterly presentation" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Interested in task" }).click();
  await page.getByRole("button", { name: /My swaps/ }).click();
  await expect(
    page.getByRole("heading", { name: "Refresh our quarterly presentation" }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: /My swaps/ }).click();
  await expect(
    page.getByRole("heading", { name: "Refresh our quarterly presentation" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Propose swap" }).click();
  await page
    .getByLabel("What can this teammate help you with?")
    .fill("Check my spreadsheet formulas. Done when totals reconcile.");
  await page.getByLabel("When should both tasks be ready?").fill("Thursday");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Save draft" }).click();
  await expect(page.getByText("Draft proposal · not sent")).toBeVisible();
});
test("project context becomes reviewable task and persists", async ({
  page,
}) => {
  await page.goto("/discover");
  await page
    .getByRole("button", { name: "Project notes", exact: true })
    .click();
  await page.getByLabel("Project name").fill("Autumn launch");
  await page
    .getByLabel("What are you trying to achieve?")
    .fill("Explain our new feature to customers");
  await page
    .getByLabel("What needs to be delivered?")
    .fill("Six launch slides");
  await page
    .getByLabel("What does “done” look like?")
    .fill("One takeaway per slide");
  await page.getByRole("button", { name: "Create demo suggestions" }).click();
  await expect(
    page.getByText("Template suggestions · not AI-generated"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Review & post" }).nth(1).click();
  await expect(page.getByLabel("Deliverable", { exact: true })).toHaveValue(
    "Six launch slides",
  );
  await page
    .getByLabel("What can you offer in return?")
    .fill("I can edit your email");
  await page.getByRole("button", { name: "Post to my workspace" }).click();
  await expect(
    page.getByRole("heading", { name: "Create Six launch slides" }),
  ).toBeVisible();
  await page.reload();
  await page
    .getByRole("button", { name: "Project notes", exact: true })
    .click();
  await expect(page.getByLabel("Project name")).toHaveValue("Autumn launch");
});
test("drag, keyboard and search work independently", async ({ page }) => {
  await page.goto("/discover");
  const card = page.locator(".swipe-card");
  await card.scrollIntoViewIfNeeded();
  const box = await card.boundingBox();
  await page.mouse.move(box.x + 90, box.y + 100);
  await page.mouse.down();
  await page.mouse.move(box.x + 220, box.y + 100, { steps: 10 });
  await page.mouse.up();
  await expect(
    page.getByRole("heading", { name: "Summarize our customer survey" }),
  ).toBeVisible();
  await page.locator("h1").click();
  await page.keyboard.press("ArrowLeft");
  await expect(
    page.getByRole("heading", { name: "Edit the product launch email" }),
  ).toBeVisible();
  await page.locator("#task-search").fill("no such task");
  await expect(
    page.getByRole("heading", { name: "No tasks match just yet." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(
    page.getByRole("heading", { name: "Edit the product launch email" }),
  ).toBeVisible();
});
test("mobile has no horizontal overflow and usable nav", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/discover");
  await expect(
    page.getByRole("button", { name: "Interested in task" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "/tmp/taskswap-mobile.png", fullPage: true });
  await page.getByRole("button", { name: "Toggle navigation" }).click();
  await page
    .getByRole("button", { name: "Project notes", exact: true })
    .click();
  await expect(page.getByLabel("Project name")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
test("API rejects incomplete briefs and serves explicit demo mode", async ({
  request,
}) => {
  const bad = await request.post("/api/plan", {
    data: { brief: { title: "No context" } },
  });
  expect(bad.status()).toBe(400);
  const good = await request.post("/api/plan", {
    data: {
      brief: {
        title: "Launch",
        goal: "Explain feature",
        deliverable: "Slides",
        done: "Approved",
        constraints: "No private data",
      },
    },
  });
  expect(good.ok()).toBe(true);
  const body = await good.json();
  expect(body.mode).toBe("demo");
  expect(body.tasks[1].constraints).toBe("No private data");
});
test("desktop visual and modal keyboard dismissal", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/discover");
  await page.screenshot({ path: "/tmp/taskswap-desktop.png", fullPage: true });
  await page.getByRole("button", { name: "Post a task", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
test("landing explains the product and lets users try an example", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "You do the slides. I’ll do the spreadsheet.",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Try saving a preview task" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Olivia’s task saved in this preview.",
  );
  await expect(
    page.getByRole("heading", {
      name: "Find three useful insights in our survey.",
    }),
  ).toBeVisible();
  await page.getByRole("link", { name: "How it works", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Three steps. One fair trade." }),
  ).toBeInViewport();
  await page.getByRole("button", { name: "Open workspace" }).click();
  await expect(page).toHaveURL(/\/discover$/);
  await expect(
    page.getByRole("button", { name: "Interested in task" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Back to home" }).click();
  await expect(page).toHaveURL("http://127.0.0.1:3000/");
  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "Find a task." }),
  ).toBeVisible();
});
test("laptop controls fit screen and arrow keys work after clicking buttons", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/discover");
  await expect(
    page.getByRole("button", { name: "Pass on task" }),
  ).toBeInViewport();
  await expect(
    page.getByRole("button", { name: "Interested in task" }),
  ).toBeInViewport();
  await page.getByRole("button", { name: "Interested in task" }).click();
  await page.keyboard.press("ArrowLeft");
  await expect(
    page.getByRole("heading", { name: "Edit the product launch email" }),
  ).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("heading", { name: "Review our onboarding prototype" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Undo last swipe" }).click();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("heading", { name: "Review our onboarding prototype" }),
  ).toBeVisible();
});
test("trackpad horizontal gestures make one decision per gesture and preserve vertical scrolling", async ({
  page,
}) => {
  await page.goto("/discover");
  await page.locator(".laptop-card").hover();
  await page.mouse.wheel(90, 0);
  await page.mouse.wheel(90, 0);
  await expect(
    page.getByRole("heading", { name: "Summarize our customer survey" }),
  ).toBeVisible();
  // Separate gestures are separated by inactivity, like a physical trackpad.
  await page.waitForTimeout(260);
  await page.mouse.wheel(-90, 0);
  await expect(
    page.getByRole("heading", { name: "Edit the product launch email" }),
  ).toBeVisible();
  await page.mouse.wheel(0, 80);
  await expect(
    page.getByRole("heading", { name: "Edit the product launch email" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /My swaps/ }).click();
  await expect(
    page.getByRole("heading", { name: "Refresh our quarterly presentation" }),
  ).toBeVisible();
});
test("short drags reset and the brief remains clickable after a real drag", async ({
  page,
}) => {
  await page.goto("/discover");
  const card = page.locator(".laptop-card");
  let box = await card.boundingBox();
  await page.mouse.move(box.x + 60, box.y + 70);
  await page.mouse.down();
  await page.mouse.move(box.x + 85, box.y + 70, { steps: 5 });
  await page.mouse.up();
  await expect(
    page.getByRole("heading", { name: "Refresh our quarterly presentation" }),
  ).toBeVisible();
  await expect(card).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");
  box = await card.boundingBox();
  await page.mouse.move(box.x + 100, box.y + 70);
  await page.mouse.down();
  await page.mouse.move(box.x + 20, box.y + 70, { steps: 5 });
  await page.mouse.up();
  await expect(
    page.getByRole("heading", { name: "Summarize our customer survey" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "View full brief", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("heading", { name: "Summarize our customer survey" }),
  ).toBeVisible();
});
test("reviewing passed tasks keeps saved tasks and search typing cannot swipe", async ({
  page,
}) => {
  await page.goto("/discover");
  await page.getByRole("button", { name: "Interested in task" }).click();
  await page.getByRole("button", { name: "Pass on task" }).click();
  await page
    .getByRole("button", { name: "Review passed tasks", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Summarize our customer survey" }),
  ).toBeVisible();
  await page.getByRole("textbox", { name: "Search tasks" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("heading", { name: "Summarize our customer survey" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /My swaps/ }).click();
  await expect(
    page.getByRole("heading", { name: "Refresh our quarterly presentation" }),
  ).toBeVisible();
});
test("landing and workspace remain usable on mobile and small laptops", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Open workspace" }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Interested in task" }).click();
  await expect(
    page.getByRole("heading", { name: "Summarize our customer survey" }),
  ).toBeVisible();
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/discover");
  await expect(
    page.getByRole("button", { name: "Interested in task" }),
  ).toBeInViewport();
});
test("landing visual has no runtime errors", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.screenshot({ path: "/tmp/taskswap-landing.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "/tmp/taskswap-landing-mobile.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
