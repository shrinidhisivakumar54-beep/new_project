export function resetDemoDecisions(decisions, tasks) {
  const ids = new Set(tasks.map((t) => t.id));
  return Object.fromEntries(
    Object.entries(decisions).filter(([id]) => !ids.has(id)),
  );
}
export function restoreSampleExchanges(current, samples) {
  return [...samples, ...current.filter((e) => e.origin !== "sample")];
}
export function exchangeFromDraft(draft, source, id) {
  const owner =
    source?.owner === "You"
      ? "Project owner"
      : source?.owner || draft.owner || "Sample teammate";
  return {
    id,
    draftId: draft.id,
    origin: "draft",
    status: "Proposed",
    timing: draft.timing,
    criteria:
      draft.done ||
      source?.done ||
      "Both owners review the agreed deliverables.",
    legs: [
      {
        name: "Jamie Davis",
        initials: "JD",
        color: "rose",
        task: draft.title,
        for: owner,
        done: false,
      },
      {
        name: owner,
        initials: source?.initials || draft.initials || "ST",
        color: source?.color || "sage",
        task: draft.offer,
        for: "Jamie Davis",
        done: false,
      },
    ],
    activity: [
      {
        text: "Added from your local trade draft. No request was sent.",
        at: new Date().toISOString(),
      },
    ],
  };
}
export function changeExchange(exchange, action) {
  const record = (text) => [
    ...exchange.activity,
    { text, at: new Date().toISOString() },
  ];
  if (action.type === "start") {
    if (exchange.status !== "Proposed" || !action.confirmed)
      throw new Error("Confirm the simulated agreement before starting.");
    return {
      ...exchange,
      status: "In progress",
      activity: record("Demo agreement confirmed; exchange started locally."),
    };
  }
  if (action.type === "leg") {
    if (
      exchange.status !== "In progress" ||
      ![0, 1].includes(action.index) ||
      typeof action.done !== "boolean"
    )
      throw new Error("Only active exchange tasks can be updated.");
    return {
      ...exchange,
      legs: exchange.legs.map((leg, i) =>
        i === action.index ? { ...leg, done: action.done } : leg,
      ),
      activity: record(
        `${exchange.legs[action.index].name}’s delivery marked ${action.done ? "ready" : "not ready"} in this demo.`,
      ),
    };
  }
  if (action.type === "complete") {
    if (
      exchange.status !== "In progress" ||
      exchange.legs.length !== 2 ||
      !exchange.legs.every((l) => l.done)
    )
      throw new Error(
        "Both deliveries must be marked ready before completing the exchange.",
      );
    return {
      ...exchange,
      status: "Done",
      activity: record("Both deliveries confirmed; demo exchange completed."),
    };
  }
  throw new Error("Unknown exchange action.");
}
