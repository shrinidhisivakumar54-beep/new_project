import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowLeftRight,
  Check,
  CheckCircle2,
  Clock3,
  Columns3,
  Users,
  Search,
  ShieldCheck,
  FileText,
} from "lucide-react";
export const stages = ["Proposed", "In progress", "Done"];
const stageClass = (s) => s.toLowerCase().replaceAll(" ", "-");
function Person({ leg }) {
  return (
    <span className="exchange-person">
      <span className={"avatar " + leg.color}>{leg.initials}</span>
      <strong>
        {leg.name}
        {leg.name === "Jamie Davis" && <small>you</small>}
      </strong>
    </span>
  );
}
export default function TeamBoard({ exchanges, onOpen, onDemoControls }) {
  const [view, setView] = useState("exchanges"),
    [search, setSearch] = useState(""),
    [person, setPerson] = useState("Everyone"),
    [onlyMine, setOnlyMine] = useState(false);
  const people = useMemo(
    () =>
      [...new Set(exchanges.flatMap((e) => e.legs.map((l) => l.name)))].sort(),
    [exchanges],
  );
  const filtered = exchanges.filter(
    (e) =>
      (!onlyMine || e.legs.some((l) => l.name === "Jamie Davis")) &&
      (person === "Everyone" || e.legs.some((l) => l.name === person)) &&
      `${e.id} ${e.legs.map((l) => `${l.name} ${l.task} ${l.for}`).join(" ")}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const shownPeople = people.filter((name) =>
    filtered.some((e) => e.legs.some((l) => l.name === name)),
  );
  return (
    <section className="team-board">
      <div className="page-heading">
        <div>
          <div className="eyebrow">THE TEAM EXCHANGE BOARD</div>
          <h1>
            Who’s helping whom<span>.</span>
          </h1>
          <p>
            Both sides of every swap, with a clear owner and a shared finish
            line.
          </p>
        </div>
        <button className="secondary" onClick={onDemoControls}>
          <RotateSymbol />
          Demo controls
        </button>
      </div>
      <div className="team-demo-notice">
        <ShieldCheck size={17} />
        <div>
          <strong>Demo team · stored on this device</strong>
          <span>
            People and activity are examples. Status changes simulate a team
            workflow; nothing is sent or assigned to real colleagues.
          </span>
        </div>
      </div>
      <div className="team-stats">
        {stages.map((status) => (
          <div key={status}>
            <span className={"status-dot " + stageClass(status)} />
            <strong>
              {filtered.filter((e) => e.status === status).length}
            </strong>
            <span>
              {status === "Proposed"
                ? "Proposed exchanges"
                : status === "In progress"
                  ? "Exchanges in progress"
                  : "Completed exchanges"}
            </span>
          </div>
        ))}
        <div>
          <Users size={18} />
          <strong>{shownPeople.length}</strong>
          <span>People in this view</span>
        </div>
      </div>
      <div className="team-toolbar">
        <div className="team-view-toggle" aria-label="Board view">
          <button
            aria-pressed={view === "exchanges"}
            onClick={() => setView("exchanges")}
          >
            <Columns3 size={15} />
            Exchanges
          </button>
          <button
            aria-pressed={view === "people"}
            onClick={() => setView("people")}
          >
            <Users size={15} />
            People
          </button>
        </div>
        <label className="team-person-filter">
          <span>Person</span>
          <select
            aria-label="Filter by teammate"
            value={person}
            onChange={(e) => setPerson(e.target.value)}
          >
            <option>Everyone</option>
            {people.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>
        <label className="team-mine">
          <input
            type="checkbox"
            checked={onlyMine}
            onChange={(e) => setOnlyMine(e.target.checked)}
          />
          My exchanges
        </label>
        <label className="team-search">
          <Search size={15} />
          <input
            aria-label="Search exchanges"
            placeholder="Search people or tasks"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>
      {view === "exchanges" ? (
        <div className="kanban-board">
          {stages.map((status) => (
            <section
              key={status}
              className="kanban-column"
              aria-label={`${status} exchanges`}
            >
              <div className="kanban-column-head">
                <span className={"status-dot " + stageClass(status)} />
                <h2>{status}</h2>
                <span>
                  {filtered.filter((e) => e.status === status).length}
                </span>
              </div>
              <div className="kanban-items">
                {filtered
                  .filter((e) => e.status === status)
                  .map((e) => (
                    <article className="exchange-card" key={e.id}>
                      <div className="exchange-card-meta">
                        <span>{e.id}</span>
                        <span>
                          {e.origin === "sample"
                            ? "Sample exchange"
                            : "Your demo exchange"}
                        </span>
                      </div>
                      {e.legs.map((leg, i) => (
                        <React.Fragment key={i}>
                          {i === 1 && (
                            <div className="exchange-divider">
                              <ArrowLeftRight size={13} />
                              <span>IN EXCHANGE FOR</span>
                            </div>
                          )}
                          <div className="exchange-leg">
                            <Person leg={leg} />
                            <p>{leg.task}</p>
                            <span>
                              For {leg.for}
                              {leg.done && (
                                <span className="delivery-ready">
                                  <Check size={11} />
                                  Ready
                                </span>
                              )}
                            </span>
                          </div>
                        </React.Fragment>
                      ))}
                      <div className="exchange-card-foot">
                        <span>
                          <Clock3 size={12} />
                          {e.timing}
                        </span>
                        <button
                          onClick={() => onOpen(e.id)}
                          aria-label={`Open exchange ${e.id}`}
                        >
                          Details
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </article>
                  ))}
                {!filtered.some((e) => e.status === status) && (
                  <div className="column-empty">
                    No {status.toLowerCase()} exchanges in this view.
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="people-grid">
          {shownPeople.map((name) => {
            const entries = filtered.flatMap((e) =>
              e.legs
                .filter((l) => l.name === name)
                .map((leg) => ({ exchange: e, leg })),
            );
            const identity = entries[0].leg;
            return (
              <article className="person-work-card" key={name}>
                <Person leg={identity} />
                <p className="person-work-count">
                  {
                    entries.filter((x) => x.exchange.status === "In progress")
                      .length
                  }{" "}
                  active ·{" "}
                  {
                    entries.filter((x) => x.exchange.status === "Proposed")
                      .length
                  }{" "}
                  proposed ·{" "}
                  {entries.filter((x) => x.exchange.status === "Done").length}{" "}
                  done
                </p>
                {entries.map(({ exchange: e, leg }) => (
                  <button
                    key={e.id}
                    onClick={() => onOpen(e.id)}
                    className="person-task"
                  >
                    <span className={"status-dot " + stageClass(e.status)} />
                    <span>
                      <strong>{leg.task}</strong>
                      <small>
                        Helping {leg.for} · {e.status}
                      </small>
                    </span>
                    <ArrowRight size={14} />
                  </button>
                ))}
              </article>
            );
          })}
          {!shownPeople.length && (
            <p className="column-empty">No people match these filters.</p>
          )}
        </div>
      )}
      {!filtered.length && (
        <div className="team-empty">
          <p>No exchanges match your filters.</p>
          <button
            className="secondary"
            onClick={() => {
              setSearch("");
              setPerson("Everyone");
              setOnlyMine(false);
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </section>
  );
}
function RotateSymbol() {
  return <ArrowLeftRight size={16} />;
}
export function ExchangeDetails({ exchange, onChange }) {
  const [confirmed, setConfirmed] = useState(false),
    [error, setError] = useState("");
  if (!exchange) return <p>This exchange is no longer on the board.</p>;
  function update(action) {
    try {
      onChange(exchange.id, action);
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <div className="exchange-detail">
      <div className="exchange-detail-heading">
        <span className={"exchange-status " + stageClass(exchange.status)}>
          {exchange.status}
        </span>
        <span>
          {exchange.id} ·{" "}
          {exchange.origin === "sample"
            ? "Sample exchange"
            : "Your demo exchange"}
        </span>
      </div>
      <div className="local-notice">
        Local simulation only. No requests, approvals, or notifications are sent
        to real people.
      </div>
      {exchange.legs.map((leg, i) => (
        <section className="exchange-detail-leg" key={i}>
          <Person leg={leg} />
          <span className="detail-helping">Helping {leg.for}</span>
          <h3>{leg.task}</h3>
          {exchange.status === "In progress" ? (
            <label className="delivery-checkbox">
              <input
                type="checkbox"
                checked={leg.done}
                onChange={(e) =>
                  update({ type: "leg", index: i, done: e.target.checked })
                }
              />
              <span>Mark {leg.name}’s delivery ready for review</span>
            </label>
          ) : (
            exchange.status === "Done" && (
              <span className="completed-delivery">
                <CheckCircle2 size={15} />
                Delivery confirmed in this demo
              </span>
            )
          )}
        </section>
      ))}
      <div className="brief-detail">
        <strong>Agreed timing</strong>
        <p>{exchange.timing}</p>
      </div>
      <div className="brief-detail">
        <strong>Finish line</strong>
        <p>{exchange.criteria}</p>
        <p>
          Both task owners review their deliverables before the whole exchange
          is marked done.
        </p>
      </div>
      {exchange.status === "Proposed" && (
        <div className="exchange-transition">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            <span>
              For this demo, simulate both people agreeing to the scope, timing,
              and required permissions.
            </span>
          </label>
          <button
            className="primary"
            disabled={!confirmed}
            onClick={() => update({ type: "start", confirmed })}
          >
            Start demo exchange
            <ArrowRight size={16} />
          </button>
        </div>
      )}
      {exchange.status === "In progress" && (
        <div className="exchange-transition">
          <p>
            {exchange.legs.filter((l) => l.done).length} of 2 deliveries ready.
            Confirm both to finish the exchange.
          </p>
          <button
            className="primary"
            disabled={!exchange.legs.every((l) => l.done)}
            onClick={() => update({ type: "complete" })}
          >
            <CheckCircle2 size={16} />
            Complete demo exchange
          </button>
        </div>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <div className="exchange-activity">
        <h3>Exchange activity</h3>
        <ol>
          {[...exchange.activity].reverse().map((a, i) => (
            <li key={i}>
              <span />
              <div>
                <p>{a.text}</p>
                {a.at && (
                  <time dateTime={a.at}>{new Date(a.at).toLocaleString()}</time>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
