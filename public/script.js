
const API_URL = "/api";

let token = localStorage.getItem("leaveToken") || "";
let currentUser = JSON.parse(localStorage.getItem("leaveUser") || "null");
let leaves = [];

const app = document.getElementById("app");

function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function showMessage(message, type = "error") {
    const box = document.getElementById("notice");
    if (!box) {
        alert(message);
        return;
    }

    box.textContent = message;
    box.className = `notice ${type}`;
}

async function api(endpoint, options = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {})
        }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        if (response.status === 401 && token) {
            logout(false);
        }
        throw new Error(data.message || "Something went wrong.");
    }

    return data;
}

function saveLogin(data) {
    token = data.token;
    currentUser = data.user;

    localStorage.setItem("leaveToken", token);
    localStorage.setItem("leaveUser", JSON.stringify(currentUser));
}

function logout(showNotice = true) {
    token = "";
    currentUser = null;
    leaves = [];

    localStorage.removeItem("leaveToken");
    localStorage.removeItem("leaveUser");

    renderAuth();

    if (showNotice) {
        showMessage("You have logged out successfully.", "success");
    }
}

function renderAuth(mode = "login") {
    app.innerHTML = `
        <div class="auth-page">
            <section class="auth-side">
                <h1>Leave Management System</h1>
                <p>
                    Manage employee leave requests with ease.
                    Apply for leave, track application status,
                    and manage approvals in one place.
                </p>
            </section>

            <section class="auth-card">
                <h2>${mode === "login" ? "Welcome Back!" : "Create Account"}</h2>
                <p class="muted">
                    ${mode === "login"
                        ? "Login to access your dashboard."
                        : "Register as an employee or manager."}
                </p>

                <div id="notice" class="notice"></div>

                <form id="authForm">
                    ${mode === "register" ? `
                        <div class="field">
                            <label>Full Name</label>
                            <input id="name" required placeholder="Enter your full name">
                        </div>
                    ` : ""}

                    <div class="field">
                        <label>Email Address</label>
                        <input id="email" type="email" required placeholder="Enter your email">
                    </div>

                    <div class="field">
                        <label>Password</label>
                        <input id="password" type="password" required minlength="6"
                            placeholder="Enter your password">
                    </div>

                    <div class="field">
                        <label>Account Role</label>
                        <select id="role" required>
                            <option value="Employee">Employee</option>
                            <option value="Manager">Manager</option>
                        </select>
                    </div>

                    ${mode === "register" ? `
                        <div class="field" id="managerCodeField" style="display:none">
                            <label>Manager Invitation Code</label>
                            <input id="managerCode" type="password"
                                placeholder="Enter manager invitation code">
                        </div>
                    ` : ""}

                    <button class="primary-btn" type="submit">
                        ${mode === "login" ? "Login" : "Create Account"}
                    </button>
                </form>

                <p class="switch-text">
                    ${mode === "login"
                        ? `Don't have an account?
                           <button class="link-btn" id="switchMode">Register</button>`
                        : `Already have an account?
                           <button class="link-btn" id="switchMode">Login</button>`}
                </p>
            </section>
        </div>
    `;

    document.getElementById("switchMode").addEventListener("click", () => {
        renderAuth(mode === "login" ? "register" : "login");
    });

    const roleSelect = document.getElementById("role");

    if (mode === "register") {
        const managerField = document.getElementById("managerCodeField");

        roleSelect.addEventListener("change", () => {
            managerField.style.display =
                roleSelect.value === "Manager" ? "block" : "none";
        });
    }

    document.getElementById("authForm").addEventListener("submit", handleAuth);
}

async function handleAuth(event) {
    event.preventDefault();

    const mode = document.querySelector(".auth-card h2").textContent;
    const isRegister = mode === "Create Account";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    const body = {
        email,
        password,
        role
    };

    if (isRegister) {
        body.name = document.getElementById("name").value.trim();

        if (role === "Manager") {
            body.managerCode = document.getElementById("managerCode").value;
        }
    }

    const button = document.querySelector("#authForm button[type='submit']");
    button.disabled = true;
    button.textContent = "Please wait...";

    try {
        const data = await api(isRegister ? "/register" : "/login", {
            method: "POST",
            body: JSON.stringify(body)
        });

        saveLogin(data);
        await renderDashboard();
    } catch (error) {
        showMessage(error.message);
        button.disabled = false;
        button.textContent = isRegister ? "Create Account" : "Login";
    }
}

function daysBetween(startDate, endDate) {
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);

    return Math.floor((end - start) / 86400000) + 1;
}

function formatDate(value) {
    if (!value) return "-";

    const date = new Date(`${value}T00:00:00`);

    if (isNaN(date.getTime())) return escapeHTML(value);

    return date.toLocaleDateString("en-IN");
}

function statusBadge(status) {
    return `<span class="status ${escapeHTML(status)}">${escapeHTML(status)}</span>`;
}

async function renderDashboard() {
    if (!token || !currentUser) {
        renderAuth();
        return;
    }

    try {
        if (currentUser.role === "Employee") {
            leaves = await api("/leaves/mine");
            renderEmployee();
        } else if (currentUser.role === "Manager") {
            leaves = await api("/leaves");
            renderManager();
        } else {
            logout();
        }
    } catch (error) {
        app.innerHTML = `<div class="auth-card">
            <h2>Unable to load dashboard</h2>
            <p class="muted">${escapeHTML(error.message)}</p>
            <button class="primary-btn" id="tryAgain">Try Again</button>
            <button class="logout-btn" id="logoutNow">Logout</button>
        </div>`;

        document.getElementById("tryAgain").onclick = renderDashboard;
        document.getElementById("logoutNow").onclick = () => logout();
    }
}

function renderEmployee() {
    const casualUsed = leaves
        .filter(l => l.leaveType === "Casual Leave" && l.status === "Approved")
        .reduce((sum, l) => sum + daysBetween(l.startDate, l.endDate), 0);

    const medicalUsed = leaves
        .filter(l => l.leaveType === "Medical Leave" && l.status === "Approved")
        .reduce((sum, l) => sum + daysBetween(l.startDate, l.endDate), 0);

    const casualTotal = 12;
    const medicalTotal = 10;

    app.innerHTML = `
        <main class="dashboard">
            <header class="topbar">
                <h2>Leave Management System</h2>
                <button class="logout-btn" id="logoutBtn">Logout</button>
            </header>

            <section class="welcome">
                <h2>Welcome, ${escapeHTML(currentUser.name)}!</h2>
                <p>Employee Dashboard · ${escapeHTML(currentUser.email)}</p>
            </section>

            <section class="stats">
                <div class="stat-card">
                    <p>Casual Leave Balance</p>
                    <h2>${Math.max(0, casualTotal - casualUsed)} / ${casualTotal}</h2>
                </div>
                <div class="stat-card">
                    <p>Medical Leave Balance</p>
                    <h2>${Math.max(0, medicalTotal - medicalUsed)} / ${medicalTotal}</h2>
                </div>
                <div class="stat-card">
                    <p>Pending Requests</p>
                    <h2>${leaves.filter(l => l.status === "Pending").length}</h2>
                </div>
            </section>

            <section class="panel">
                <h3>Apply for Leave</h3>
                <div id="notice" class="notice"></div>

                <form id="leaveForm" class="leave-form">
                    <div class="field">
                        <label>Employee Name</label>
                        <input value="${escapeHTML(currentUser.name)}" disabled>
                    </div>

                    <div class="field">
                        <label>Email Address</label>
                        <input value="${escapeHTML(currentUser.email)}" disabled>
                    </div>

                    <div class="field">
                        <label>Leave Type</label>
                        <select id="leaveType" required>
                            <option value="Casual Leave">Casual Leave</option>
                            <option value="Medical Leave">Medical Leave</option>
                        </select>
                    </div>

                    <div class="field">
                        <label>Start Date</label>
                        <input type="date" id="startDate" required>
                    </div>

                    <div class="field">
                        <label>End Date</label>
                        <input type="date" id="endDate" required>
                    </div>

                    <div class="field full">
                        <label>Reason for Leave</label>
                        <textarea id="reason" required placeholder="Explain your reason for leave"></textarea>
                    </div>

                    <div class="full">
                        <button class="primary-btn" type="submit">Submit Leave Request</button>
                    </div>
                </form>
            </section>

            <section class="panel">
                <h3>My Leave History</h3>
                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Leave Type</th>
                                <th>From</th>
                                <th>To</th>
                                <th>Days</th>
                                <th>Reason</th>
                                <th>Status</th>
                                <th>Manager Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${leaves.length ? leaves.map(l => `
                                <tr>
                                    <td>${escapeHTML(l.leaveType)}</td>
                                    <td>${formatDate(l.startDate)}</td>
                                    <td>${formatDate(l.endDate)}</td>
                                    <td>${daysBetween(l.startDate, l.endDate)}</td>
                                    <td>${escapeHTML(l.reason)}</td>
                                    <td>${statusBadge(l.status)}</td>
                                    <td>${escapeHTML(l.rejectionReason || (l.status === "Approved" ? "Approved" : "-"))}</td>
                                </tr>
                            `).join("") : `
                                <tr><td colspan="7" class="empty">No leave requests yet.</td></tr>
                            `}
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    `;

    document.getElementById("logoutBtn").onclick = () => logout();
    document.getElementById("leaveForm").addEventListener("submit", submitLeave);

    const today = new Date().toISOString().split("T")[0];
    document.getElementById("startDate").min = today;
    document.getElementById("endDate").min = today;

    document.getElementById("startDate").addEventListener("change", event => {
        document.getElementById("endDate").min = event.target.value;
    });
}

async function submitLeave(event) {
    event.preventDefault();

    const leaveType = document.getElementById("leaveType").value;
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;
    const reason = document.getElementById("reason").value.trim();

    if (endDate < startDate) {
        showMessage("End date cannot be earlier than start date.");
        return;
    }

    const days = daysBetween(startDate, endDate);

    const used = leaves
        .filter(l => l.leaveType === leaveType && l.status === "Approved")
        .reduce((sum, l) => sum + daysBetween(l.startDate, l.endDate), 0);

    const total = leaveType === "Casual Leave" ? 12 : 10;

    if (used + days > total) {
        showMessage(`You only have ${Math.max(0, total - used)} days remaining for ${leaveType}.`);
        return;
    }

    try {
        const button = event.submitter;
        button.disabled = true;
        button.textContent = "Submitting...";

        await api("/leaves", {
            method: "POST",
            body: JSON.stringify({
                leaveType,
                startDate,
                endDate,
                reason
            })
        });

        await renderDashboard();
        showMessage("Your leave request has been submitted successfully!", "success");
    } catch (error) {
        showMessage(error.message);
        const button = event.submitter;
        if (button) {
            button.disabled = false;
            button.textContent = "Submit Leave Request";
        }
    }
}

function renderManager() {
    app.innerHTML = `
        <main class="dashboard">
            <header class="topbar">
                <h2>Leave Management System</h2>
                <button class="logout-btn" id="logoutBtn">Logout</button>
            </header>

            <section class="welcome">
                <h2>Welcome, ${escapeHTML(currentUser.name)}!</h2>
                <p>Manager Dashboard · ${escapeHTML(currentUser.email)}</p>
            </section>

            <section class="stats">
                <div class="stat-card">
                    <p>Total Requests</p>
                    <h2>${leaves.length}</h2>
                </div>
                <div class="stat-card">
                    <p>Pending Requests</p>
                    <h2>${leaves.filter(l => l.status === "Pending").length}</h2>
                </div>
                <div class="stat-card">
                    <p>Approved Requests</p>
                    <h2>${leaves.filter(l => l.status === "Approved").length}</h2>
                </div>
            </section>

            <section class="panel">
                <h3>Employee Leave Requests</h3>
                <div id="notice" class="notice"></div>

                <div class="field">
                    <label>Search by employee name or email</label>
                    <input id="managerFilter" placeholder="Search employees...">
                </div>

                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Email</th>
                                <th>Leave Type</th>
                                <th>Dates</th>
                                <th>Days</th>
                                <th>Reason</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody id="managerRows"></tbody>
                    </table>
                </div>
            </section>
        </main>
    `;

    document.getElementById("logoutBtn").onclick = () => logout();

    document.getElementById("managerFilter").addEventListener("input", filterManagerRows);

    filterManagerRows();
}

function filterManagerRows() {
    const search = document.getElementById("managerFilter").value.toLowerCase();

    const filtered = leaves.filter(l =>
        l.employeeName.toLowerCase().includes(search) ||
        l.employeeEmail.toLowerCase().includes(search)
    );

    const rows = document.getElementById("managerRows");

    rows.innerHTML = filtered.length ? filtered.map(l => `
        <tr>
            <td>${escapeHTML(l.employeeName)}</td>
            <td>${escapeHTML(l.employeeEmail)}</td>
            <td>${escapeHTML(l.leaveType)}</td>
            <td>${formatDate(l.startDate)} – ${formatDate(l.endDate)}</td>
            <td>${daysBetween(l.startDate, l.endDate)}</td>
            <td>${escapeHTML(l.reason)}</td>
            <td>${statusBadge(l.status)}</td>
            <td>
                ${l.status === "Pending" ? `
                    <button class="action-btn approve" data-id="${escapeHTML(l._id)}" data-action="approve">
                        Approve
                    </button>
                    <button class="action-btn reject" data-id="${escapeHTML(l._id)}" data-action="reject">
                        Reject
                    </button>
                ` : escapeHTML(l.reviewer || "-")}
            </td>
        </tr>
    `).join("") : `
        <tr><td colspan="8" class="empty">No leave requests found.</td></tr>
    `;

    rows.querySelectorAll("button[data-action]").forEach(button => {
        button.addEventListener("click", () => {
            updateStatus(button.dataset.id, button.dataset.action);
        });
    });
}

async function updateStatus(id, action) {
    let status;
    let rejectionReason = "";

    if (action === "approve") {
        status = "Approved";
    } else {
        status = "Declined";
        rejectionReason = prompt("Enter the reason for rejecting this leave request:");

        if (rejectionReason === null) return;

        if (!rejectionReason.trim()) {
            showMessage("Please enter a rejection reason.");
            return;
        }
    }

    try {
        await api(`/leaves/${encodeURIComponent(id)}`, {
            method: "PATCH",
            body: JSON.stringify({
                status,
                rejectionReason
            })
        });

        await renderDashboard();

        showMessage(`Leave request ${status.toLowerCase()} successfully.`, "success");
    } catch (error) {
        showMessage(error.message);
    }
}

// START APPLICATION
if (token && currentUser) {
    renderDashboard();
} else {
    renderAuth();
}
