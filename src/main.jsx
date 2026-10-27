import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeftRight,
  LayoutGrid,
  Layers,
  FileText,
  Plus,
  Search,
  Bell,
  ChevronDown,
  Clock3,
  X,
  Heart,
  RotateCcw,
  Check,
  Sparkles,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  Bookmark,
  Menu,
  Trash2,
  Lightbulb,
  WandSparkles,
  Coffee,
  Users,
} from "lucide-react";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/manrope/700.css";
import "@fontsource/manrope/800.css";
import "./styles.css";
import Landing from "./Landing";
import { demoTasks as seeds, sampleExchanges } from "./demo-data";
import TeamBoard, { ExchangeDetails } from "./TeamBoard";
import {
  exchangeFromDraft,
  changeExchange,
  resetDemoDecisions,
  restoreSampleExchanges,
} from "./exchanges";
import "./team.css";
import "./redesign.css";
import "./professional.css";
const blankBrief = {
  title: "",
  goal: "",
  deliverable: "",
  deadline: "",
  constraints: "",
  done: "",
};
function read(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return v ?? fallback;
  } catch {
    return fallback;
  }
}
function useSaved(key, fallback) {
  const [value, set] = useState(() => read(key, fallback));
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);
  return [value, set];
}
function IconButton({ label, children, ...props }) {
  return (
    <button className="icon-button" aria-label={label} title={label} {...props}>
      {children}
    </button>
  );
}
function Modal({ title, onClose, children }) {
  const ref = useRef();
  useEffect(() => {
    const prev = document.activeElement;
    const el = ref.current;
    el?.querySelector("button,input,textarea,select")?.focus();
    function key(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const all = [
          ...el.querySelectorAll("button,input,textarea,select,a[href]"),
        ].filter((n) => !n.disabled);
        const first = all[0],
          last = all.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      prev?.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        ref={ref}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="modal-head">
          <h2>{title}</h2>
          <IconButton label="Close dialog" onClick={onClose}>
            <X size={20} />
          </IconButton>
        </div>
        {children}
      </section>
    </div>
  );
}
function App() {
  const [page, setPage] = useState(
      () =>
        ({
          "/discover": "discover",
          "/board": "board",
          "/notes": "notes",
          "/team": "team",
        })[window.location.pathname] || "home",
    ),
    [mobile, setMobile] = useState(false),
    [filter, setFilter] = useState("All tasks"),
    [search, setSearch] = useState("");
  const [decisions, setDecisions] = useSaved("taskswap-decisions", {}),
    [custom, setCustom] = useSaved("taskswap-tasks", []),
    [trades, setTrades] = useSaved("taskswap-trades", []),
    [brief, setBrief] = useSaved("taskswap-brief", blankBrief),
    [exchanges, setExchanges] = useSaved("taskswap-exchanges", sampleExchanges);
  const [history, setHistory] = useState([]),
    [modal, setModal] = useState(null),
    [toast, setToast] = useState(""),
    [tab, setTab] = useState("Saved tasks"),
    [busy, setBusy] = useState(false),
    [plan, setPlan] = useState(null),
    [error, setError] = useState(""),
    [ai, setAi] = useState(false),
    [offset, setOffset] = useState(0),
    [dragging, setDragging] = useState(false);
  const start = useRef(null),
    toastTimer = useRef(),
    deckRef = useRef(null),
    wheelTimer = useRef(null),
    wheelState = useRef({ total: 0, locked: false }),
    decideRef = useRef(null);
  useEffect(() => {
    const pop = () => {
      setPage(
        {
          "/discover": "discover",
          "/board": "board",
          "/notes": "notes",
          "/team": "team",
        }[location.pathname] || "home",
      );
      setModal(null);
    };
    window.addEventListener("popstate", pop);
    return () => window.removeEventListener("popstate", pop);
  }, []);
  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => setAi(d.aiConfigured))
      .catch(() => {});
  }, []);
  const notify = (text) => {
    setToast(text);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 4500);
  };
  const safeCustom = Array.isArray(custom) ? custom : [];
  const all = [...safeCustom, ...seeds];
  const remaining = all.filter(
    (t) =>
      !decisions[t.id] &&
      (filter === "All tasks" || t.category === filter) &&
      `${t.title} ${t.description} ${t.skills?.join(" ") || ""}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const task = remaining[0],
    saved = all.filter((t) => decisions[t.id] === "liked");
  const navigate = (p) => {
    setPage(p);
    setMobile(false);
    setSearch("");
    setOffset(0);
    start.current = null;
    setDragging(false);
    window.history.pushState(null, "", p === "home" ? "/" : "/" + p);
    window.scrollTo(0, 0);
  };
  function decide(type) {
    if (!task) return;
    setHistory((h) => [...h, { id: task.id, previous: decisions[task.id] }]);
    setDecisions((d) => ({ ...d, [task.id]: type }));
    setOffset(0);
    notify(
      type === "liked"
        ? "Task saved. Open My swaps to propose an exchange."
        : "Passed — next task. You can undo this.",
    );
  }
  function undo() {
    const last = history.at(-1);
    if (!last) return;
    setDecisions((d) => {
      const next = { ...d };
      if (last.previous) next[last.id] = last.previous;
      else delete next[last.id];
      return next;
    });
    setHistory((h) => h.slice(0, -1));
    notify("Last swipe undone.");
  }
  decideRef.current = decide;
  useEffect(() => {
    function key(e) {
      if (
        page !== "discover" ||
        modal ||
        e.repeat ||
        e.ctrlKey ||
        e.altKey ||
        e.metaKey ||
        e.target.closest?.('input,textarea,select,[contenteditable="true"]')
      )
        return;
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        decideRef.current(e.key === "ArrowLeft" ? "passed" : "liked");
      }
    }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [page, modal]);
  useEffect(() => {
    const deck = deckRef.current;
    if (!deck || page !== "discover" || modal) return;
    const wheel = (e) => {
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY) * 1.2 || !e.deltaX) return;
      e.preventDefault();
      clearTimeout(wheelTimer.current);
      wheelTimer.current = setTimeout(() => {
        wheelState.current = { total: 0, locked: false };
        setOffset(0);
      }, 220);
      if (wheelState.current.locked) return;
      wheelState.current.total += e.deltaX * (e.deltaMode === 1 ? 16 : 1);
      setOffset(Math.max(-120, Math.min(120, wheelState.current.total)));
      if (Math.abs(wheelState.current.total) >= 70) {
        const direction = wheelState.current.total > 0 ? "liked" : "passed";
        wheelState.current.locked = true;
        decideRef.current(direction);
      }
    };
    deck.addEventListener("wheel", wheel, { passive: false });
    return () => {
      deck.removeEventListener("wheel", wheel);
      clearTimeout(wheelTimer.current);
      wheelState.current = { total: 0, locked: false };
    };
  }, [page, modal, Boolean(task)]);
  function resetPassed() {
    setDecisions((d) =>
      Object.fromEntries(Object.entries(d).filter(([, v]) => v !== "passed")),
    );
    setHistory([]);
    notify(
      "Passed tasks are back in the deck. Your saved tasks are unchanged.",
    );
  }
  async function generate(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const r = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not create suggestions.");
      setPlan(d);
      notify(
        d.mode === "ai"
          ? "AI suggestions are ready to review."
          : "Demo suggestions are ready to review.",
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  function publish(t) {
    const item = {
      ...t,
      id: crypto.randomUUID(),
      owner: "You",
      initials: "JD",
      role: "Your workspace",
      color: "rose",
      offer: t.offer || "Let’s agree on a fair exchange",
      skills: [t.category, "Collaboration"],
      deadline: t.deadline || brief.deadline || "Flexible",
      project: t.project || brief.title || "Independent task",
      art: "review",
      tagline: "A small contribution. A shared win.",
    };
    setCustom((ts) => [item, ...ts]);
    notify("Task posted to your local workspace.");
    return item;
  }
  function addDraftToTeam(draft) {
    const existing = exchanges.find((e) => e.draftId === draft.id);
    if (existing) {
      navigate("team");
      setModal({ type: "exchange", id: existing.id });
      return;
    }
    const source =
      all.find((t) => t.id === draft.taskId) ||
      all.find((t) => t.title === draft.title);
    const entry = exchangeFromDraft(
      draft,
      source,
      `SW-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    );
    setExchanges((es) => [entry, ...es]);
    navigate("team");
    setModal({ type: "exchange", id: entry.id });
    notify("Added to the local team demo. Nothing was sent.");
  }
  function updateExchange(id, action) {
    const current = exchanges.find((e) => e.id === id);
    const updated = changeExchange(current, action);
    setExchanges((es) => es.map((e) => (e.id === id ? updated : e)));
    if (action.type === "start" || action.type === "complete")
      notify(
        action.type === "start"
          ? "Demo exchange is now in progress."
          : "Both deliveries confirmed. Demo exchange completed.",
      );
  }
  if (page === "home")
    return (
      <Landing
        onEnter={() => navigate("discover")}
        onTeam={() => navigate("team")}
      />
    );
  const nav = [
    ["discover", LayoutGrid, "Find tasks"],
    ["board", Layers, "My swaps"],
    ["team", Users, "Team board"],
    ["notes", FileText, "Project notes"],
  ];
  return (
    <div
      className={"app-shell " + (page === "discover" ? "discover-page" : "")}
    >
      <aside className={"sidebar " + (mobile ? "open" : "")}>
        <a
          href="#"
          className="brand"
          onClick={(e) => {
            e.preventDefault();
            navigate("home");
          }}
        >
          <span className="brand-mark">
            <ArrowLeftRight size={23} />
          </span>
          taskswap<span className="brand-period">.</span>
        </a>
        <div className="workspace">
          <span className="workspace-icon">S</span>
          <div>
            <strong>Studio workspace</strong>
            <small>Demo v1.3 · local workspace</small>
          </div>
          <ChevronDown size={15} />
        </div>
        <button className="back-home" onClick={() => navigate("home")}>
          <ArrowLeft size={14} />
          Back to home
        </button>
        <p className="nav-label">WORKSPACE</p>
        <nav>
          {nav.map(([id, Icon, label]) => (
            <button
              key={id}
              aria-label={label}
              aria-current={page === id ? "page" : undefined}
              className={"nav-item " + (page === id ? "active" : "")}
              onClick={() => navigate(id)}
            >
              <Icon size={19} />
              <span className="nav-copy">
                <span>{label}</span>
                <small>
                  {id === "discover"
                    ? "1 · Browse and save"
                    : id === "board"
                      ? "2 · Propose an exchange"
                      : id === "team"
                        ? "3 · Who’s doing what"
                        : "Optional · project context"}
                </small>
              </span>
              {id === "board" && saved.length > 0 && (
                <b className="nav-count">{saved.length}</b>
              )}
              {id === "notes" && <span className="tiny-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-card">
          <h3>New to TaskSwap?</h3>
          <p>Start with a small task and agree on a fair exchange.</p>
          <button onClick={() => setModal({ type: "how" })}>
            How swapping works <ArrowUpRight size={15} />
          </button>
        </div>
        <div className="sidebar-bottom">
          <span className="avatar mine">JD</span>
          <div>
            <strong>Jamie Davis</strong>
            <small>Demo profile</small>
          </div>
          <IconButton
            label="About this workspace"
            onClick={() => setModal({ type: "about" })}
          >
            <ChevronDown size={16} />
          </IconButton>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-menu icon-button"
              aria-label="Toggle navigation"
              onClick={() => setMobile(!mobile)}
            >
              <Menu size={21} />
            </button>
            <span>Your workspace</span>
            <span className="slash">/</span>
            <strong>
              {page === "discover"
                ? "Find tasks"
                : page === "board"
                  ? "My swaps"
                  : page === "team"
                    ? "Team board"
                    : "Project notes"}
            </strong>
          </div>
          <div className="top-actions">
            <button
              className="presenter-button"
              onClick={() => setModal({ type: "demo" })}
            >
              <RotateCcw size={14} />
              Demo controls
            </button>
            <span className="demo-badge">
              <span /> Demo v1.3
            </span>
            <IconButton
              label="Workspace updates"
              onClick={() => setModal({ type: "updates" })}
            >
              <Bell size={19} />
            </IconButton>
            <span className="top-divider" />
            <span className="avatar mine small">JD</span>
          </div>
        </header>
        <main>
          {page === "discover" && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">THE EXCHANGE BOARD</div>
                  <h1>
                    Find a task<span>.</span>
                  </h1>
                  <p>
                    Save a task you’d enjoy. Then offer a fair exchange in My
                    swaps.
                  </p>
                </div>
                <button
                  className="primary"
                  onClick={() => setModal({ type: "post" })}
                >
                  <Plus size={18} />
                  Post a task
                </button>
              </div>
              <div className="discover-toolbar">
                <div className="chips">
                  {["All tasks", "Design", "Writing", "Data", "Review"].map(
                    (f) => (
                      <button
                        key={f}
                        className={"chip " + (filter === f ? "selected" : "")}
                        aria-pressed={filter === f}
                        onClick={() => setFilter(f)}
                      >
                        {f}
                      </button>
                    ),
                  )}
                </div>
                <label className="desktop-search">
                  <Search size={16} />
                  <input
                    id="task-search"
                    aria-label="Search tasks"
                    placeholder="Search tasks or skills"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <IconButton
                      label="Clear search"
                      onClick={() => setSearch("")}
                    >
                      <X size={15} />
                    </IconButton>
                  )}
                </label>
              </div>
              <div className="exchange-layout">
                <section className="exchange-deck">
                  <div className="deck-meta">
                    <span>
                      {remaining.length}{" "}
                      {remaining.length === 1 ? "task" : "tasks"} to explore
                    </span>
                    <button
                      onClick={resetPassed}
                      disabled={!Object.values(decisions).includes("passed")}
                    >
                      <RotateCcw size={13} />
                      Review passed tasks
                    </button>
                  </div>
                  <div ref={deckRef} className="deck-surface">
                    {task ? (
                      <article
                        key={task.id}
                        tabIndex={0}
                        aria-label="Task card. Drag left to pass or right if interested."
                        className={
                          "swipe-card laptop-card " +
                          (dragging ? "dragging" : "")
                        }
                        style={{
                          transform: `translateX(${offset}px) rotate(${offset / 40}deg)`,
                        }}
                        onDragStart={(e) => e.preventDefault()}
                        onPointerDown={(e) => {
                          if (
                            e.button !== 0 ||
                            e.target.closest("button,a,input")
                          )
                            return;
                          if (e.pointerType === "mouse") e.preventDefault();
                          start.current = { x: e.clientX, y: e.clientY };
                          setDragging(true);
                          e.currentTarget.focus({ preventScroll: true });
                          e.currentTarget.setPointerCapture(e.pointerId);
                        }}
                        onPointerMove={(e) => {
                          if (start.current) {
                            const dx = e.clientX - start.current.x;
                            if (Math.abs(dx) > 5)
                              setOffset(Math.max(-180, Math.min(180, dx)));
                          }
                        }}
                        onPointerUp={(e) => {
                          if (!start.current) return;
                          const dx = e.clientX - start.current.x,
                            dy = e.clientY - start.current.y;
                          start.current = null;
                          setDragging(false);
                          if (
                            Math.abs(dx) >= 60 &&
                            Math.abs(dx) > Math.abs(dy) * 1.2
                          )
                            decide(dx > 0 ? "liked" : "passed");
                          else setOffset(0);
                        }}
                        onLostPointerCapture={() => {
                          start.current = null;
                          setDragging(false);
                          setOffset(0);
                        }}
                        onPointerCancel={() => {
                          start.current = null;
                          setDragging(false);
                          setOffset(0);
                        }}
                      >
                        {Math.abs(offset) > 25 && (
                          <span
                            className={
                              "swipe-stamp " + (offset > 0 ? "yes" : "no")
                            }
                          >
                            {offset > 0 ? "SAVED" : "PASS"}
                          </span>
                        )}
                        <div className="laptop-card-header">
                          <span className={"category " + task.color}>
                            {task.category}
                          </span>
                          <span>
                            <Clock3 size={14} />
                            {task.effort}
                          </span>
                        </div>
                        <div className="laptop-card-content">
                          <p className="task-project">{task.project}</p>
                          <h2>{task.title}</h2>
                          <p className="task-description">{task.description}</p>
                          <div className="skill-tags">
                            {task.skills?.map((s) => (
                              <span key={s}>{s}</span>
                            ))}
                          </div>
                        </div>
                        <div className="laptop-owner">
                          <span className={"avatar " + task.color}>
                            {task.initials}
                          </span>
                          <div>
                            <strong>{task.owner}</strong>
                            <span>
                              {task.role}
                              {task.owner !== "You" ? " · Sample teammate" : ""}
                            </span>
                          </div>
                          <span className="task-due">{task.deadline}</span>
                        </div>
                        <div className="laptop-offer">
                          <span>
                            <ArrowLeftRight size={16} />
                            IN RETURN
                          </span>
                          <strong>{task.offer}</strong>
                        </div>
                      </article>
                    ) : (
                      <div className="empty-state">
                        <CheckCircle2 size={34} />
                        <h2>
                          {search || filter !== "All tasks"
                            ? "No tasks match just yet."
                            : "You’ve reviewed every task."}
                        </h2>
                        <p>
                          {search || filter !== "All tasks"
                            ? "Try another search or category."
                            : saved.length
                              ? `${saved.length} tasks are in your saved list. Choose one to propose a swap.`
                              : "You can bring back passed tasks or replay the sample deck."}
                        </p>
                        {search || filter !== "All tasks" ? (
                          <button
                            className="secondary"
                            onClick={() => {
                              setSearch("");
                              setFilter("All tasks");
                            }}
                          >
                            Clear filters
                          </button>
                        ) : (
                          <div className="empty-actions">
                            {saved.length > 0 && (
                              <button
                                className="primary"
                                onClick={() => {
                                  setTab("Saved tasks");
                                  navigate("board");
                                }}
                              >
                                View saved tasks
                                <ArrowRight size={15} />
                              </button>
                            )}
                            {Object.values(decisions).includes("passed") && (
                              <button
                                className="secondary"
                                onClick={resetPassed}
                              >
                                Review passed tasks
                              </button>
                            )}
                            <button
                              className="text-button"
                              onClick={() => setModal({ type: "demo" })}
                            >
                              Replay demo tasks
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div
                    className="desktop-swipe-controls"
                    aria-label="Task decisions"
                  >
                    <button
                      className="decision-button decision-pass"
                      aria-label="Pass on task"
                      onClick={() => decide("passed")}
                      disabled={!task}
                    >
                      <X size={20} />
                      <span>Pass</span>
                      <kbd>←</kbd>
                    </button>
                    <button
                      className="decision-undo"
                      aria-label="Undo last swipe"
                      onClick={undo}
                      disabled={!history.length}
                    >
                      <RotateCcw size={17} />
                      <span>Undo</span>
                    </button>
                    <button
                      className="decision-button decision-interested"
                      aria-label="Interested in task"
                      onClick={() => decide("liked")}
                      disabled={!task}
                    >
                      <span>Save task</span>
                      <kbd>→</kbd>
                      <ArrowRight size={19} />
                    </button>
                  </div>
                  {saved.length > 0 && (
                    <div className="saved-next-step">
                      <span>
                        <CheckCircle2 size={15} />
                        {saved.length} saved · ready to propose a swap?
                      </span>
                      <button
                        onClick={() => {
                          setTab("Saved tasks");
                          navigate("board");
                        }}
                      >
                        Review saved tasks
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  )}
                  <p className="desktop-control-hint">
                    Click a button or use <kbd>←</kbd> <kbd>→</kbd>. You can
                    also drag the card or swipe horizontally on your trackpad.
                  </p>
                </section>
                <aside className="task-context">
                  <div className="context-heading">
                    <FileText size={17} />
                    <h2>The details</h2>
                    {task && (
                      <button
                        onClick={() => setModal({ type: "details", task })}
                        aria-label="View full task brief"
                      >
                        <ArrowUpRight size={17} />
                      </button>
                    )}
                  </div>
                  {task ? (
                    <>
                      <dl>
                        <div>
                          <dt>The deliverable</dt>
                          <dd>{task.deliverable}</dd>
                        </div>
                        <div>
                          <dt>What “done” looks like</dt>
                          <dd>{task.done}</dd>
                        </div>
                        <div>
                          <dt>Before you start</dt>
                          <dd>{task.constraints}</dd>
                        </div>
                      </dl>
                      <button
                        className="context-brief-link"
                        onClick={() => setModal({ type: "details", task })}
                      >
                        View full brief
                        <ArrowUpRight size={15} />
                      </button>
                    </>
                  ) : (
                    <p className="context-empty">
                      Select a category or review passed tasks to keep
                      exploring.
                    </p>
                  )}
                  <div className="context-project">
                    <span>HAVE A BIGGER PROJECT?</span>
                    <p>
                      Start with the brief. Break it into tasks someone can pick
                      up.
                    </p>
                    <button onClick={() => navigate("notes")}>
                      Add project notes
                      <ArrowRight size={15} />
                    </button>
                  </div>
                  <p className="context-disclaimer">
                    <ShieldCheck size={15} />
                    Saving keeps a task in My swaps. It doesn’t assign work or
                    send a request.
                  </p>
                </aside>
              </div>
            </>
          )}
          {page === "team" && (
            <TeamBoard
              exchanges={exchanges}
              onOpen={(id) => setModal({ type: "exchange", id })}
              onBrowse={() => navigate("discover")}
            />
          )}
          {page === "board" && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">YOUR SAVED WORK</div>
                  <h1>
                    My swaps<span>.</span>
                  </h1>
                  <p>
                    Choose a saved task, say what you need in return, and create
                    a demo swap.
                  </p>
                </div>
                <button
                  className="primary"
                  onClick={() => setModal({ type: "post" })}
                >
                  <Plus size={18} />
                  Post a task
                </button>
              </div>
              <div className="board-tabs">
                {["Saved tasks", "My tasks", "Trade drafts"].map((t) => (
                  <button
                    className={tab === t ? "active" : ""}
                    onClick={() => setTab(t)}
                    key={t}
                  >
                    {t}
                    <span>
                      {t === "Saved tasks"
                        ? saved.length
                        : t === "My tasks"
                          ? safeCustom.length
                          : trades.length}
                    </span>
                  </button>
                ))}
              </div>
              <div className="local-notice">
                <ShieldCheck size={16} /> This is your local board. Draft trades
                are not sent to teammates.
              </div>
              <div className="board-grid">
                {(tab === "Saved tasks"
                  ? saved
                  : tab === "My tasks"
                    ? safeCustom
                    : trades
                ).map((t) =>
                  tab === "Trade drafts" ? (
                    <article className="board-card" key={t.id}>
                      <span className="category rose">
                        Draft proposal · not sent
                      </span>
                      <h2>{t.title}</h2>
                      <p>
                        <strong>You do:</strong> {t.title}
                      </p>
                      <p>
                        <strong>You get help with:</strong> {t.offer}
                      </p>
                      <p>When should both tasks be ready?: {t.timing}</p>
                      <button
                        className="secondary"
                        onClick={() => addDraftToTeam(t)}
                      >
                        {exchanges.some((e) => e.draftId === t.id)
                          ? "View on team board"
                          : "Create demo swap"}
                        <ArrowRight size={15} />
                      </button>
                      <div className="acceptance">
                        <strong>Definition of done</strong>
                        <p>{t.done}</p>
                      </div>
                      <button
                        className="text-button"
                        onClick={() => {
                          setTrades((ts) => ts.filter((x) => x.id !== t.id));
                          notify("Trade draft removed.");
                        }}
                      >
                        <Trash2 size={15} />
                        Remove draft
                      </button>
                    </article>
                  ) : (
                    <article className="board-card" key={t.id}>
                      <div className="board-card-top">
                        <span className={"category " + t.color}>
                          {t.category}
                        </span>
                        <span className="effort">
                          <Clock3 size={14} />
                          {t.effort}
                        </span>
                      </div>
                      <h2>{t.title}</h2>
                      <p>{t.description}</p>
                      <div className="board-person">
                        <span className={"avatar " + t.color}>
                          {t.initials}
                        </span>
                        <span>
                          {t.owner}
                          {t.owner !== "You" ? " · Sample teammate" : ""}
                        </span>
                      </div>
                      <button
                        className="secondary"
                        onClick={() =>
                          setModal({
                            type: tab === "My tasks" ? "details" : "trade",
                            task: t,
                          })
                        }
                      >
                        {tab === "My tasks" ? "View brief" : "Propose swap"}
                        <ArrowUpRight size={16} />
                      </button>
                      <button
                        className="text-button"
                        onClick={() => {
                          if (tab === "My tasks") {
                            setCustom((ts) => ts.filter((x) => x.id !== t.id));
                          } else
                            setDecisions((d) => ({ ...d, [t.id]: "passed" }));
                          notify("Removed from this board.");
                        }}
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>
                    </article>
                  ),
                )}
              </div>
              {(tab === "Saved tasks"
                ? saved
                : tab === "My tasks"
                  ? safeCustom
                  : trades
              ).length === 0 && (
                <div className="empty-state">
                  <Bookmark size={34} />
                  <h2>A little room for possibility.</h2>
                  <p>
                    {tab === "Saved tasks"
                      ? "Swipe right on something you’d enjoy. It’ll be waiting here."
                      : tab === "My tasks"
                        ? "Post a small, well-defined task you’d like help with."
                        : "Build a trade from a saved task to see your drafts here."}
                  </p>
                  <button
                    className="primary"
                    onClick={() =>
                      tab === "My tasks"
                        ? setModal({ type: "post" })
                        : navigate("discover")
                    }
                  >
                    {tab === "My tasks" ? "Post a task" : "Explore tasks"}
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
          {page === "notes" && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">
                    <Sparkles size={13} /> PROJECT CONTEXT
                  </div>
                  <h1>
                    Start with a clear brief<span>.</span>
                  </h1>
                  <p>
                    Give your project some context. Find the pieces someone else
                    could help with.
                  </p>
                </div>
              </div>
              <div className="notes-grid">
                <form className="brief-form" onSubmit={generate}>
                  <div className="form-title">
                    <FileText size={20} />
                    <h2>Your project brief</h2>
                    <span>
                      <Check size={13} /> Saved on this device
                    </span>
                  </div>
                  <label>
                    Project name{" "}
                    <input
                      required
                      maxLength={120}
                      placeholder="e.g. Our autumn product launch"
                      value={brief.title}
                      onChange={(e) =>
                        setBrief({ ...brief, title: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    What are you trying to achieve?
                    <textarea
                      required
                      maxLength={6000}
                      placeholder="The goal, the audience, and why it matters…"
                      value={brief.goal}
                      onChange={(e) =>
                        setBrief({ ...brief, goal: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    What needs to be delivered?
                    <textarea
                      required
                      maxLength={6000}
                      placeholder="e.g. A 6-slide launch deck using our existing brand kit"
                      value={brief.deliverable}
                      onChange={(e) =>
                        setBrief({ ...brief, deliverable: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    When do you need it?{" "}
                    <span className="optional">optional</span>
                    <input
                      maxLength={120}
                      placeholder="e.g. Next Thursday, flexible by a day"
                      value={brief.deadline}
                      onChange={(e) =>
                        setBrief({ ...brief, deadline: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Constraints & permissions{" "}
                    <span className="optional">optional</span>
                    <textarea
                      maxLength={6000}
                      placeholder="What must stay unchanged? What access or approval is needed?"
                      value={brief.constraints}
                      onChange={(e) =>
                        setBrief({ ...brief, constraints: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    What does “done” look like?
                    <textarea
                      required
                      maxLength={6000}
                      placeholder="Specific checks that tell a teammate the work is complete…"
                      value={brief.done}
                      onChange={(e) =>
                        setBrief({ ...brief, done: e.target.value })
                      }
                    />
                  </label>
                  <div className="privacy-note">
                    <ShieldCheck size={16} />
                    <span>
                      {ai
                        ? "Generating sends this brief to the configured AI provider. Only include information you are permitted to share."
                        : "Demo mode: no AI provider is connected. Suggestions use a simple template, not AI. Your brief is processed by this app."}{" "}
                      Notes are stored in this browser; avoid confidential
                      information.
                    </span>
                  </div>
                  {error && (
                    <p className="error" role="alert">
                      {error}
                    </p>
                  )}
                  <button className="primary" disabled={busy}>
                    <WandSparkles size={17} />
                    {busy
                      ? "Finding the small pieces…"
                      : ai
                        ? "Suggest tasks with AI"
                        : "Create demo suggestions"}
                  </button>
                </form>
                <aside className="notes-side">
                  {!plan ? (
                    <>
                      <section className="match-note">
                        <span className="note-icon">
                          <Lightbulb size={21} />
                        </span>
                        <span className="eyebrow">
                          GOOD CONTEXT IS A SUPERPOWER
                        </span>
                        <h2>A teammate shouldn’t have to read your mind.</h2>
                        <p>
                          A goal, a deliverable, and a clear finish line make a
                          task easier to pick up—and fairer to trade.
                        </p>
                      </section>
                      <div className="example-note">
                        <strong>Instead of “help with the launch”</strong>
                        <p>
                          Try “Review these six slides for clarity. Keep the
                          numbers unchanged. Done when each slide has one clear
                          takeaway.”
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="section-heading">
                        <h2>Pieces worth sharing</h2>
                      </div>
                      <p className="suggestion-mode">
                        <Sparkles size={15} />
                        {plan.mode === "ai"
                          ? "AI suggestions · review before posting"
                          : "Template suggestions · not AI-generated"}
                      </p>
                      {plan.tasks.map((t, i) => (
                        <article className="suggestion-card" key={i}>
                          <span className="category rose">{t.category}</span>
                          <h3>{t.title}</h3>
                          <p>{t.description}</p>
                          <small>{t.effort}</small>
                          <button
                            className="secondary"
                            onClick={() =>
                              setModal({ type: "post", prefill: t })
                            }
                          >
                            Review & post
                            <ArrowUpRight size={15} />
                          </button>
                        </article>
                      ))}
                    </>
                  )}
                </aside>
              </div>
            </>
          )}
          <footer className="main-footer">
            <span>Built for a fair exchange.</span>
            <span>
              taskswap <span className="footer-star">✧</span>
            </span>
          </footer>
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}
      {modal && (
        <Modal
          title={
            modal.type === "exchange"
              ? "The exchange"
              : modal.type === "demo"
                ? "Ready for your walkthrough"
                : modal.type === "post"
                  ? "Post a task"
                  : modal.type === "details"
                    ? "The task brief"
                    : modal.type === "trade"
                      ? "Propose a trade"
                      : modal.type === "how"
                        ? "A little give. A little get."
                        : modal.type === "updates"
                          ? "You’re in good company"
                          : "Your TaskSwap workspace"
          }
          onClose={() => setModal(null)}
        >
          {modal.type === "exchange" && (
            <ExchangeDetails
              key={modal.id}
              exchange={exchanges.find((e) => e.id === modal.id)}
              onChange={updateExchange}
            />
          )}
          {modal.type === "demo" && (
            <div className="demo-control-panel">
              <p>
                A complete walkthrough, ready when you are. All team activity is
                a local simulation.
              </p>
              <div className="demo-counts">
                <span>
                  <strong>{seeds.length}</strong>sample tasks
                </span>
                <span>
                  <strong>{sampleExchanges.length}</strong>sample exchanges
                </span>
                <span>
                  <strong>{new Set(seeds.map((t) => t.owner)).size}</strong>
                  sample teammates
                </span>
              </div>
              <ol>
                <li>
                  <strong>Find tasks:</strong> pass a task, save another, then
                  undo.
                </li>
                <li>
                  <strong>My swaps:</strong> open a saved task, build a trade,
                  and add the draft to the team demo.
                </li>
                <li>
                  <strong>Team board:</strong> start a proposed exchange,
                  confirm both deliveries, and complete it. The task list shows
                  who is doing what.
                </li>
              </ol>
              <div className="demo-reset-section">
                <h3>Replay the sample task deck</h3>
                <p>
                  Bring back all {seeds.length} sample tasks, including saved
                  samples. Your posted tasks, decisions on your own tasks,
                  notes, drafts, and exchanges stay unchanged.
                </p>
                <button
                  className="secondary"
                  onClick={() => {
                    setDecisions((d) => resetDemoDecisions(d, seeds));
                    setHistory([]);
                    setFilter("All tasks");
                    setSearch("");
                    setOffset(0);
                    setModal(null);
                    navigate("discover");
                    notify("Sample deck reset. Your own work is unchanged.");
                  }}
                >
                  <RotateCcw size={15} />
                  Replay sample deck
                </button>
              </div>
              <div className="demo-reset-section">
                <h3>Restore the example team board</h3>
                <p>
                  Reset only the six sample exchanges and their activity.
                  Exchanges you added from drafts and all your own work stay
                  unchanged.
                </p>
                <button
                  className="secondary"
                  onClick={() => {
                    setExchanges((es) =>
                      restoreSampleExchanges(es, sampleExchanges),
                    );
                    setModal(null);
                    navigate("team");
                    notify(
                      "Six sample exchanges restored. Your own exchanges are unchanged.",
                    );
                  }}
                >
                  <RotateCcw size={15} />
                  Restore sample exchanges
                </button>
              </div>
            </div>
          )}
          {modal.type === "post" && (
            <TaskForm
              prefill={
                modal.prefill
                  ? { ...modal.prefill, deadline: brief.deadline || "Flexible" }
                  : undefined
              }
              onSubmit={(t) => {
                publish(t);
                setModal(null);
                navigate("board");
                setTab("My tasks");
              }}
            />
          )}
          {modal.type === "details" && (
            <>
              <span className={"category " + modal.task.color}>
                {modal.task.category}
              </span>
              <h3 className="dialog-task-title">{modal.task.title}</h3>
              <p>{modal.task.description}</p>
              {[
                ["Deliverable", modal.task.deliverable],
                ["Definition of done", modal.task.done],
                ["Constraints & permissions", modal.task.constraints],
                ["Timing", modal.task.deadline],
                ["In return", modal.task.offer],
              ].map(([label, value]) => (
                <div className="brief-detail" key={label}>
                  <strong>{label}</strong>
                  <p>{value}</p>
                </div>
              ))}
              <p className="privacy-note">
                {modal.task.owner === "You"
                  ? "Posted in this local demo only."
                  : "This is a sample task from a fictional teammate."}{" "}
                Scope and permissions must be agreed before work begins.
              </p>
              <button
                className="primary"
                onClick={() => {
                  setDecisions((d) => ({ ...d, [modal.task.id]: "liked" }));
                  setModal(null);
                  notify("Saved to your board.");
                }}
              >
                <Heart size={16} />
                Save task
              </button>
            </>
          )}
          {modal.type === "trade" && (
            <TradeForm
              task={modal.task}
              onSubmit={(trade, createNow) => {
                const draft = {
                  ...trade,
                  id: crypto.randomUUID(),
                  title: modal.task.title,
                  taskId: modal.task.id,
                  owner: modal.task.owner,
                  initials: modal.task.initials,
                  done: modal.task.done,
                };
                setTrades((ts) => [draft, ...ts]);
                if (createNow) addDraftToTeam(draft);
                else {
                  setModal(null);
                  setTab("Trade drafts");
                  notify("Draft saved in My swaps. No message was sent.");
                }
              }}
            />
          )}
          {modal.type === "how" && (
            <div className="how-steps">
              {[
                [
                  Search,
                  "Find your kind of task",
                  "Click Save task or press → to save. Click Pass or press ← to skip. Dragging and horizontal trackpad swipes work too. Undo reverses the last decision.",
                ],
                [
                  ArrowLeftRight,
                  "Agree on a fair exchange",
                  "Build a trade with clear scope, timing, and acceptance criteria.",
                ],
                [
                  ShieldCheck,
                  "Keep people in control",
                  "Nothing is assigned automatically. Get any required approvals before sharing work.",
                ],
              ].map(([Icon, title, copy], i) => (
                <div key={title}>
                  <span>
                    <Icon size={22} />
                  </span>
                  <section>
                    <small>0{i + 1}</small>
                    <h3>{title}</h3>
                    <p>{copy}</p>
                  </section>
                </div>
              ))}
              <p className="local-notice">
                This prototype saves data on your device. Teammates and incoming
                requests are sample content.
              </p>
              <button className="primary" onClick={() => setModal(null)}>
                Find a good swap
                <ArrowRight size={16} />
              </button>
            </div>
          )}
          {modal.type === "updates" && (
            <div className="empty-state compact">
              <Coffee size={35} />
              <h3>A quiet moment.</h3>
              <p>
                No live notifications yet. This local workspace doesn’t send or
                receive teammate requests.
              </p>
              <button className="secondary" onClick={() => setModal(null)}>
                Back to exploring
              </button>
            </div>
          )}
          {modal.type === "about" && (
            <>
              <p>
                You’re exploring TaskSwap as Jamie Davis, a demo profile. Tasks
                from other people are fictional examples.
              </p>
              <div className="brief-detail">
                <strong>What’s working</strong>
                <p>
                  Swipe discovery, saved tasks, project briefs, task posting,
                  local trade drafts, and a simulated team exchange board.
                </p>
              </div>
              <div className="brief-detail">
                <strong>Where your data lives</strong>
                <p>
                  In this browser’s local storage. There are no accounts, shared
                  workspaces, or messages yet. Clearing browser data removes
                  your work.
                </p>
              </div>
              <div className="brief-detail">
                <strong>AI connection</strong>
                <p>
                  {ai
                    ? "A server-side AI connection is configured. Briefs are sent only when you request suggestions."
                    : "Not connected. Project suggestions are labeled templates. A server-side key can enable live AI."}
                </p>
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}
function TaskForm({ prefill = {}, onSubmit }) {
  const [t, setT] = useState({
    title: "",
    category: "Design",
    effort: "30–45 min",
    description: "",
    deliverable: "",
    done: "",
    constraints: "",
    deadline: "This week",
    offer: "",
    ...prefill,
  });
  const field = (
    key,
    label,
    placeholder,
    multiline = false,
    required = true,
  ) => (
    <label>
      {label}
      {multiline ? (
        <textarea
          aria-label={label}
          required={required}
          maxLength={6000}
          value={t[key]}
          placeholder={placeholder}
          onChange={(e) => setT({ ...t, [key]: e.target.value })}
        />
      ) : (
        <input
          aria-label={label}
          required={required}
          maxLength={180}
          value={t[key]}
          placeholder={placeholder}
          onChange={(e) => setT({ ...t, [key]: e.target.value })}
        />
      )}
    </label>
  );
  return (
    <form
      className="dialog-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (
          [t.title, t.description, t.deliverable, t.done, t.offer].some(
            (v) => !v.trim(),
          )
        )
          return;
        onSubmit(t);
      }}
    >
      <p>
        Keep it small, specific, and easy to say yes to. You can review every
        suggestion before posting.
      </p>
      {field("title", "Task title", "e.g. Give six slides a visual refresh")}
      <div className="form-two">
        <label>
          Category
          <select
            value={t.category}
            onChange={(e) => setT({ ...t, category: e.target.value })}
          >
            {[
              "Design",
              "Writing",
              "Data",
              "Review",
              "Strategy",
              "Creative",
              "Other",
            ].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        {field("effort", "Estimated effort", "e.g. 30–45 min")}
      </div>
      {field(
        "description",
        "A little context",
        "What would a teammate need to know?",
        true,
      )}
      {field("deliverable", "Deliverable", "What will they hand back?", true)}
      {field(
        "done",
        "Definition of done",
        "How will you confirm it’s complete?",
        true,
      )}
      {field(
        "constraints",
        "Constraints & permissions",
        "Access, approvals, and things to keep unchanged",
        true,
        false,
      )}
      {field("deadline", "Timing", "e.g. By Thursday")}
      {field(
        "offer",
        "What can you offer in return?",
        "e.g. I can review your copy",
      )}
      <p className="privacy-note">
        <ShieldCheck size={16} />
        Local demo only. Don’t include confidential information. Posting does
        not assign work or grant access.
      </p>
      <button className="primary">
        <Plus size={17} />
        Post to my workspace
      </button>
    </form>
  );
}
function TradeForm({ task, onSubmit }) {
  const [offer, setOffer] = useState(""),
    [timing, setTiming] = useState(""),
    [consent, setConsent] = useState(false);
  return (
    <form
      className="dialog-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (offer.trim() && timing.trim() && consent)
          onSubmit(
            { offer, timing },
            e.nativeEvent.submitter?.value === "create",
          );
      }}
    >
      <div className="trade-preview">
        <span className="eyebrow">YOU’D HELP WITH</span>
        <h3>{task.title}</h3>
        <p>{task.deliverable}</p>
      </div>
      <label>
        What can this teammate help you with?
        <textarea
          required
          maxLength={6000}
          value={offer}
          onChange={(e) => setOffer(e.target.value)}
          placeholder="Describe a similarly sized task, including what done looks like."
        />
      </label>
      <label>
        When should both tasks be ready?
        <input
          required
          maxLength={180}
          value={timing}
          onChange={(e) => setTiming(e.target.value)}
          placeholder="e.g. Both drafts ready by Thursday afternoon"
        />
      </label>
      <label className="checkbox-label">
        <input
          type="checkbox"
          required
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        <span>
          I’ll confirm scope, access, and any required approvals before
          starting.
        </span>
      </label>
      <div className="local-notice">
        Create a demo swap to put both tasks on Team board, or save a draft for
        later. {task.owner !== "You" ? "This teammate is fictional. " : ""}No
        request will be sent.
      </div>
      <div className="proposal-actions">
        <button
          className="secondary"
          type="submit"
          name="destination"
          value="draft"
        >
          <Bookmark size={16} />
          Save draft
        </button>
        <button
          className="primary"
          type="submit"
          name="destination"
          value="create"
        >
          Create demo swap
          <ArrowRight size={16} />
        </button>
      </div>
    </form>
  );
}
createRoot(document.getElementById("root")).render(<App />);
