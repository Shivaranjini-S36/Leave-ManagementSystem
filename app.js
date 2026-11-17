// Default Initial Mock Data
const INITIAL_USERS = [
  {
    id: "u1",
    name: "shivi",
    email: "shivi@gmail.com",
    password: "password123",
    role: "Employee",
    casualTotal: 12,
    medicalTotal: 10
  },
  {
    id: "u2",
    name: "s",
    email: "kungumashivi7@gmail.com",
    password: "password123",
    role: "Employee",
    casualTotal: 12,
    medicalTotal: 10
  },
  {
    id: "u3",
    name: "ammu",
    email: "ammu@gmail.com",
    password: "password123",
    role: "Manager"
  },
  {
    id: "u4",
    name: "Rahul Kumar",
    email: "rahul@gmail.com",
    password: "password123",
    role: "Employee",
    casualTotal: 12,
    medicalTotal: 10
  },
  {
    id: "u5",
    name: "Priya Sharma",
    email: "priya@gmail.com",
    password: "password123",
    role: "Employee",
    casualTotal: 12,
    medicalTotal: 10
  },
  {
    id: "u6",
    name: "Ananya Rao",
    email: "ananya@gmail.com",
    password: "password123",
    role: "Employee",
    casualTotal: 12,
    medicalTotal: 10
  },
  {
    id: "u7",
    name: "Karthik V",
    email: "karthik@gmail.com",
    password: "password123",
    role: "Employee",
    casualTotal: 12,
    medicalTotal: 10
  },
  {
    id: "u8",
    name: "Rohit Verma",
    email: "rohit@gmail.com",
    password: "password123",
    role: "Employee",
    casualTotal: 12,
    medicalTotal: 10
  }
];

// Initial leave requests configured so:
// Total Requests = 8, Pending Requests = 3, Approved Requests = 3, Rejected = 2
// Row 1: s | kungumashivi7@gmail.com | Casual Leave | 11/11/2026 – 12/11/2026 | 2 | sick leave | Pending
// Row 2: s | kungumashivi7@gmail.com | Casual Leave | 1/11/2026 – 1/11/2026 | 1 | house warming function | Approved | sk
const INITIAL_REQUESTS = [
  {
    id: "req-1",
    employeeName: "s",
    employeeEmail: "kungumashivi7@gmail.com",
    leaveType: "Casual Leave",
    startDate: "2026-11-11",
    endDate: "2026-11-12",
    datesFormatted: "11/11/2026 – 12/11/2026",
    days: 2,
    reason: "sick leave",
    status: "Pending",
    managerRemarks: "",
    appliedOn: "2026-11-10"
  },
  {
    id: "req-2",
    employeeName: "s",
    employeeEmail: "kungumashivi7@gmail.com",
    leaveType: "Casual Leave",
    startDate: "2026-11-01",
    endDate: "2026-11-01",
    datesFormatted: "1/11/2026 – 1/11/2026",
    days: 1,
    reason: "house warming function",
    status: "Approved",
    managerRemarks: "sk",
    appliedOn: "2026-10-28"
  },
  {
    id: "req-3",
    employeeName: "Priya Sharma",
    employeeEmail: "priya@gmail.com",
    leaveType: "Medical Leave",
    startDate: "2026-11-15",
    endDate: "2026-11-18",
    datesFormatted: "15/11/2026 – 18/11/2026",
    days: 4,
    reason: "dental surgery and recovery",
    status: "Pending",
    managerRemarks: "",
    appliedOn: "2026-11-12"
  },
  {
    id: "req-4",
    employeeName: "Rahul Kumar",
    employeeEmail: "rahul@gmail.com",
    leaveType: "Medical Leave",
    startDate: "2026-11-05",
    endDate: "2026-11-07",
    datesFormatted: "05/11/2026 – 07/11/2026",
    days: 3,
    reason: "viral fever and medical rest",
    status: "Approved",
    managerRemarks: "Take proper rest and submit medical certificate",
    appliedOn: "2026-11-04"
  },
  {
    id: "req-5",
    employeeName: "Rohit Verma",
    employeeEmail: "rohit@gmail.com",
    leaveType: "Casual Leave",
    startDate: "2026-11-25",
    endDate: "2026-11-25",
    datesFormatted: "25/11/2026 – 25/11/2026",
    days: 1,
    reason: "attending sister graduation",
    status: "Pending",
    managerRemarks: "",
    appliedOn: "2026-11-14"
  },
  {
    id: "req-6",
    employeeName: "Ananya Rao",
    employeeEmail: "ananya@gmail.com",
    leaveType: "Casual Leave",
    startDate: "2026-10-28",
    endDate: "2026-10-29",
    datesFormatted: "28/10/2026 – 29/10/2026",
    days: 2,
    reason: "attending family wedding",
    status: "Approved",
    managerRemarks: "Approved. Handover urgent tasks to team",
    appliedOn: "2026-10-22"
  },
  {
    id: "req-7",
    employeeName: "Karthik V",
    employeeEmail: "karthik@gmail.com",
    leaveType: "Casual Leave",
    startDate: "2026-10-10",
    endDate: "2026-10-12",
    datesFormatted: "10/10/2026 – 12/10/2026",
    days: 3,
    reason: "personal road trip",
    status: "Rejected",
    managerRemarks: "Sprint release week. Cannot approve vacation during release",
    appliedOn: "2026-10-05"
  },
  {
    id: "req-8",
    employeeName: "s",
    employeeEmail: "kungumashivi7@gmail.com",
    leaveType: "Medical Leave",
    startDate: "2026-10-02",
    endDate: "2026-10-03",
    datesFormatted: "02/10/2026 – 03/10/2026",
    days: 2,
    reason: "severe migraine",
    status: "Rejected",
    managerRemarks: "Documentation not provided on time",
    appliedOn: "2026-10-01"
  }
];

// App State Management
class LeaveApp {
  constructor() {
    this.users = [];
    this.requests = [];
    this.currentUser = null;
    this.isRegisterMode = false;
    this.activeReviewRequestId = null;
    this.activeReviewAction = null;

    this.init();
  }

  init() {
    this.loadData();
    this.bindEvents();
    this.checkSession();
  }

  loadData() {
    const storedUsers = localStorage.getItem("lms_users");
    if (storedUsers) {
      try {
        this.users = JSON.parse(storedUsers);
      } catch (e) {
        this.users = [...INITIAL_USERS];
      }
    } else {
      this.users = [...INITIAL_USERS];
      this.saveUsers();
    }

    const storedRequests = localStorage.getItem("lms_requests");
    if (storedRequests) {
      try {
        this.requests = JSON.parse(storedRequests);
      } catch (e) {
        this.requests = [...INITIAL_REQUESTS];
      }
    } else {
      this.requests = [...INITIAL_REQUESTS];
      this.saveRequests();
    }
  }

  saveUsers() {
    localStorage.setItem("lms_users", JSON.stringify(this.users));
  }

  saveRequests() {
    localStorage.setItem("lms_requests", JSON.stringify(this.requests));
  }

  bindEvents() {
    // Auth Form Submit
    const authForm = document.getElementById("authForm");
    if (authForm) {
      authForm.addEventListener("submit", (e) => this.handleAuthSubmit(e));
    }

    // Toggle Login / Register
    const authToggleLink = document.getElementById("authToggleLink");
    if (authToggleLink) {
      authToggleLink.addEventListener("click", () => this.toggleAuthMode());
    }

    // Apply Leave Form
    const applyLeaveForm = document.getElementById("applyLeaveForm");
    if (applyLeaveForm) {
      applyLeaveForm.addEventListener("submit", (e) => this.handleApplyLeave(e));
    }

    // Modal confirm review
    const reviewConfirmBtn = document.getElementById("reviewConfirmBtn");
    if (reviewConfirmBtn) {
      reviewConfirmBtn.addEventListener("click", () => this.submitReview());
    }

    // Close modals on escape key or backdrop click
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeModals();
      }
    });

    document.querySelectorAll(".modal-overlay").forEach((modal) => {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          this.closeModals();
        }
      });
    });
  }

  checkSession() {
    const session = sessionStorage.getItem("lms_session");
    if (session) {
      try {
        const user = JSON.parse(session);
        this.currentUser = user;
        this.routeDashboard();
        return;
      } catch (e) {
        sessionStorage.removeItem("lms_session");
      }
    }
    this.showView("loginView");
  }

  showView(viewId) {
    document.querySelectorAll(".view-screen").forEach((screen) => {
      screen.classList.remove("active");
    });
    const target = document.getElementById(viewId);
    if (target) {
      target.classList.add("active");
    }
  }

  toggleAuthMode() {
    this.isRegisterMode = !this.isRegisterMode;
    const authTitle = document.getElementById("authTitle");
    const authSubtitle = document.getElementById("authSubtitle");
    const authSubmitBtn = document.getElementById("authSubmitBtn");
    const nameGroup = document.getElementById("nameGroup");
    const authToggleText = document.getElementById("authToggleText");
    const authToggleLink = document.getElementById("authToggleLink");

    if (this.isRegisterMode) {
      authTitle.textContent = "Create Account";
      authSubtitle.textContent = "Register to access your organization dashboard.";
      authSubmitBtn.textContent = "Register";
      nameGroup.style.display = "flex";
      authToggleText.textContent = "Already have an account?";
      authToggleLink.textContent = "Login";
    } else {
      authTitle.textContent = "Welcome Back!";
      authSubtitle.textContent = "Login to access your dashboard.";
      authSubmitBtn.textContent = "Login";
      nameGroup.style.display = "none";
      authToggleText.textContent = "Don't have an account?";
      authToggleLink.textContent = "Register";
    }
  }

  handleAuthSubmit(e) {
    e.preventDefault();
    const email = document.getElementById("authEmail").value.trim().toLowerCase();
    const password = document.getElementById("authPassword").value.trim();
    const role = document.getElementById("authRole").value;

    if (this.isRegisterMode) {
      const name = document.getElementById("authName").value.trim();
      if (!name) {
        this.showToast("Please enter your full name", "error");
        return;
      }
      const existing = this.users.find((u) => u.email === email);
      if (existing) {
        this.showToast("An account with this email already exists!", "error");
        return;
      }

      const newUser = {
        id: "u_" + Date.now(),
        name: name,
        email: email,
        password: password,
        role: role,
        casualTotal: 12,
        medicalTotal: 10
      };

      this.users.push(newUser);
      this.saveUsers();
      this.currentUser = newUser;
      sessionStorage.setItem("lms_session", JSON.stringify(newUser));
      this.showToast("Account registered successfully!", "success");
      this.routeDashboard();
    } else {
      // Login
      const user = this.users.find((u) => u.email === email && u.password === password && u.role === role);
      if (!user) {
        // Relax check for demo convenience if password isn't matched
        const fallback = this.users.find((u) => u.email === email && u.role === role);
        if (fallback) {
          this.currentUser = fallback;
          sessionStorage.setItem("lms_session", JSON.stringify(fallback));
          this.showToast("Logged in successfully!", "success");
          this.routeDashboard();
          return;
        }
        this.showToast("Invalid email, password, or account role", "error");
        return;
      }

      this.currentUser = user;
      sessionStorage.setItem("lms_session", JSON.stringify(user));
      this.showToast("Logged in successfully!", "success");
      this.routeDashboard();
    }
  }

  routeDashboard() {
    if (!this.currentUser) {
      this.showView("loginView");
      return;
    }

    if (this.currentUser.role === "Manager") {
      this.renderManagerDashboard();
      this.showView("managerView");
    } else {
      this.renderEmployeeDashboard();
      this.showView("employeeView");
    }
  }

  logout() {
    sessionStorage.removeItem("lms_session");
    this.currentUser = null;
    this.showView("loginView");
    this.showToast("Logged out successfully", "success");
  }

  // ==========================================
  // EMPLOYEE DASHBOARD
  // ==========================================
  renderEmployeeDashboard() {
    const user = this.currentUser;
    if (!user) return;

    // Header greeting
    document.getElementById("empWelcomeTitle").textContent = `Welcome, ${user.name}!`;
    document.getElementById("empWelcomeSubtitle").textContent = `Employee Dashboard · ${user.email}`;

    // Fill form prefill
    document.getElementById("applyEmpName").value = user.name;
    document.getElementById("applyEmpEmail").value = user.email;

    // Calculate balances
    const empRequests = this.requests.filter((r) => r.employeeEmail.toLowerCase() === user.email.toLowerCase());

    const approvedCasual = empRequests
      .filter((r) => r.leaveType === "Casual Leave" && r.status === "Approved")
      .reduce((sum, r) => sum + Number(r.days || 0), 0);

    const approvedMedical = empRequests
      .filter((r) => r.leaveType === "Medical Leave" && r.status === "Approved")
      .reduce((sum, r) => sum + Number(r.days || 0), 0);

    const pendingCount = empRequests.filter((r) => r.status === "Pending").length;

    const casualTotal = user.casualTotal || 12;
    const medicalTotal = user.medicalTotal || 10;

    const casualRemaining = Math.max(0, casualTotal - approvedCasual);
    const medicalRemaining = Math.max(0, medicalTotal - approvedMedical);

    document.getElementById("empCasualBalance").textContent = `${casualRemaining} / ${casualTotal}`;
    document.getElementById("empMedicalBalance").textContent = `${medicalRemaining} / ${medicalTotal}`;
    document.getElementById("empPendingCount").textContent = pendingCount;

    // Set minimum start date as today or reasonable
    const todayStr = new Date().toISOString().split("T")[0];
    document.getElementById("applyStartDate").setAttribute("min", todayStr);
    document.getElementById("applyEndDate").setAttribute("min", todayStr);

    // Render table
    this.renderEmployeeHistoryTable(empRequests);
  }

  renderEmployeeHistoryTable(empRequests) {
    const tbody = document.getElementById("empHistoryTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (empRequests.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 24px; color: #94a3b8;">No leave requests submitted yet. Apply using the form above!</td></tr>`;
      return;
    }

    // Sort descending by applied date / id
    const sorted = [...empRequests].sort((a, b) => (b.id > a.id ? 1 : -1));

    sorted.forEach((req) => {
      const tr = document.createElement("tr");

      let badgeClass = "badge-pending";
      if (req.status === "Approved") badgeClass = "badge-approved";
      if (req.status === "Rejected") badgeClass = "badge-rejected";

      const remarksDisplay = req.managerRemarks
        ? `<span class="manager-remarks-text">${this.escapeHtml(req.managerRemarks)}</span>`
        : `<span style="color:#94a3b8; font-size:12px;">—</span>`;

      tr.innerHTML = `
        <td style="font-weight:600;">${this.escapeHtml(req.leaveType)}</td>
        <td>${this.escapeHtml(req.datesFormatted || `${req.startDate} – ${req.endDate}`)}</td>
        <td>${req.days}</td>
        <td>${this.escapeHtml(req.reason)}</td>
        <td><span class="badge ${badgeClass}">${req.status}</span></td>
        <td>${remarksDisplay}</td>
        <td style="color:#64748b; font-size:12px;">${req.appliedOn || "Recently"}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  handleApplyLeave(e) {
    e.preventDefault();
    const user = this.currentUser;
    if (!user) return;

    const leaveType = document.getElementById("applyLeaveType").value;
    const startDate = document.getElementById("applyStartDate").value;
    const endDate = document.getElementById("applyEndDate").value;
    const reason = document.getElementById("applyReason").value.trim();

    if (!startDate || !endDate) {
      this.showToast("Please select valid start and end dates", "error");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      this.showToast("End date cannot be earlier than start date!", "error");
      return;
    }

    // Calculate days inclusive
    const timeDiff = end.getTime() - start.getTime();
    const days = Math.floor(timeDiff / (1000 * 3600 * 24)) + 1;

    // Check available balance
    const empRequests = this.requests.filter((r) => r.employeeEmail.toLowerCase() === user.email.toLowerCase());
    const approvedUsed = empRequests
      .filter((r) => r.leaveType === leaveType && r.status === "Approved")
      .reduce((sum, r) => sum + Number(r.days || 0), 0);

    const totalAllowed = leaveType === "Casual Leave" ? (user.casualTotal || 12) : (user.medicalTotal || 10);
    const available = totalAllowed - approvedUsed;

    if (days > available) {
      this.showToast(`Insufficient ${leaveType} balance! Available: ${available} days`, "error");
      return;
    }

    // Format dates as dd/mm/yyyy - dd/mm/yyyy
    const formatDate = (dateObj) => {
      const d = String(dateObj.getDate());
      const m = String(dateObj.getMonth() + 1);
      const y = dateObj.getFullYear();
      return `${d}/${m}/${y}`;
    };

    const datesFormatted = `${formatDate(start)} – ${formatDate(end)}`;
    const todayFormatted = new Date().toISOString().split("T")[0];

    const newRequest = {
      id: "req-" + Date.now(),
      employeeName: user.name,
      employeeEmail: user.email,
      leaveType: leaveType,
      startDate: startDate,
      endDate: endDate,
      datesFormatted: datesFormatted,
      days: days,
      reason: reason,
      status: "Pending",
      managerRemarks: "",
      appliedOn: todayFormatted
    };

    this.requests.unshift(newRequest);
    this.saveRequests();

    document.getElementById("applyReason").value = "";
    this.showToast("Leave request submitted successfully!", "success");
    this.renderEmployeeDashboard();
  }

  // ==========================================
  // MANAGER DASHBOARD
  // ==========================================
  renderManagerDashboard() {
    const user = this.currentUser;
    if (!user) return;

    document.getElementById("mgrWelcomeTitle").textContent = `Welcome, ${user.name}!`;
    document.getElementById("mgrWelcomeSubtitle").textContent = `Manager Dashboard · ${user.email}`;

    this.updateManagerStats();
    this.renderManagerTable();
  }

  updateManagerStats() {
    const total = this.requests.length;
    const pending = this.requests.filter((r) => r.status === "Pending").length;
    const approved = this.requests.filter((r) => r.status === "Approved").length;

    document.getElementById("mgrTotalRequests").textContent = total;
    document.getElementById("mgrPendingRequests").textContent = pending;
    document.getElementById("mgrApprovedRequests").textContent = approved;
  }

  renderManagerTable(filterQuery = "") {
    const tbody = document.getElementById("mgrRequestsTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    const query = filterQuery.toLowerCase().trim();
    const filtered = this.requests.filter((req) => {
      if (!query) return true;
      return (
        req.employeeName.toLowerCase().includes(query) ||
        req.employeeEmail.toLowerCase().includes(query) ||
        req.leaveType.toLowerCase().includes(query) ||
        req.reason.toLowerCase().includes(query)
      );
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 24px; color: #94a3b8;">No matching leave requests found.</td></tr>`;
      return;
    }

    filtered.forEach((req) => {
      const tr = document.createElement("tr");

      let badgeClass = "badge-pending";
      if (req.status === "Approved") badgeClass = "badge-approved";
      if (req.status === "Rejected") badgeClass = "badge-rejected";

      let actionContent = "";
      if (req.status === "Pending") {
        actionContent = `
          <div style="display:flex; align-items:center;">
            <button type="button" class="btn-action-approve" onclick="openReviewModal('${req.id}', 'Approve')">Approve</button>
            <button type="button" class="btn-action-reject" onclick="openReviewModal('${req.id}', 'Reject')">Reject</button>
            <button type="button" class="btn-action-history" title="View Leave History" onclick="openEmployeeHistoryModal('${this.escapeHtml(req.employeeEmail)}')">History</button>
          </div>
        `;
      } else {
        const remarksDisplay = req.managerRemarks ? this.escapeHtml(req.managerRemarks) : req.status;
        actionContent = `
          <div style="display:flex; align-items:center; gap: 8px;">
            <span style="font-size: 12.5px; color: #475569; font-weight: 500;">${remarksDisplay}</span>
            <button type="button" class="btn-action-history" title="View Leave History" onclick="openEmployeeHistoryModal('${this.escapeHtml(req.employeeEmail)}')">History</button>
          </div>
        `;
      }

      tr.innerHTML = `
        <td><a href="javascript:void(0)" class="employee-link" onclick="openEmployeeHistoryModal('${this.escapeHtml(req.employeeEmail)}')">${this.escapeHtml(req.employeeName)}</a></td>
        <td class="emp-email-text">${this.escapeHtml(req.employeeEmail)}</td>
        <td>${this.escapeHtml(req.leaveType)}</td>
        <td>${this.escapeHtml(req.datesFormatted || `${req.startDate} – ${req.endDate}`)}</td>
        <td>${req.days}</td>
        <td>${this.escapeHtml(req.reason)}</td>
        <td><span class="badge ${badgeClass}">${req.status}</span></td>
        <td>${actionContent}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // ==========================================
  // REVIEW MODAL (ACCEPT / REJECT WITH REASON)
  // ==========================================
  openReviewModal(requestId, action) {
    const req = this.requests.find((r) => r.id === requestId);
    if (!req) return;

    this.activeReviewRequestId = requestId;
    this.activeReviewAction = action;

    const modal = document.getElementById("reviewModal");
    const title = document.getElementById("reviewModalTitle");
    const confirmBtn = document.getElementById("reviewConfirmBtn");
    const empInfo = document.getElementById("reviewModalEmpInfo");
    const reasonInput = document.getElementById("reviewReasonInput");

    title.textContent = `${action} Leave Request`;
    if (action === "Approve") {
      confirmBtn.className = "btn btn-primary";
      confirmBtn.style.backgroundColor = "#16a34a";
      confirmBtn.textContent = "Confirm Approval";
      reasonInput.value = "Approved by manager";
    } else {
      confirmBtn.className = "btn btn-primary";
      confirmBtn.style.backgroundColor = "#dc2626";
      confirmBtn.textContent = "Confirm Rejection";
      reasonInput.value = "Rejected due to urgent project deliverables";
    }

    empInfo.innerHTML = `
      <div><strong>Employee:</strong> ${this.escapeHtml(req.employeeName)} (${this.escapeHtml(req.employeeEmail)})</div>
      <div><strong>Leave Type:</strong> ${this.escapeHtml(req.leaveType)} &bull; <strong>Duration:</strong> ${req.days} Day(s)</div>
      <div><strong>Dates:</strong> ${this.escapeHtml(req.datesFormatted || `${req.startDate} – ${req.endDate}`)}</div>
      <div><strong>Reason:</strong> ${this.escapeHtml(req.reason)}</div>
    `;

    modal.classList.add("active");
    reasonInput.focus();
  }

  submitReview() {
    const requestId = this.activeReviewRequestId;
    const action = this.activeReviewAction;
    const reasonInput = document.getElementById("reviewReasonInput");
    const remarks = reasonInput.value.trim();

    if (!requestId || !action) return;

    const req = this.requests.find((r) => r.id === requestId);
    if (req) {
      req.status = action === "Approve" ? "Approved" : "Rejected";
      req.managerRemarks = remarks || (action === "Approve" ? "Approved" : "Rejected");
      this.saveRequests();
      this.showToast(`Leave request ${req.status.toLowerCase()} successfully!`, "success");
    }

    this.closeModals();
    this.updateManagerStats();
    const searchVal = document.getElementById("mgrSearchInput").value;
    this.renderManagerTable(searchVal);
  }

  // ==========================================
  // EMPLOYEE HISTORY MODAL (MANAGER VIEW)
  // ==========================================
  openEmployeeHistoryModal(employeeEmail) {
    const empRequests = this.requests.filter((r) => r.employeeEmail.toLowerCase() === employeeEmail.toLowerCase());
    const empUser = this.users.find((u) => u.email.toLowerCase() === employeeEmail.toLowerCase());

    const empName = empUser ? empUser.name : (empRequests[0] ? empRequests[0].employeeName : employeeEmail);
    const casualTotal = empUser ? (empUser.casualTotal || 12) : 12;
    const medicalTotal = empUser ? (empUser.medicalTotal || 10) : 10;

    const approvedCasual = empRequests
      .filter((r) => r.leaveType === "Casual Leave" && r.status === "Approved")
      .reduce((sum, r) => sum + Number(r.days || 0), 0);

    const approvedMedical = empRequests
      .filter((r) => r.leaveType === "Medical Leave" && r.status === "Approved")
      .reduce((sum, r) => sum + Number(r.days || 0), 0);

    const modal = document.getElementById("empHistoryModal");
    document.getElementById("historyModalTitle").textContent = `Leave History: ${empName}`;
    document.getElementById("historyModalSubtitle").textContent = `${employeeEmail} · Total Applications: ${empRequests.length}`;

    const statsRow = document.getElementById("historyModalStats");
    statsRow.innerHTML = `
      <div class="history-mini-stat">
        <div class="mini-label">Casual Leave Balance</div>
        <div class="mini-val">${Math.max(0, casualTotal - approvedCasual)} / ${casualTotal}</div>
      </div>
      <div class="history-mini-stat">
        <div class="mini-label">Medical Leave Balance</div>
        <div class="mini-val">${Math.max(0, medicalTotal - approvedMedical)} / ${medicalTotal}</div>
      </div>
      <div class="history-mini-stat">
        <div class="mini-label">Approved Days Taken</div>
        <div class="mini-val">${approvedCasual + approvedMedical} Days</div>
      </div>
    `;

    const tbody = document.getElementById("historyModalTableBody");
    tbody.innerHTML = "";

    if (empRequests.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px; color:#94a3b8;">No records found for this employee.</td></tr>`;
    } else {
      empRequests.forEach((req) => {
        const tr = document.createElement("tr");
        let badgeClass = "badge-pending";
        if (req.status === "Approved") badgeClass = "badge-approved";
        if (req.status === "Rejected") badgeClass = "badge-rejected";

        tr.innerHTML = `
          <td style="font-weight:600;">${this.escapeHtml(req.leaveType)}</td>
          <td>${this.escapeHtml(req.datesFormatted || `${req.startDate} – ${req.endDate}`)}</td>
          <td>${req.days}</td>
          <td>${this.escapeHtml(req.reason)}</td>
          <td><span class="badge ${badgeClass}">${req.status}</span></td>
          <td style="font-size:12px; color:#475569;">${this.escapeHtml(req.managerRemarks || "—")}</td>
          <td style="color:#64748b; font-size:12px;">${req.appliedOn || "Recently"}</td>
        `;
        tbody.appendChild(tr);
      });
    }

    modal.classList.add("active");
  }

  closeModals() {
    document.querySelectorAll(".modal-overlay").forEach((modal) => {
      modal.classList.remove("active");
    });
    this.activeReviewRequestId = null;
    this.activeReviewAction = null;
  }

  showToast(message, type = "success") {
    const toast = document.getElementById("toastNotification");
    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast show ${type}`;

    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.className = "toast";
    }, 3200);
  }

  escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

// Global instance and bridge functions
let appInstance;
document.addEventListener("DOMContentLoaded", () => {
  appInstance = new LeaveApp();
});

function handleLogout() {
  if (appInstance) appInstance.logout();
}

function handleManagerSearch() {
  if (appInstance) {
    const query = document.getElementById("mgrSearchInput").value;
    appInstance.renderManagerTable(query);
  }
}

function openReviewModal(requestId, action) {
  if (appInstance) appInstance.openReviewModal(requestId, action);
}

function closeReviewModal() {
  if (appInstance) appInstance.closeModals();
}

function openEmployeeHistoryModal(email) {
  if (appInstance) appInstance.openEmployeeHistoryModal(email);
}

function closeHistoryModal() {
  if (appInstance) appInstance.closeModals();
}

function fillDemo(email, role) {
  const emailInput = document.getElementById("authEmail");
  const roleSelect = document.getElementById("authRole");
  const passInput = document.getElementById("authPassword");

  if (emailInput) emailInput.value = email;
  if (roleSelect) roleSelect.value = role;
  if (passInput) passInput.value = "password123";

  if (appInstance && appInstance.isRegisterMode) {
    appInstance.toggleAuthMode();
  }
}
