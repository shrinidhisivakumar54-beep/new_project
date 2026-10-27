import test from "node:test";
import assert from "node:assert/strict";
import { demoTasks, sampleExchanges } from "../src/demo-data.js";
import {
  exchangeFromDraft,
  changeExchange,
  resetDemoDecisions,
  restoreSampleExchanges,
} from "../src/exchanges.js";
test("demo includes 20 complete tasks, 8 teammates, and balanced example stages", () => {
  assert.equal(demoTasks.length, 20);
  assert.equal(new Set(demoTasks.map((t) => t.id)).size, 20);
  assert.equal(new Set(demoTasks.map((t) => t.owner)).size, 8);
  for (const task of demoTasks)
    for (const field of [
      "title",
      "description",
      "deliverable",
      "done",
      "constraints",
      "owner",
      "offer",
    ])
      assert.ok(task[field]);
  for (const stage of ["Proposed", "In progress", "Done"])
    assert.equal(sampleExchanges.filter((e) => e.status === stage).length, 2);
  for (const e of sampleExchanges) {
    assert.equal(e.legs.length, 2);
    assert.equal(e.legs[0].for, e.legs[1].name);
    assert.equal(e.legs[1].for, e.legs[0].name);
  }
});
test("sample deck reset preserves decisions on user-created and unknown tasks", () => {
  const original = {
    s1: "liked",
    s20: "passed",
    mine: "liked",
    other: "passed",
  };
  assert.deepEqual(resetDemoDecisions(original, demoTasks), {
    mine: "liked",
    other: "passed",
  });
  assert.equal(original.s1, "liked");
});
test("restoring examples preserves custom exchanges and does not duplicate samples", () => {
  const own = { id: "custom", origin: "draft" };
  const result = restoreSampleExchanges(
    [...sampleExchanges, own],
    sampleExchanges,
  );
  assert.equal(result.length, 7);
  assert.equal(result.at(-1), own);
  assert.equal(restoreSampleExchanges(result, sampleExchanges).length, 7);
});
test("draft conversion retains both directions and stable source identity", () => {
  const d = {
    id: "draft-1",
    title: demoTasks[0].title,
    offer: "Review my report",
    timing: "Friday",
    done: demoTasks[0].done,
  };
  const e = exchangeFromDraft(d, demoTasks[0], "local-id");
  assert.equal(e.draftId, d.id);
  assert.equal(e.status, "Proposed");
  assert.equal(e.legs[0].name, "Jamie Davis");
  assert.equal(e.legs[0].for, "Olivia Chen");
  assert.equal(e.legs[1].name, "Olivia Chen");
  assert.equal(e.legs[1].for, "Jamie Davis");
  assert.equal(e.legs[1].task, d.offer);
  assert.ok(e.legs.every((l) => !l.done));
});
test("exchange requires agreement and both deliveries; updates do not mutate original examples", () => {
  const original = sampleExchanges[0];
  assert.throws(() =>
    changeExchange(original, { type: "start", confirmed: false }),
  );
  assert.throws(() =>
    changeExchange(original, { type: "leg", index: 0, done: true }),
  );
  let e = changeExchange(original, { type: "start", confirmed: true });
  assert.equal(original.status, "Proposed");
  assert.throws(() => changeExchange(e, { type: "complete" }));
  e = changeExchange(e, { type: "leg", index: 0, done: true });
  assert.throws(() => changeExchange(e, { type: "complete" }));
  assert.equal(original.legs[0].done, false);
  e = changeExchange(e, { type: "leg", index: 1, done: true });
  e = changeExchange(e, { type: "complete" });
  assert.equal(e.status, "Done");
  assert.equal(e.activity.length, 5);
  assert.throws(() =>
    changeExchange(e, { type: "leg", index: 0, done: false }),
  );
});
