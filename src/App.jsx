import { useMemo, useState } from "react";
import { useEffect } from "react";
import { fetchRedditBootstrap } from "./api/redditApi";

const timelineSeed = [
  { id: 1, month: "Jan 2026", subreddit: "r/MachineLearning", interest: "AI tools", intensity: "High", hidden: false },
  { id: 2, month: "Feb 2026", subreddit: "r/Fitness", interest: "Home workouts", intensity: "Medium", hidden: false },
  { id: 3, month: "Mar 2026", subreddit: "r/WallStreetBets", interest: "Meme trading phase", intensity: "Low", hidden: false },
  { id: 4, month: "Apr 2026", subreddit: "r/Productivity", interest: "Systems + planning", intensity: "High", hidden: false }
];

function App() {
  const [items, setItems] = useState(timelineSeed);
  const [selectedId, setSelectedId] = useState(null);
  const [apiCalls, setApiCalls] = useState([]);
  const [apiState, setApiState] = useState({ loading: true, error: "", data: null });

  useEffect(() => {
    let active = true;

    (async () => {
      setApiState({ loading: true, error: "", data: null });
      try {
        const payload = await fetchRedditBootstrap((call) => {
          if (!active) return;
          setApiCalls((prev) => [call, ...prev].slice(0, 8));
        });

        if (!active) return;
        setApiState({ loading: false, error: "", data: payload });
      } catch (error) {
        if (!active) return;
        setApiState({ loading: false, error: error.message, data: null });
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const selected = useMemo(() => items.find((item) => item.id === selectedId) || null, [items, selectedId]);

  const editableCount = useMemo(
    () =>
      items.filter((current) => {
        const original = timelineSeed.find((seed) => seed.id === current.id);
        return current.hidden || original.interest !== current.interest || original.subreddit !== current.subreddit || original.intensity !== current.intensity;
      }).length,
    [items]
  );

  function updateSelected(patch) {
    setItems((prev) => prev.map((item) => (item.id === selectedId ? { ...item, ...patch } : item)));
  }

  function resetSelected() {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== selectedId) return item;
        return timelineSeed.find((seed) => seed.id === selectedId) || item;
      })
    );
  }

  return (
    <>
      <div className="bg-shape bg-shape-a" />
      <div className="bg-shape bg-shape-b" />

      <header className="topbar">
        <div className="brand">
          <span className="dot" />
          <h1>redditwrapped</h1>
          <span className="build">react alpha</span>
        </div>
        <button className="ghost-btn">Connect Reddit OAuth (WIP)</button>
      </header>

      <main className="layout">
        <section className="hero card reveal">
          <p className="eyebrow">Track your reddit identity over time</p>
          <h2>Like Last.fm, but for your subreddits, moods, and phases.</h2>
          <p>
            RedditWrapped maps your interest graph month-to-month. You can edit old phases, hide outdated behavior,
            and keep your profile aligned with who you are now.
          </p>
          <div className="hero-actions">
            <button className="primary-btn">Import My History</button>
            <button className="ghost-btn">Open Dev Notes</button>
          </div>
        </section>

        <section className="stats reveal">
          <article className="card stat">
            <h3>Top Cluster</h3>
            <p className="metric">Tech + AI</p>
            <small>42% of activity this quarter</small>
          </article>
          <article className="card stat">
            <h3>Interest Shift</h3>
            <p className="metric">+18%</p>
            <small>Fitness and productivity up</small>
          </article>
          <article className="card stat">
            <h3>Editable Events</h3>
            <p className="metric">{editableCount}</p>
            <small>moments hidden or relabeled</small>
          </article>
        </section>

        <section className="card reveal">
          <div className="section-head">
            <h3>Timeline (Prototype)</h3>
            <span className="chip">Q1 2026 sample data</span>
          </div>
          <div className="timeline">
            {items.map((item) => (
              <div key={item.id} className={`timeline-item ${item.hidden ? "hidden" : ""}`}>
                <strong>{item.month}</strong>
                <div>
                  <div>
                    <b>{item.subreddit}</b> - {item.interest}
                  </div>
                  <div className="timeline-meta">Intensity: {item.intensity}</div>
                </div>
                <button className="ghost-btn" onClick={() => setSelectedId(item.id)}>
                  Edit
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="card reveal">
          <div className="section-head">
            <h3>Edit History Queue</h3>
            <span className="chip chip-alert">experimental feature</span>
          </div>
          <p className="muted">Hide or relabel old interests to reflect your current identity.</p>

          <div className="editor">
            {!selected && <p className="muted">Select a timeline event to edit.</p>}
            {selected && (
              <>
                <label>Subreddit</label>
                <input value={selected.subreddit} onChange={(event) => updateSelected({ subreddit: event.target.value })} />

                <label>Interest Label</label>
                <input value={selected.interest} onChange={(event) => updateSelected({ interest: event.target.value })} />

                <label>Intensity</label>
                <select value={selected.intensity} onChange={(event) => updateSelected({ intensity: event.target.value })}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>

                <div className="button-row">
                  <button className="primary-btn" onClick={() => updateSelected({ hidden: selected.hidden })}>
                    Save Edit
                  </button>
                  <button className="ghost-btn" onClick={() => updateSelected({ hidden: !selected.hidden })}>
                    {selected.hidden ? "Unhide Event" : "Hide Event"}
                  </button>
                  <button className="ghost-btn" onClick={resetSelected}>
                    Reset Item
                  </button>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="card reveal">
          <div className="section-head">
            <h3>Reddit API Integration (Dev)</h3>
            <span className="chip">oauth.reddit.com</span>
          </div>
          <p className="muted">Live calls are token-gated. Configure <code>VITE_REDDIT_TOKEN</code> to enable real data fetches.</p>

          <div className="api-grid">
            <div>
              <h4>Status</h4>
              {apiState.loading && <p>Loading live Reddit data...</p>}
              {!apiState.loading && !apiState.error && (
                <p>
                  Connected as <b>{apiState.data?.profile?.name || "unknown"}</b>. Random probe: <b>r/{apiState.data?.randomSub}</b>
                </p>
              )}
              {!!apiState.error && <p className="error-text">{apiState.error}</p>}
            </div>

            <div>
              <h4>Recent API Calls</h4>
              {apiCalls.length === 0 && <p className="muted">No calls yet.</p>}
              <ul className="call-list">
                {apiCalls.map((call, index) => (
                  <li key={`${call}-${index}`}>{call}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <small>redditwrapped // react prototype // oauth + persistence in progress</small>
      </footer>
    </>
  );
}

export default App;
