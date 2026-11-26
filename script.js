// ---------- Data (replace with real data / an API later) ----------
const subjects = [
  { id: "math",    name: "Mathematics",      teacher: "Mr. Thapa",    icon: "📐", color: "#1d5fe0", completed: 18, total: 24, grade: "A-" },
  { id: "science", name: "Science",          teacher: "Ms. Rai",      icon: "🧪", color: "#0ea5e9", completed: 14, total: 20, grade: "B+" },
  { id: "english", name: "English",          teacher: "Mrs. Gurung",  icon: "📖", color: "#6366f1", completed: 20, total: 22, grade: "A" },
  { id: "history", name: "History",          teacher: "Mr. Karki",    icon: "🏛️", color: "#0891b2", completed: 9,  total: 18, grade: "B" },
  { id: "cs",      name: "Computer Science", teacher: "Ms. Shrestha", icon: "💻", color: "#2563eb", completed: 12, total: 16, grade: "A-" }
];

let assignments = [
  { id: 1, title: "Quadratic equations worksheet", subject: "math",    due: offsetDate(2),  done: false },
  { id: 2, title: "Lab report: acids and bases",   subject: "science", due: offsetDate(1),  done: false },
  { id: 3, title: "Essay on Macbeth",              subject: "english", due: offsetDate(5),  done: false },
  { id: 4, title: "Timeline of the Rana regime",   subject: "history", due: offsetDate(-1), done: false },
  { id: 5, title: "Build a to-do list app",        subject: "cs",      due: offsetDate(7),  done: true  }
];

let currentFilter = "all";

// ---------- Helpers ----------
function offsetDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}
const $ = (id) => document.getElementById(id);
const subjectById = (id) => subjects.find((s) => s.id === id);
const pct = (s) => Math.round((s.completed / s.total) * 100);

function dueInfo(a) {
  if (a.done) return { text: "Done", cls: "ok" };
  const today = new Date(offsetDate(0));
  const diff = Math.round((new Date(a.due) - today) / 86400000);
  if (diff < 0)  return { text: "Overdue", cls: "late" };
  if (diff === 0) return { text: "Due today", cls: "soon" };
  if (diff <= 2) return { text: `Due in ${diff} day${diff > 1 ? "s" : ""}`, cls: "soon" };
  return { text: `Due in ${diff} days`, cls: "normal" };
}

// ---------- Render: subject cards ----------
function renderSubjects() {
  $("subjectGrid").innerHTML = subjects.map((s) => `
    <article class="subject-card" style="--c:${s.color}">
      <div class="subject-icon" aria-hidden="true">${s.icon}</div>
      <h3>${s.name}</h3>
      <p class="teacher">${s.teacher}</p>
      <div class="subject-meta"><span>${s.completed} of ${s.total} lessons</span><span>${pct(s)}%</span></div>
      <div class="mini-bar"><span style="width:${pct(s)}%"></span></div>
      <span class="grade">Grade ${s.grade}</span>
    </article>`).join("");

  $("newSubject").innerHTML = subjects.map((s) => `<option value="${s.id}">${s.name}</option>`).join("");
}

// ---------- Render: progress tracker ----------
function renderProgress() {
  const done = subjects.reduce((n, s) => n + s.completed, 0);
  const total = subjects.reduce((n, s) => n + s.total, 0);
  const overall = Math.round((done / total) * 100);

  $("overallRing").style.setProperty("--p", overall);
  $("overallPercent").textContent = overall + "%";
  $("overallDetail").textContent = `${done} of ${total} lessons completed`;

  $("progressBars").innerHTML = subjects.map((s) => `
    <li class="bar-row" style="--c:${s.color}">
      <div class="bar-top"><span>${s.name}</span><span>${pct(s)}%</span></div>
      <div class="bar-track" role="progressbar" aria-valuenow="${pct(s)}" aria-valuemin="0" aria-valuemax="100" aria-label="${s.name} progress">
        <div class="bar-fill" style="width:${pct(s)}%"></div>
      </div>
    </li>`).join("");
}

// ---------- Render: assignments ----------
function renderAssignments() {
  const list = assignments
    .filter((a) => currentFilter === "all" || (currentFilter === "done" ? a.done : !a.done))
    .sort((a, b) => Number(a.done) - Number(b.done) || a.due.localeCompare(b.due));

  $("assignmentList").innerHTML = list.map((a) => {
    const info = dueInfo(a);
    const sub = subjectById(a.subject);
    return `
      <li class="assignment ${a.done ? "done" : ""}">
        <input type="checkbox" data-id="${a.id}" ${a.done ? "checked" : ""} aria-label="Mark ${a.title} as done">
        <div class="a-body">
          <div class="a-title">${escapeHtml(a.title)}</div>
          <div class="a-sub">${sub.name} · ${new Date(a.due).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</div>
        </div>
        <span class="badge ${info.cls}">${info.text}</span>
        <button class="remove" data-remove="${a.id}" aria-label="Remove ${a.title}">×</button>
      </li>`;
  }).join("");

  $("emptyMsg").hidden = list.length > 0;
  updateSummary();
}

function updateSummary() {
  const pending = assignments.filter((a) => !a.done);
  const overdue = pending.filter((a) => dueInfo(a).cls === "late").length;
  $("summaryLine").textContent = pending.length
    ? `You have ${pending.length} pending assignment${pending.length > 1 ? "s" : ""}${overdue ? `, ${overdue} overdue` : ""}.`
    : "You're all caught up. Nice work!";
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ---------- Events ----------
$("assignmentList").addEventListener("change", (e) => {
  if (e.target.matches("input[type=checkbox]")) {
    const a = assignments.find((x) => x.id === Number(e.target.dataset.id));
    a.done = e.target.checked;
    renderAssignments();
  }
});

$("assignmentList").addEventListener("click", (e) => {
  const id = e.target.dataset.remove;
  if (id) {
    assignments = assignments.filter((a) => a.id !== Number(id));
    renderAssignments();
  }
});

document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    document.querySelector(".chip.active").classList.remove("active");
    chip.classList.add("active");
    currentFilter = chip.dataset.filter;
    renderAssignments();
  });
});

$("addForm").addEventListener("submit", (e) => {
  e.preventDefault();
  assignments.push({
    id: Date.now(),
    title: $("newTitle").value.trim(),
    subject: $("newSubject").value,
    due: $("newDue").value,
    done: false
  });
  e.target.reset();
  renderAssignments();
});

// Mobile menu
$("menuBtn").addEventListener("click", () => {
  const open = $("navLinks").classList.toggle("open");
  $("menuBtn").setAttribute("aria-expanded", open);
});

// Highlight active nav link while scrolling
const navAnchors = document.querySelectorAll(".nav-links a");
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      navAnchors.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id));
    }
  });
}, { rootMargin: "-40% 0px -55% 0px" });
["overview", "subjects", "progress", "assignments"].forEach((id) => observer.observe($(id)));
navAnchors.forEach((a) => a.addEventListener("click", () => $("navLinks").classList.remove("open")));

// ---------- Init ----------
renderSubjects();
renderProgress();
renderAssignments();
async function loadResources() {
    const output = document.getElementById("resources");

    output.innerHTML = "Loading resources...";

    try {
        const response = await fetch(
            "https://jsonplaceholder.typicode.com/posts?_limit=5"
        );

        const data = await response.json();

        output.innerHTML = data.map(post => `
            <div>
                <h3>${post.title}</h3>
                <p>${post.body}</p>
                <hr>
            </div>
        `).join("");

    } catch (error) {
        output.innerHTML = data.map(post => `
    <div class="resource-card">
        <h3>${post.title}</h3>
        <p>${post.body}</p>
    </div>
`).join("");
        console.error(error);
    }
}