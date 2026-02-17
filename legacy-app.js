const timelineData = [
  { id: 1, month: "Jan 2026", subreddit: "r/MachineLearning", interest: "AI tools", intensity: "High", hidden: false },
  { id: 2, month: "Feb 2026", subreddit: "r/Fitness", interest: "Home workouts", intensity: "Medium", hidden: false },
  { id: 3, month: "Mar 2026", subreddit: "r/WallStreetBets", interest: "Meme trading phase", intensity: "Low", hidden: false },
  { id: 4, month: "Apr 2026", subreddit: "r/Productivity", interest: "Systems + planning", intensity: "High", hidden: false }
];

const state = {
  selectedId: null,
  items: [...timelineData]
};

const timelineEl = document.getElementById("timeline");
const editorPanelEl = document.getElementById("editorPanel");
const editableCountEl = document.getElementById("editableCount");

function renderTimeline() {
  timelineEl.innerHTML = "";

  state.items.forEach((item) => {
    const row = document.createElement("div");
    row.className = `timeline-item ${item.hidden ? "hidden" : ""}`;
    row.innerHTML = `
      <strong>${item.month}</strong>
      <div>
        <div><b>${item.subreddit}</b> -> ${item.interest}</div>
        <div class="timeline-meta">Intensity: ${item.intensity}</div>
      </div>
      <button class="ghost-btn" data-id="${item.id}">Edit</button>
    `;

    row.querySelector("button").addEventListener("click", () => {
      state.selectedId = item.id;
      renderEditor();
    });

    timelineEl.appendChild(row);
  });

  const editedCount = state.items.filter((x) => x.hidden || x.interest !== timelineData.find((o) => o.id === x.id).interest).length;
  editableCountEl.textContent = String(editedCount);
}

function renderEditor() {
  const selected = state.items.find((item) => item.id === state.selectedId);

  if (!selected) {
    editorPanelEl.innerHTML = `<p class="muted">Select a timeline event to edit.</p>`;
    return;
  }

  editorPanelEl.innerHTML = `
    <label>Subreddit</label>
    <input id="editSubreddit" value="${selected.subreddit}" />

    <label>Interest Label</label>
    <input id="editInterest" value="${selected.interest}" />

    <label>Intensity</label>
    <select id="editIntensity">
      <option ${selected.intensity === "Low" ? "selected" : ""}>Low</option>
      <option ${selected.intensity === "Medium" ? "selected" : ""}>Medium</option>
      <option ${selected.intensity === "High" ? "selected" : ""}>High</option>
    </select>

    <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:6px;">
      <button class="primary-btn" id="saveEdit">Save Edit</button>
      <button class="ghost-btn" id="toggleHidden">${selected.hidden ? "Unhide Event" : "Hide Event"}</button>
      <button class="ghost-btn" id="resetEdit">Reset Item</button>
    </div>
  `;

  document.getElementById("saveEdit").addEventListener("click", () => {
    selected.subreddit = document.getElementById("editSubreddit").value.trim() || selected.subreddit;
    selected.interest = document.getElementById("editInterest").value.trim() || selected.interest;
    selected.intensity = document.getElementById("editIntensity").value;
    renderTimeline();
    renderEditor();
  });

  document.getElementById("toggleHidden").addEventListener("click", () => {
    selected.hidden = !selected.hidden;
    renderTimeline();
    renderEditor();
  });

  document.getElementById("resetEdit").addEventListener("click", () => {
    const original = timelineData.find((item) => item.id === selected.id);
    Object.assign(selected, JSON.parse(JSON.stringify(original)));
    renderTimeline();
    renderEditor();
  });
}

renderTimeline();
renderEditor();
