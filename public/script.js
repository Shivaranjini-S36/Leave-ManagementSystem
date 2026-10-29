
const POLICY = {
  "Casual Leave": 12,
  "Medical Leave": 10
};

let leaves = [];
let employeeEmail = localStorage.getItem("employeeEmail") || "";

document.body.innerHTML = `
<style>
*{box-sizing:border-box}
body{margin:0;font-family:Arial,sans-serif;background:#f3f5fb;color:#24304a}
header{background:#293c72;color:white;padding:22px 6%;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
header h1{margin:0;font-size:24px}
header select{padding:10px;border-radius:6px}
main{max-width:1100px;margin:28px auto;padding:0 18px}
.panel{background:white;padding:24px;border-radius:12px;margin-bottom:22px;box-shadow:0 3px 15px #17255410}
h2{margin-top:0;color:#293c72}
.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
.cards{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}
.stat{background:#f3f6ff;padding:18px;border-radius:10px;border:1px solid #e1e7f5}
.stat strong{display:block;font-size:25px;margin-top:8px;color:#293c72}
label{display:block;font-weight:bold;font-size:14px}
input,select,textarea{width:100%;margin-top:7px;padding:11px;border:1px solid #d5dbea;border-radius:6px;font:inherit}
textarea{min-height:80px;resize:vertical}
button{border:0;border-radius:6px;padding:11px 16px;cursor:pointer;color:white;background:#293c72;font-weight:bold;margin:5px 5px 5px 0}
button:hover{opacity:.88}
.approve{background:#16834a}.decline{background:#c03945}
.card{border:1px solid #e1e5ef;border-radius:9px;padding:18px;margin-top:14px;overflow-wrap:anywhere}
.status{display:inline-block;border-radius:20px;padding:6px 12px;font-size:13px;font-weight:bold}
.Pending{background:#fff0c2;color:#8a5a00}
.Approved{background:#d9f8e5;color:#126b3b}
.Declined{background:#ffe0e0;color:#a32626}
.muted{color:#667085;font-size:14px}
.full{grid-column:1/-1}
.notice{padding:12px;border-radius:8px;background:#eef3ff;margin-bottom:16px}
@media(max-width:700px){.cards{grid-template-columns:repeat(2,minmax(0,1fr))}.grid{grid-template-columns:1fr}.full{grid-column:auto}header h1{font-size:20px}}
</style>

<header>
  <h1>Leave Management System</h1>
  <label style="color:white">Dashboard
    <select id="role" style="width:auto">
      <option value="employee">Employee</option>
      <option value="manager">Manager / Approver</option>
    </select>
  </label>
</header>

<main>
  <section id="employeePanel">
    <section class="panel">
      <h2>My Leave Balance</h2>
      <p class="muted">Balances are based on the current policy and approved requests.</p>
      <div id="balanceCards" class="cards"></div>
    </section>

    <section class="panel">
      <h2>Apply for Leave</h2>
      <form id="leaveForm" class="grid">
        <label>Employee Name
          <input id="employeeName" required placeholder="Enter your name">
        </label>
        <label>Employee Email
          <input id="employeeEmail" type="email" required placeholder="Enter your email">
        </label>
        <label>Leave Type
          <select id="leaveType" required>
            <option value="">Select leave type</option>
            <option>Casual Leave</option>
            <option>Medical Leave</option>
          </select>
        </label>
        <label>Start Date
          <input id="startDate" type="date" required>
        </label>
        <label>End Date
          <input id="endDate" type="date" required>
        </label>
        <label class="full">Reason
          <textarea id="reason" required placeholder="Explain why you need leave"></textarea>
        </label>
        <div class="full"><button type="submit">Submit Leave Request</button></div>
      </form>
    </section>

    <section class="panel">
      <h2>My Leave History</h2>
      <p class="muted">View your previous requests and their decisions.</p>
      <div id="employeeHistory"></div>
    </section>
  </section>

  <section id="managerPanel" style="display:none">
    <section class="panel">
      <h2>Manager Dashboard</h2>
      <p class="muted">Review pending requests and check each employee's previous leave history.</p>
      <label>Filter by employee email
        <input id="managerFilter" type="email" placeholder="Leave blank to view everyone">
      </label>
      <button id="refreshButton" type="button">Refresh Requests</button>
      <div id="managerHistory"></div>
    </section>
  </section>
  <p id="message" class="notice" role="status">Connecting to the database...</p>
</main>
`;

const $ = id => document.getElementById(id);
const message = $("message");

function showMessage(text) {
  message.textContent = text;
}

function daysBetween(start, end) {
  const a = new Date(start + "T00:00:00Z");
  const b = new Date(end + "T00:00:00Z");
  return Math.round((b - a) / 86400000) + 1;
}

function makeElement(tag, text, className) {
  const el = document.createElement(tag);
  if (text !== undefined) el.textContent = text;
  if (className) el.className = className;
  return el;
}

async function api(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
}

async function loadLeaves() {
  try {
    leaves = await api("/api/leaves");
    render();
    showMessage("Connected. Leave requests loaded from the server.");
  } catch (error) {
    showMessage("Could not load requests: " + error.message);
  }
}

function addLine(parent, label, value) {
  parent.appendChild(makeElement("p", label + ": " + (value || "—")));
}

function renderBalances(myLeaves) {
  const container = $("balanceCards");
  container.innerHTML = "";

  for (const [type, total] of Object.entries(POLICY)) {
    const approved = myLeaves
      .filter(l => l.leaveType === type && l.status === "Approved")
      .reduce((sum, l) => sum + daysBetween(l.startDate, l.endDate), 0);

    const pending = myLeaves
      .filter(l => l.leaveType === type && l.status === "Pending")
      .reduce((sum, l) => sum + daysBetween(l.startDate, l.endDate), 0);

    const card = makeElement("div", undefined, "stat");
    card.appendChild(makeElement("span", type));
    card.appendChild(makeElement("strong", String(Math.max(0, total - approved))));
    card.appendChild(makeElement("p", "Days remaining"));
    card.appendChild(makeElement("p", "Annual allowance: " + total));
    card.appendChild(makeElement("p", "Approved / taken: " + approved));
    card.appendChild(makeElement("p", "Pending: " + pending));
    container.appendChild(card);
  }
}

function createLeaveCard(leave, isManager) {
  const card = makeElement("article", undefined, "card");
  card.appendChild(makeElement("h3",
    (leave.employeeName || "Employee") + " — " + leave.leaveType));

  addLine(card, "Employee email", leave.employeeEmail);
  addLine(card, "Dates", leave.startDate + " to " + leave.endDate);
  addLine(card, "Requested days", daysBetween(leave.startDate, leave.endDate));
  addLine(card, "Reason", leave.reason);

  card.appendChild(makeElement("span", "Status: " + leave.status,
    "status " + leave.status));

  if (leave.reviewer) addLine(card, "Reviewed by", leave.reviewer);

  if (leave.reviewedAt) {
    addLine(card, "Decision date", new Date(leave.reviewedAt).toLocaleString());
  }

  if (isManager && leave.status === "Pending") {
    card.appendChild(makeElement("h4", "Review this request"));

    const reviewer = document.createElement("input");
    reviewer.placeholder = "Manager name";
    reviewer.setAttribute("aria-label", "Manager name");
    card.appendChild(reviewer);

    const approve = makeElement("button", "Approve", "approve");
    approve.type = "button";
    approve.addEventListener("click", () =>
      updateStatus(leave._id, "Approved", reviewer.value));

    const decline = makeElement("button", "Decline", "decline");
    decline.type = "button";
    decline.addEventListener("click", () =>
      updateStatus(leave._id, "Declined", reviewer.value));

    card.append(approve, decline);
  }

  return card;
}

function render() {
  const isManager = $("role").value === "manager";
  $("employeePanel").style.display = isManager ? "none" : "block";
  $("managerPanel").style.display = isManager ? "block" : "none";

  if (isManager) {
    renderManager();
    return;
  }

  const email = employeeEmail.trim().toLowerCase();
  const mine = leaves.filter(l =>
    (l.employeeEmail || "").toLowerCase() === email
  );

  renderBalances(mine);

  const history = $("employeeHistory");
  history.innerHTML = "";

  if (!email) {
    history.appendChild(makeElement("p",
      "Enter your email when applying for leave to identify your requests."));
    return;
  }

  if (mine.length === 0) {
    history.appendChild(makeElement("p", "No leave history found for this email."));
    return;
  }

  mine.sort((a, b) => new Date(b.createdAt || b.startDate) -
                      new Date(a.createdAt || a.startDate));

  mine.forEach(l => history.appendChild(createLeaveCard(l, false)));
}

function renderManager() {
  const container = $("managerHistory");
  container.innerHTML = "";

  const filter = $("managerFilter").value.trim().toLowerCase();

  const matching = leaves.filter(l =>
    !filter || (l.employeeEmail || "").toLowerCase().includes(filter)
  );

  if (matching.length === 0) {
    container.appendChild(makeElement("p", "No matching leave requests."));
    return;
  }

  matching.sort((a, b) => new Date(b.createdAt || b.startDate) -
                          new Date(a.createdAt || a.startDate));

  matching.forEach(leave => {
    const wrapper = makeElement("section");
    wrapper.appendChild(createLeaveCard(leave, true));

    const past = leaves.filter(old =>
      old._id !== leave._id &&
      (old.employeeEmail || "").toLowerCase() ===
      (leave.employeeEmail || "").toLowerCase()
    ).sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

    const history = makeElement("details");
    history.style.margin = "12px 0";
    history.appendChild(makeElement("summary", "View this employee's past leave"));

    if (past.length === 0) {
      history.appendChild(makeElement("p", "No previous requests."));
    } else {
      past.forEach(old => history.appendChild(createLeaveCard(old, false)));
    }

    wrapper.appendChild(history);
    container.appendChild(wrapper);
  });
}

async function updateStatus(id, status, reviewer) {
  if (!reviewer.trim()) {
    alert("Please enter the manager's name.");
    return;
  }

  try {
    const result = await api("/api/leaves/" + id, {
      method: "PATCH",
      body: JSON.stringify({ status, reviewer: reviewer.trim() })
    });

    showMessage(result.message || "Request updated.");
    await loadLeaves();
  } catch (error) {
    showMessage("Could not update request: " + error.message);
  }
}

$("leaveForm").addEventListener("submit", async event => {
  event.preventDefault();

  const employeeName = $("employeeName").value.trim();
  const email = $("employeeEmail").value.trim().toLowerCase();
  const leaveType = $("leaveType").value;
  const startDate = $("startDate").value;
  const endDate = $("endDate").value;
  const reason = $("reason").value.trim();

  if (endDate < startDate) {
    alert("End date cannot be before the start date.");
    return;
  }

  const requestedDays = daysBetween(startDate, endDate);
  const used = leaves
    .filter(l => (l.employeeEmail || "").toLowerCase() === email &&
                 l.leaveType === leaveType && l.status === "Approved")
    .reduce((sum, l) => sum + daysBetween(l.startDate, l.endDate), 0);

  if (used + requestedDays > POLICY[leaveType]) {
    alert("This request exceeds the displayed leave allowance.");
    return;
  }

  try {
    await api("/api/leaves", {
      method: "POST",
      body: JSON.stringify({
        employeeName,
        employeeEmail: email,
        leaveType,
        startDate,
        endDate,
        reason
      })
    });

    employeeEmail = email;
    localStorage.setItem("employeeEmail", email);
    $("leaveForm").reset();
    $("employeeEmail").value = email;

    await loadLeaves();
    showMessage("Leave request submitted successfully. Status: Pending.");
  } catch (error) {
    showMessage("Could not submit request: " + error.message);
  }
});

$("employeeEmail").value = employeeEmail;
$("employeeEmail").addEventListener("change", event => {
  employeeEmail = event.target.value.trim().toLowerCase();
  localStorage.setItem("employeeEmail", employeeEmail);
  render();
});

$("role").addEventListener("change", render);
$("managerFilter").addEventListener("input", renderManager);
$("refreshButton").addEventListener("click", loadLeaves);

loadLeaves();
