// app.js – runs SQL in the browser with sql.js (SQLite compiled to WebAssembly).
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
let SQL, db, view = "practice", cur = 0;
let done = new Set();
try { done = new Set(JSON.parse(localStorage.getItem("dbms:done") || "[]")); } catch {}
const saveDone = () => { try { localStorage.setItem("dbms:done", JSON.stringify([...done])); } catch {} };

const freshDb = () => { const d = new SQL.Database(); d.exec(SEED); return d; };

/* ---------- results ---------- */
function table(r) {
  const rows = r.values.slice(0, 200);
  return `<div class="scroll"><table><thead><tr>${r.columns.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>` +
    rows.map((row) => `<tr>${row.map((v) => `<td class="${v === null ? "nul" : ""}">${v === null ? "NULL" : esc(v)}</td>`).join("")}</tr>`).join("") +
    `</tbody></table></div><p class="meta">${r.values.length} row(s)${r.values.length > 200 ? " (showing first 200)" : ""}</p>`;
}

function renderSchema() {
  const names = (db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")[0] || { values: [] }).values;
  $("schema").innerHTML = names.map(([n]) => {
    const cols = db.exec(`PRAGMA table_info("${n}")`)[0].values;
    return `<div class="tbl"><b>${esc(n)}</b>${cols.map((c) => `<span>${esc(c[1])}${c[5] ? " 🔑" : ""} <i>${esc(c[2])}</i></span>`).join("")}</div>`;
  }).join("");
}

function run() {
  const sql = $("sql").value.trim();
  $("feedback").textContent = "";
  if (!sql) return;
  try {
    const res = db.exec(sql);
    $("result").innerHTML = res.length ? res.map(table).join("") : `<p class="ok">Statement executed. Rows changed: ${db.getRowsModified()}</p>`;
  } catch (e) { $("result").innerHTML = `<p class="err">${esc(e.message)}</p>`; }
  renderSchema();
}

/* ---------- answer checking ---------- */
// Runs SQL on a fresh database and returns the final result set (from verify query if given).
function outcome(sql, verify) {
  const d = freshDb();
  try {
    const res = d.exec(sql);
    const r = verify ? d.exec(verify) : res;
    return { rows: r.length ? r[r.length - 1] : { columns: [], values: [] } };
  } catch (e) { return { error: e.message }; }
  finally { d.close(); }
}
const norm = (vals, ordered) => {
  const a = vals.map((r) => JSON.stringify(r.map((v) => (typeof v === "number" ? +v.toFixed(4) : v))));
  return ordered ? a : a.sort();
};

function check() {
  const q = QUESTIONS[cur], f = $("feedback"), sql = $("sql").value.trim();
  if (!sql) { f.className = "err"; f.textContent = "Write a query first."; return; }
  const u = outcome(sql, q.verify), a = outcome(q.answer, q.verify);
  if (u.error) { f.className = "err"; f.textContent = "Error: " + u.error; return; }
  const same = u.rows.columns.length === a.rows.columns.length &&
    JSON.stringify(norm(u.rows.values, q.ordered)) === JSON.stringify(norm(a.rows.values, q.ordered));
  if (same) {
    f.className = "ok"; f.textContent = "✅ Correct! Nice work.";
    done.add(cur); saveDone(); renderQuestion(true);
  } else {
    f.className = "err";
    f.textContent = `❌ Not quite. Expected ${a.rows.values.length} row(s) × ${a.rows.columns.length} column(s), you got ${u.rows.values.length} × ${u.rows.columns.length}. Check values${q.ordered ? " and order" : ""}.`;
  }
}

/* ---------- questions ---------- */
function renderQuestion(keepText) {
  const q = QUESTIONS[cur];
  $("qsel").innerHTML = QUESTIONS.map((x, i) => `<option value="${i}">${done.has(i) ? "✓ " : ""}${i + 1}. ${esc(x.topic)}</option>`).join("");
  $("qsel").value = cur;
  $("badge").textContent = `${q.level} · ${q.topic}`;
  $("progress").textContent = `Solved ${done.size}/${QUESTIONS.length}`;
  $("qtext").textContent = q.q;
  $("hint").textContent = q.hint; $("hint").hidden = true;
  $("solution").textContent = q.answer; $("solution").hidden = true;
  if (!keepText) { $("sql").value = ""; $("feedback").textContent = ""; $("result").innerHTML = ""; }
}
const go = (i) => { cur = (i + QUESTIONS.length) % QUESTIONS.length; renderQuestion(); };

/* ---------- quiz ---------- */
let qz = [], qi = 0, score = 0;
function startQuiz() { qz = [...QUIZ].sort(() => Math.random() - 0.5); qi = 0; score = 0; showQ(); }
function showQ() {
  const box = $("quiz");
  if (qi >= qz.length) {
    box.innerHTML = `<h2>Score: ${score} / ${qz.length}</h2><p class="meta">${score === qz.length ? "Perfect!" : "Review the explanations and try again."}</p><div class="row"><button class="primary" data-act="restart">Try again</button></div>`;
    return;
  }
  const q = qz[qi];
  box.innerHTML = `<p class="meta">Question ${qi + 1} of ${qz.length}</p><h2>${esc(q.q)}</h2>` +
    q.o.map((o, i) => `<button class="opt" data-i="${i}">${esc(o)}</button>`).join("") + `<p id="qwhy"></p>`;
}
$("quiz").addEventListener("click", (e) => {
  const b = e.target.closest("button"); if (!b) return;
  if (b.dataset.act === "restart") return startQuiz();
  if (b.dataset.act === "next") { qi++; return showQ(); }
  if (b.dataset.i === undefined) return;
  const q = qz[qi], pick = +b.dataset.i;
  document.querySelectorAll(".opt").forEach((o) => { o.disabled = true; if (+o.dataset.i === q.a) o.classList.add("good"); });
  if (pick === q.a) score++; else b.classList.add("bad");
  $("qwhy").innerHTML = `${pick === q.a ? "✅" : "❌"} ${esc(q.why)}<div class="row"><button class="primary" data-act="next">${qi + 1 < qz.length ? "Next" : "See score"}</button></div>`;
});

/* ---------- tabs & events ---------- */
function setView(v) {
  view = v;
  document.querySelectorAll("#tabs button").forEach((b) => b.classList.toggle("on", b.dataset.view === v));
  document.querySelectorAll("[data-views]").forEach((el) => (el.hidden = !el.dataset.views.split(" ").includes(v)));
  if (v === "quiz" && !qz.length) startQuiz();
  if (v === "playground" && !$("sql").value) $("sql").value = "SELECT * FROM students;";
}
$("tabs").addEventListener("click", (e) => { if (e.target.dataset.view) setView(e.target.dataset.view); });
$("run").onclick = run;
$("check").onclick = check;
$("reset").onclick = () => { db.close(); db = freshDb(); $("result").innerHTML = ""; $("feedback").className = "ok"; $("feedback").textContent = "Database reset."; renderSchema(); };
$("prev").onclick = () => go(cur - 1);
$("next").onclick = () => go(cur + 1);
$("qsel").onchange = (e) => go(+e.target.value);
$("hintbtn").onclick = () => ($("hint").hidden = !$("hint").hidden);
$("solbtn").onclick = () => ($("solution").hidden = !$("solution").hidden);
$("sql").addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); run(); }
  if (e.key === "Tab") { e.preventDefault(); const t = e.target, s = t.selectionStart; t.setRangeText("  ", s, t.selectionEnd, "end"); }
});

/* ---------- start ---------- */
renderQuestion(); setView("practice");
initSqlJs({ locateFile: (f) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${f}` })
  .then((S) => {
    SQL = S; db = freshDb(); renderSchema();
    ["run", "check", "reset"].forEach((id) => ($(id).disabled = false));
    $("status").hidden = true;
  })
  .catch(() => { $("status").textContent = "Could not load the SQL engine. Check your internet connection and reload."; });
