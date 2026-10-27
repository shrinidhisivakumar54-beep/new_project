import React, { useState } from "react";
import {
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  Check,
  X,
  FileText,
  Clock3,
  MousePointer2,
} from "lucide-react";
const examples = [
  {
    name: "Olivia",
    initials: "OC",
    team: "Marketing",
    title: "Give our quarterly slides a visual refresh.",
    category: "Design",
    time: "45–60 min",
    offer: "Clean up a spreadsheet",
    color: "rose",
  },
  {
    name: "Theo",
    initials: "TM",
    team: "Customer experience",
    title: "Find three useful insights in our survey.",
    category: "Data",
    time: "30–45 min",
    offer: "Edit your next announcement",
    color: "sage",
  },
  {
    name: "Amara",
    initials: "AP",
    team: "Product design",
    title: "Help our launch email sound more human.",
    category: "Writing",
    time: "20–30 min",
    offer: "Review a landing page",
    color: "gold",
  },
];
export default function Landing({ onEnter }) {
  const [index, setIndex] = useState(0),
    [feedback, setFeedback] = useState("");
  const example = examples[index % examples.length];
  function preview(save) {
    setFeedback(
      save
        ? `${example.name}’s task saved in this preview.`
        : `Passed ${example.name}’s task. Try the next one.`,
    );
    setIndex((n) => n + 1);
  }
  return (
    <div className="landing">
      <header className="landing-nav">
        <a className="brand" href="/" aria-label="TaskSwap home">
          <span className="brand-mark">
            <ArrowLeftRight size={22} />
          </span>
          taskswap<span className="brand-period">.</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#good-swap">What makes a good swap?</a>
        </nav>
        <button className="landing-enter" onClick={onEnter}>
          Open workspace <ArrowUpRight size={17} />
        </button>
      </header>
      <main className="landing-main">
        <section className="landing-hero">
          <div className="hero-copy">
            <p className="landing-kicker">
              <span /> A BETTER WAY TO WORK TOGETHER
            </p>
            <h1>
              You do the slides.
              <br />
              I’ll do the <em>spreadsheet.</em>
            </h1>
            <p className="hero-description">
              Some work drains you. Some work comes naturally.
              <br className="desktop-break" /> Find a teammate whose strengths
              balance yours—and trade.
            </p>
            <div className="hero-actions">
              <button className="hero-cta" onClick={onEnter}>
                Find your next swap <ArrowRight size={19} />
              </button>
              <a href="#how-it-works">
                See how it works <span>↓</span>
              </a>
            </div>
            <p className="hero-fine-print">
              Try the demo. No signup. Nothing gets assigned automatically.
            </p>
          </div>
          <div className="hero-preview">
            <div className="preview-topline">
              <span>THE EXCHANGE BOARD</span>
              <span>0{(index % 3) + 1} / 03</span>
            </div>
            <div className="preview-ticket" key={index}>
              <div className="preview-person">
                <span className={"avatar " + example.color}>
                  {example.initials}
                </span>
                <div>
                  <strong>{example.name} needs a hand</strong>
                  <small>{example.team} · sample task</small>
                </div>
                <span className="ticket-pin" />
              </div>
              <div className="preview-ticket-body">
                <span className="preview-category">
                  {example.category} <span> / </span>
                  <Clock3 size={12} />
                  {example.time}
                </span>
                <h2>{example.title}</h2>
                <div className="preview-return">
                  <span>I CAN HELP YOU WITH</span>
                  <p>
                    <ArrowLeftRight size={16} />
                    {example.offer}
                  </p>
                </div>
              </div>
              <div className="ticket-tear">
                <i />
                <span />
                <i />
              </div>
              <div className="preview-controls">
                <button
                  onClick={() => preview(false)}
                  aria-label="Try passing a preview task"
                >
                  <X size={17} />
                  Pass
                </button>
                <button
                  onClick={() => preview(true)}
                  aria-label="Try saving a preview task"
                >
                  Interested
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
            <p className="preview-caption">
              <MousePointer2 size={14} /> Go on. Try the buttons.
            </p>
            <p className="preview-feedback" role="status">
              {feedback || "A small task can be the start of a good exchange."}
            </p>
          </div>
        </section>
        <section className="landing-principle">
          <span>THE IDEA IS SIMPLE</span>
          <p>
            Same team.
            <br />
            <em>Different superpowers.</em>
          </p>
          <div>
            You don’t need another to-do list. You need someone who doesn’t mind
            the thing you’ve been putting off. And chances are, you can return
            the favor.
          </div>
        </section>
        <section id="how-it-works" className="landing-how">
          <div className="landing-section-head">
            <div>
              <p className="landing-kicker">
                FROM “NOT AGAIN” TO “I’VE GOT THIS”
              </p>
              <h2>Three steps. One fair trade.</h2>
            </div>
            <span className="section-index">01 — HOW IT WORKS</span>
          </div>
          <div className="steps-grid">
            <article>
              <span className="step-number">01</span>
              <h3>Find your kind of task.</h3>
              <p>
                Browse small, clearly scoped requests. Click Interested to save
                one, or Pass to see what’s next. Arrow keys work too.
              </p>
              <div className="step-visual keyboard-visual">
                <kbd>←</kbd>
                <span>pass</span>
                <kbd>→</kbd>
                <span>interested</span>
              </div>
            </article>
            <article>
              <span className="step-number">02</span>
              <h3>Put something on the table.</h3>
              <p>
                Offer a task you’d like help with. Agree on the deliverable,
                timing, and what a fair exchange looks like.
              </p>
              <div className="step-visual trade-visual">
                <span>Your eye for design</span>
                <ArrowLeftRight size={18} />
                <span>Their way with numbers</span>
              </div>
            </article>
            <article>
              <span className="step-number">03</span>
              <h3>Make the handoff clear.</h3>
              <p>
                Check scope and any approvals together. Keep ownership clear,
                then get to work on something that suits you.
              </p>
              <div className="step-visual done-visual">
                <Check size={16} />
                <span>Clear brief</span>
                <Check size={16} />
                <span>Agreed timing</span>
              </div>
            </article>
          </div>
        </section>
        <section id="good-swap" className="landing-good">
          <div>
            <p className="landing-kicker">SMALL ENOUGH TO SAY YES TO</p>
            <h2>
              Trade a task.
              <br />
              Not your entire job.
            </h2>
            <p>
              The best swaps have a clear finish line. Think a second pair of
              eyes, a better chart, or six slides that need a little care.
            </p>
            <button onClick={onEnter}>
              Explore the task board <ArrowRight size={18} />
            </button>
          </div>
          <div className="scope-sheet">
            <div className="scope-sheet-head">
              <FileText size={18} />
              <span>ANATOMY OF A GOOD REQUEST</span>
            </div>
            <h3>“Can you tidy up these six slides?”</h3>
            <dl>
              <div>
                <dt>The deliverable</dt>
                <dd>An editable deck using our existing brand kit.</dd>
              </div>
              <div>
                <dt>The finish line</dt>
                <dd>Consistent layouts. Clear charts. Same numbers.</dd>
              </div>
              <div>
                <dt>The exchange</dt>
                <dd>I’ll review your customer email in return.</dd>
              </div>
            </dl>
            <span className="scope-foot">
              <Check size={15} />
              Specific. Manageable. Mutual.
            </span>
          </div>
        </section>
        <section className="landing-bottom">
          <span className="bottom-symbol" aria-hidden="true">
            ↔
          </span>
          <h2>
            Someone on your team
            <br />
            would actually enjoy that task.
          </h2>
          <button className="hero-cta" onClick={onEnter}>
            Find your next swap <ArrowRight size={19} />
          </button>
          <p>
            Demo workspace · sample teammates · your changes stay on this device
          </p>
        </section>
      </main>
      <footer className="landing-footer">
        <a href="/" className="footer-wordmark">
          taskswap.
        </a>
        <p>A little give. A little get.</p>
        <a href="#how-it-works">Back to the basics ↑</a>
      </footer>
    </div>
  );
}
