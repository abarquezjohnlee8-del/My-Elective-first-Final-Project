// ============================================================================
// SkillMap — Universal OJT Student Readiness & E-Portfolio
// ============================================================================

const STORAGE_KEYS = {
  SKILLS: "skillmap_universal_skills_v1",
  INSTITUTE: "skillmap_universal_institute_v1",
  TRACK: "skillmap_universal_track_v1",
  TARGET_ROLES: "skillmap_universal_target_roles_v1",
  PORTFOLIO: "skillmap_universal_portfolio_v1",
  STUDENT: "skillmap_universal_student_v1"
};

let state = {
  institute: "",
  track: "",
  skills: [],
  targetRoles: [],
  portfolio: [],
  student: {
    name: "",
    program: "",
    hours: "",
    portfolioLink: "",
    linkedin: "",
    objective: ""
  }
};

// ============================================================================
// Persistence
// ============================================================================
function loadState() {
  state.institute = localStorage.getItem(STORAGE_KEYS.INSTITUTE) || "";
  state.track = localStorage.getItem(STORAGE_KEYS.TRACK) || "";
  state.skills = JSON.parse(localStorage.getItem(STORAGE_KEYS.SKILLS) || "[]");
  state.targetRoles = JSON.parse(localStorage.getItem(STORAGE_KEYS.TARGET_ROLES) || "[]");
  state.portfolio = JSON.parse(localStorage.getItem(STORAGE_KEYS.PORTFOLIO) || "[]");
  state.student = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.STUDENT) ||
      JSON.stringify({ name: "", program: "", hours: "", portfolioLink: "", linkedin: "", objective: "" })
  );
}

function saveSkills() {
  localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(state.skills));
}

function saveAffiliation() {
  localStorage.setItem(STORAGE_KEYS.INSTITUTE, state.institute);
  localStorage.setItem(STORAGE_KEYS.TRACK, state.track);
}

function saveTargetRoles() {
  localStorage.setItem(STORAGE_KEYS.TARGET_ROLES, JSON.stringify(state.targetRoles));
}

function savePortfolio() {
  localStorage.setItem(STORAGE_KEYS.PORTFOLIO, JSON.stringify(state.portfolio));
}

function saveStudentProfile() {
  localStorage.setItem(STORAGE_KEYS.STUDENT, JSON.stringify(state.student));
}

// ============================================================================
// Button Dropdown Navigation
// ============================================================================
function switchTab(tabName) {
  const items = document.querySelectorAll(".nav-dropdown-item");
  const panels = document.querySelectorAll(".tab-panel");
  const currentLabel = document.getElementById("nav-current-label");

  items.forEach((item) => {
    const isTarget = item.dataset.tab === tabName;
    item.classList.toggle("active", isTarget);
    if (isTarget) {
      currentLabel.textContent = item.querySelector("span").textContent;
    }
  });

  panels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === `tab-${tabName}`);
  });
}

function initNavigation() {
  const dropdown = document.getElementById("nav-dropdown");
  const toggleBtn = document.getElementById("nav-dropdown-btn");
  const menu = document.getElementById("nav-dropdown-menu");
  const items = document.querySelectorAll(".nav-dropdown-item");

  toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = !menu.classList.contains("hidden");
    menu.classList.toggle("hidden", isOpen);
    dropdown.classList.toggle("open", !isOpen);
    toggleBtn.setAttribute("aria-expanded", String(!isOpen));
  });

  items.forEach((item) => {
    item.addEventListener("click", () => {
      switchTab(item.dataset.tab);
      menu.classList.add("hidden");
      dropdown.classList.remove("open");
      toggleBtn.setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) {
      menu.classList.add("hidden");
      dropdown.classList.remove("open");
      toggleBtn.setAttribute("aria-expanded", "false");
    }
  });
}

// ============================================================================
// EPIC 1: Student Skill Profile & User-Input OJT Roles
// ============================================================================
function initSkillAndRoleBuilders() {
  const instituteInput = document.getElementById("student-institute");
  const trackInput = document.getElementById("academic-track");

  instituteInput.value = state.institute;
  trackInput.value = state.track;
  updateHeaderPill();

  const handleAffiliationChange = () => {
    state.institute = instituteInput.value.trim();
    state.track = trackInput.value.trim();
    saveAffiliation();
    updateHeaderPill();
  };

  instituteInput.addEventListener("input", handleAffiliationChange);
  trackInput.addEventListener("input", handleAffiliationChange);

  // Add Skill / Competency
  const skillForm = document.getElementById("skill-form");
  skillForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const nameInput = document.getElementById("skill-name");
    const levelInput = document.getElementById("skill-level");
    const categoryInput = document.getElementById("skill-category");

    document.getElementById("err-skill-name").textContent = "";
    document.getElementById("err-skill-level").textContent = "";

    let valid = true;
    const rawName = nameInput.value.trim();
    if (!rawName) {
      document.getElementById("err-skill-name").textContent = "Skill or competency name is required.";
      valid = false;
    }
    if (!levelInput.value) {
      document.getElementById("err-skill-level").textContent = "Please select a proficiency level.";
      valid = false;
    }
    if (!valid) return;

    const existingIdx = state.skills.findIndex(
      (s) => s.name.toLowerCase() === rawName.toLowerCase()
    );

    const skillObj = {
      id: existingIdx !== -1 ? state.skills[existingIdx].id : "sk-" + Date.now(),
      name: rawName,
      level: levelInput.value,
      category: categoryInput.value
    };

    if (existingIdx !== -1) {
      state.skills[existingIdx] = skillObj;
    } else {
      state.skills.push(skillObj);
    }

    saveSkills();
    skillForm.reset();
    refreshAllViews();
  });

  // Toggle Student Target OJT Role Form
  const roleDrawer = document.getElementById("target-role-form");
  const openDrawerBtn = document.getElementById("btn-toggle-role-form");
  const cancelDrawerBtn = document.getElementById("btn-cancel-role-form");

  openDrawerBtn.addEventListener("click", () => {
    roleDrawer.classList.toggle("hidden");
  });

  cancelDrawerBtn.addEventListener("click", () => {
    roleDrawer.reset();
    clearRoleFormErrors();
    roleDrawer.classList.add("hidden");
  });

  // Submit Student Target OJT Role
  roleDrawer.addEventListener("submit", (e) => {
    e.preventDefault();
    clearRoleFormErrors();

    const titleInput = document.getElementById("role-title");
    const companyInput = document.getElementById("role-company");
    const modalityInput = document.getElementById("role-modality");
    const hoursInput = document.getElementById("role-hours");
    const skillsInput = document.getElementById("role-skills");

    let valid = true;
    if (!titleInput.value.trim()) {
      document.getElementById("err-role-title").textContent = "Target OJT role title is required.";
      valid = false;
    }
    if (!companyInput.value.trim()) {
      document.getElementById("err-role-company").textContent = "Host company or agency name is required.";
      valid = false;
    }

    const parsedSkills = skillsInput.value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (parsedSkills.length === 0) {
      document.getElementById("err-role-skills").textContent = "Enter at least one required skill or qualification.";
      valid = false;
    }

    if (!valid) return;

    const newTargetRole = {
      id: "role-" + Date.now(),
      role: titleInput.value.trim(),
      company: companyInput.value.trim(),
      modality: modalityInput.value,
      hours: hoursInput.value.trim() || "486",
      requiredSkills: parsedSkills
    };

    state.targetRoles.unshift(newTargetRole);
    saveTargetRoles();

    roleDrawer.reset();
    roleDrawer.classList.add("hidden");
    refreshAllViews();
  });
}

function clearRoleFormErrors() {
  document.getElementById("err-role-title").textContent = "";
  document.getElementById("err-role-company").textContent = "";
  document.getElementById("err-role-skills").textContent = "";
}

function updateHeaderPill() {
  const pill = document.getElementById("student-institute-pill");
  const parts = [state.institute, state.track].filter(Boolean);
  pill.textContent = parts.length ? parts.join(" • ") : "Institute / Dept: Not Set";
}

function removeSkill(skillId) {
  state.skills = state.skills.filter((s) => s.id !== skillId);
  saveSkills();
  refreshAllViews();
}

function removeTargetRole(roleId) {
  state.targetRoles = state.targetRoles.filter((r) => r.id !== roleId);
  saveTargetRoles();
  refreshAllViews();
}

function computeRoleCompatibility(targetRole, skillList = state.skills) {
  const userSkillNames = skillList.map((s) => s.name.toLowerCase().trim());
  const matched = [];
  const missing = [];

  targetRole.requiredSkills.forEach((req) => {
    if (userSkillNames.includes(req.toLowerCase().trim())) {
      matched.push(req);
    } else {
      missing.push(req);
    }
  });

  const percentage = targetRole.requiredSkills.length
    ? Math.round((matched.length / targetRole.requiredSkills.length) * 100)
    : 0;

  return { percentage, matched, missing };
}

function renderSkillBank() {
  const container = document.getElementById("user-skills-list");
  document.getElementById("skill-count-stat").textContent = state.skills.length;

  if (state.skills.length === 0) {
    container.innerHTML = `<p class="muted">No skills added yet. Input your skills or competencies above.</p>`;
    return;
  }

  container.innerHTML = "";
  state.skills.forEach((sk) => {
    const pill = document.createElement("span");
    pill.className = "skill-pill";
    pill.innerHTML = `
      <strong>${escapeHtml(sk.name)}</strong>
      <span class="lvl">${escapeHtml(sk.level)}</span>
      <button type="button" title="Remove skill">&times;</button>
    `;
    pill.querySelector("button").addEventListener("click", () => removeSkill(sk.id));
    container.appendChild(pill);
  });
}

function renderTargetRoles() {
  const listEl = document.getElementById("internship-list");

  let highMatchCount = 0;
  const enriched = state.targetRoles.map((role) => {
    const compat = computeRoleCompatibility(role);
    if (compat.percentage >= 80) highMatchCount++;
    return { ...role, compat };
  });

  document.getElementById("nav-match-badge").textContent = `${highMatchCount} High Match`;

  if (enriched.length === 0) {
    listEl.innerHTML = `
      <div class="empty-state-card">
        <h3>No Target OJT Roles Added Yet</h3>
        <p class="muted">Click <strong>"+ Input Target OJT Role"</strong> above to enter an internship position and its required qualifications so SkillMap can calculate your readiness.</p>
      </div>
    `;
    return;
  }

  listEl.innerHTML = "";
  enriched.forEach((role) => {
    const { percentage, matched, missing } = role.compat;
    const badgeClass = percentage >= 75 ? "match-high" : percentage >= 40 ? "match-mid" : "match-low";

    const card = document.createElement("div");
    card.className = "intern-card";
    card.innerHTML = `
      <div class="intern-top">
        <div>
          <div class="intern-role">${escapeHtml(role.role)}</div>
          <div class="intern-company">${escapeHtml(role.company)}</div>
        </div>
        <span class="match-badge ${badgeClass}">${percentage}% Match</span>
      </div>

      <div class="intern-meta-row">
        <span class="tag">${escapeHtml(role.modality)}</span>
        <span class="tag">${escapeHtml(role.hours)} OJT Hours</span>
        ${matched.map((s) => `<span class="tag tag-matched">&check; ${escapeHtml(s)}</span>`).join("")}
        ${missing.map((s) => `<span class="tag tag-missing">${escapeHtml(s)}</span>`).join("")}
      </div>

      <div class="intern-actions">
        <button type="button" class="btn btn-secondary btn-sm analyze-btn">Inspect Skill Gap</button>
        <button type="button" class="btn btn-danger-soft btn-sm remove-role-btn">Remove Role</button>
      </div>
    `;

    card.querySelector(".analyze-btn").addEventListener("click", () => {
      document.getElementById("analyzer-role-select").value = role.id;
      renderRoleBreakdown();
      switchTab("compatibility");
    });

    card.querySelector(".remove-role-btn").addEventListener("click", () => removeTargetRole(role.id));

    listEl.appendChild(card);
  });
}

// ============================================================================
// EPIC 2: Compatibility & Gap Analyzer
// ============================================================================
function initCompatibilityAnalyzer() {
  const select = document.getElementById("analyzer-role-select");
  select.addEventListener("change", renderRoleBreakdown);

  const simForm = document.getElementById("simulator-form");
  simForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const skillQuery = document.getElementById("simulator-skill-input").value.trim();
    if (!skillQuery) return;
    runWhatIfSimulation(skillQuery);
  });
}

function syncAnalyzerDropdown() {
  const select = document.getElementById("analyzer-role-select");
  const previousValue = select.value;

  if (state.targetRoles.length === 0) {
    select.innerHTML = `<option value="">-- Add a target OJT role first --</option>`;
    return;
  }

  select.innerHTML = state.targetRoles
    .map((r) => `<option value="${r.id}">${escapeHtml(r.role)} — ${escapeHtml(r.company)}</option>`)
    .join("");

  if (state.targetRoles.some((r) => r.id === previousValue)) {
    select.value = previousValue;
  }
}

function renderRoleBreakdown() {
  syncAnalyzerDropdown();
  const container = document.getElementById("role-gap-breakdown");

  if (state.targetRoles.length === 0) {
    container.innerHTML = `<p class="muted">Input at least one target OJT role in Section 1 to analyze your skill compatibility.</p>`;
    return;
  }

  const roleId = document.getElementById("analyzer-role-select").value;
  const role = state.targetRoles.find((r) => r.id === roleId) || state.targetRoles[0];
  const { percentage, matched, missing } = computeRoleCompatibility(role);

  const statusBanner =
    percentage >= 80
      ? `<div class="alert alert-success"><strong>High Readiness (${percentage}%):</strong> You meet almost all qualifications you entered for this OJT placement.</div>`
      : `<div class="alert alert-warning"><strong>Skill-Gap Notice (${percentage}%):</strong> Acquiring ${missing.length} missing qualification(s) will strengthen your application.</div>`;

  const missingSection =
    missing.length === 0
      ? `<p class="muted">Zero missing skills for this position.</p>`
      : missing
          .map(
            (skill) => `
            <div class="gap-tip-card">
              <strong>Missing: ${escapeHtml(skill)}</strong>
              <p class="muted" style="margin-top:3px;">Prep Action: Review core concepts, complete a practical exercise or sample output, and document your work in your e-portfolio.</p>
            </div>
          `
          )
          .join("");

  container.innerHTML = `
    ${statusBanner}
    <div class="mb-16">
      <strong>Matched Skills (${matched.length}/${role.requiredSkills.length}):</strong>
      <div class="intern-meta-row">
        ${
          matched.length
            ? matched.map((m) => `<span class="tag tag-matched">&check; ${escapeHtml(m)}</span>`).join("")
            : `<span class="muted">None matched yet</span>`
        }
      </div>
    </div>
    <div>
      <strong>Missing / Gap Qualifications (${missing.length}):</strong>
      ${missingSection}
    </div>
  `;
}

function runWhatIfSimulation(prospectiveSkill) {
  const resultsEl = document.getElementById("simulator-results");

  if (state.targetRoles.length === 0) {
    resultsEl.innerHTML = `<div class="alert alert-warning">Add at least one target OJT role in Section 1 before running a simulation.</div>`;
    return;
  }

  const alreadyHas = state.skills.some(
    (s) => s.name.toLowerCase() === prospectiveSkill.toLowerCase()
  );

  if (alreadyHas) {
    resultsEl.innerHTML = `<div class="alert alert-warning"><strong>${escapeHtml(prospectiveSkill)}</strong> is already in your skill profile.</div>`;
    return;
  }

  const simulatedSkills = [...state.skills, { name: prospectiveSkill, level: "Beginner" }];
  const improvedRoles = [];

  state.targetRoles.forEach((role) => {
    const before = computeRoleCompatibility(role, state.skills).percentage;
    const after = computeRoleCompatibility(role, simulatedSkills).percentage;
    if (after > before) {
      improvedRoles.push({ role: role.role, company: role.company, before, after });
    }
  });

  if (improvedRoles.length === 0) {
    resultsEl.innerHTML = `
      <div class="alert alert-warning">
        <strong>${escapeHtml(prospectiveSkill)}</strong> was not listed among the required qualifications of your current target OJT roles.
      </div>
    `;
    return;
  }

  resultsEl.innerHTML = `
    <div class="alert alert-success">
      Acquiring <strong>${escapeHtml(prospectiveSkill)}</strong> increases your compatibility score across <strong>${improvedRoles.length}</strong> of your target OJT role(s):
    </div>
    ${improvedRoles
      .map(
        (item) => `
      <div class="gap-tip-card" style="border-left-color: var(--success);">
        <strong>${escapeHtml(item.role)}</strong> (${escapeHtml(item.company)})<br/>
        <span class="muted">Match Score: ${item.before}% &rarr; <strong>${item.after}%</strong></span>
      </div>
    `
      )
      .join("")}
  `;
}

// ============================================================================
// EPIC 3: E-Portfolio Organizer & Export
// ============================================================================
function initPortfolio() {
  document.getElementById("stud-name").value = state.student.name || "";
  document.getElementById("stud-program").value = state.student.program || "";
  document.getElementById("stud-hours").value = state.student.hours || "";
  document.getElementById("stud-portfolio-link").value = state.student.portfolioLink || "";
  document.getElementById("stud-linkedin").value = state.student.linkedin || "";
  document.getElementById("stud-objective").value = state.student.objective || "";

  document.getElementById("student-profile-form").addEventListener("submit", (e) => {
    e.preventDefault();
    state.student = {
      name: document.getElementById("stud-name").value.trim(),
      program: document.getElementById("stud-program").value.trim(),
      hours: document.getElementById("stud-hours").value.trim(),
      portfolioLink: document.getElementById("stud-portfolio-link").value.trim(),
      linkedin: document.getElementById("stud-linkedin").value.trim(),
      objective: document.getElementById("stud-objective").value.trim()
    };
    saveStudentProfile();
    const status = document.getElementById("student-save-status");
    status.textContent = "Student profile saved";
    setTimeout(() => (status.textContent = ""), 2500);
  });

  const projForm = document.getElementById("portfolio-form");
  projForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const titleInput = document.getElementById("proj-title");
    const stackInput = document.getElementById("proj-stack");

    document.getElementById("err-proj-title").textContent = "";
    document.getElementById("err-proj-stack").textContent = "";

    let valid = true;
    if (!titleInput.value.trim()) {
      document.getElementById("err-proj-title").textContent = "Output, project, or certification title is required.";
      valid = false;
    }
    if (!stackInput.value.trim()) {
      document.getElementById("err-proj-stack").textContent = "Please list at least one skill or tool applied.";
      valid = false;
    }
    if (!valid) return;

    const editId = document.getElementById("proj-edit-id").value;
    const item = {
      id: editId || "proj-" + Date.now(),
      title: titleInput.value.trim(),
      category: document.getElementById("proj-category").value,
      role: document.getElementById("proj-role").value.trim(),
      stack: stackInput.value.trim(),
      url: document.getElementById("proj-url").value.trim(),
      desc: document.getElementById("proj-desc").value.trim(),
      featured: document.getElementById("proj-featured").checked
    };

    if (editId) {
      const idx = state.portfolio.findIndex((p) => p.id === editId);
      if (idx !== -1) state.portfolio[idx] = item;
    } else {
      state.portfolio.unshift(item);
    }

    savePortfolio();
    resetPortfolioForm();
    renderPortfolioFeed();
  });

  document.getElementById("btn-cancel-proj").addEventListener("click", resetPortfolioForm);
  document.getElementById("filter-proj-cat").addEventListener("change", renderPortfolioFeed);
  document.getElementById("filter-proj-tech").addEventListener("input", renderPortfolioFeed);

  document.getElementById("btn-export-print").addEventListener("click", openPrintablePortfolio);
  document.getElementById("btn-export-csv").addEventListener("click", downloadPortfolioCsv);
  document.getElementById("btn-close-modal").addEventListener("click", () => {
    document.getElementById("print-modal").classList.add("hidden");
  });
  document.getElementById("btn-trigger-print").addEventListener("click", () => window.print());
}

function resetPortfolioForm() {
  document.getElementById("portfolio-form").reset();
  document.getElementById("proj-edit-id").value = "";
  document.getElementById("portfolio-form-title").textContent = "Add Output, Project, or Certification";
  document.getElementById("btn-save-proj").textContent = "Save to E-Portfolio";
  document.getElementById("btn-cancel-proj").classList.add("hidden");
}

function startEditProject(id) {
  const proj = state.portfolio.find((p) => p.id === id);
  if (!proj) return;

  document.getElementById("proj-edit-id").value = proj.id;
  document.getElementById("proj-title").value = proj.title;
  document.getElementById("proj-category").value = proj.category;
  document.getElementById("proj-role").value = proj.role;
  document.getElementById("proj-stack").value = proj.stack;
  document.getElementById("proj-url").value = proj.url;
  document.getElementById("proj-desc").value = proj.desc;
  document.getElementById("proj-featured").checked = Boolean(proj.featured);

  document.getElementById("portfolio-form-title").textContent = "Edit E-Portfolio Entry";
  document.getElementById("btn-save-proj").textContent = "Update Entry";
  document.getElementById("btn-cancel-proj").classList.remove("hidden");
}

function deleteProject(id) {
  state.portfolio = state.portfolio.filter((p) => p.id !== id);
  savePortfolio();
  renderPortfolioFeed();
}

function renderPortfolioFeed() {
  const feed = document.getElementById("portfolio-feed");
  const catFilter = document.getElementById("filter-proj-cat").value;
  const techQuery = document.getElementById("filter-proj-tech").value.trim().toLowerCase();

  let items = [...state.portfolio].sort((a, b) => Number(b.featured) - Number(a.featured));

  if (catFilter !== "ALL") {
    items = items.filter((p) => p.category === catFilter);
  }
  if (techQuery) {
    items = items.filter((p) => p.stack.toLowerCase().includes(techQuery));
  }

  if (items.length === 0) {
    feed.innerHTML = `<p class="muted">No e-portfolio entries added yet or matching your filter.</p>`;
    return;
  }

  feed.innerHTML = "";
  items.forEach((proj) => {
    const card = document.createElement("div");
    card.className = `proj-card ${proj.featured ? "featured" : ""}`;

    const stackTags = proj.stack
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => `<span class="tag">${escapeHtml(t)}</span>`)
      .join("");

    card.innerHTML = `
      <div class="proj-top">
        <div>
          <strong>${escapeHtml(proj.title)}</strong>
          <span class="tag" style="margin-left:6px;">${escapeHtml(proj.category)}</span>
          ${proj.featured ? `<span class="tag tag-matched">Featured</span>` : ""}
          ${proj.role ? `<div class="muted">Role: ${escapeHtml(proj.role)}</div>` : ""}
        </div>
        <div class="export-controls">
          <button type="button" class="btn btn-secondary btn-sm edit-btn">Edit</button>
          <button type="button" class="btn btn-secondary btn-sm del-btn">Delete</button>
        </div>
      </div>
      <div class="intern-meta-row">${stackTags}</div>
      ${proj.desc ? `<p class="muted">${escapeHtml(proj.desc)}</p>` : ""}
      ${
        proj.url
          ? `<a class="proj-link" href="${escapeHtml(proj.url)}" target="_blank" rel="noopener noreferrer">View Output / Credential &rarr;</a>`
          : ""
      }
    `;

    card.querySelector(".edit-btn").addEventListener("click", () => startEditProject(proj.id));
    card.querySelector(".del-btn").addEventListener("click", () => deleteProject(proj.id));
    feed.appendChild(card);
  });
}

function openPrintablePortfolio() {
  const reportArea = document.getElementById("printable-report-area");
  const evaluatedRoles = state.targetRoles
    .map((r) => ({ ...r, compat: computeRoleCompatibility(r) }))
    .sort((a, b) => b.compat.percentage - a.compat.percentage);

  const affiliationText = [state.institute, state.track].filter(Boolean).join(" — ") || "Not specified";

  reportArea.innerHTML = `
    <h2>SkillMap — Student OJT Readiness &amp; E-Portfolio Summary</h2>
    <p class="muted">Generated on ${new Date().toLocaleDateString()} | Institute / Specialization: ${escapeHtml(affiliationText)}</p>

    <h3 class="mt-16">1. Student Details</h3>
    <table class="report-table">
      <tr><th>Full Name</th><td>${escapeHtml(state.student.name || "Not specified")}</td></tr>
      <tr><th>Institute / Department</th><td>${escapeHtml(state.institute || "Not specified")}</td></tr>
      <tr><th>Program &amp; Specialization</th><td>${escapeHtml([state.student.program, state.track].filter(Boolean).join(" — ") || "Not specified")}</td></tr>
      <tr><th>Required OJT Hours</th><td>${escapeHtml(state.student.hours || "Not specified")}</td></tr>
      <tr><th>Portfolio / LinkedIn</th><td>${escapeHtml([state.student.portfolioLink, state.student.linkedin].filter(Boolean).join(" | ") || "Not specified")}</td></tr>
      <tr><th>OJT Objective</th><td>${escapeHtml(state.student.objective || "Not specified")}</td></tr>
    </table>

    <h3>2. Skill &amp; Competency Inventory (${state.skills.length})</h3>
    <table class="report-table">
      <thead><tr><th>Skill / Tool</th><th>Category</th><th>Proficiency</th></tr></thead>
      <tbody>
        ${
          state.skills.length
            ? state.skills
                .map(
                  (s) =>
                    `<tr><td>${escapeHtml(s.name)}</td><td>${escapeHtml(s.category)}</td><td>${escapeHtml(s.level)}</td></tr>`
                )
                .join("")
            : `<tr><td colspan="3">No skills recorded.</td></tr>`
        }
      </tbody>
    </table>

    <h3>3. E-Portfolio Outputs &amp; Certifications (${state.portfolio.length})</h3>
    <table class="report-table">
      <thead><tr><th>Title</th><th>Category</th><th>Skills / Tools Applied</th><th>Link</th></tr></thead>
      <tbody>
        ${
          state.portfolio.length
            ? state.portfolio
                .map(
                  (p) =>
                    `<tr><td>${escapeHtml(p.title)}</td><td>${escapeHtml(p.category)}</td><td>${escapeHtml(p.stack)}</td><td>${escapeHtml(p.url || "-")}</td></tr>`
                )
                .join("")
            : `<tr><td colspan="4">No e-portfolio entries recorded.</td></tr>`
        }
      </tbody>
    </table>

    <h3>4. Target OJT Roles &amp; Compatibility (${evaluatedRoles.length})</h3>
    <table class="report-table">
      <thead><tr><th>Role</th><th>Host Organization</th><th>Work Setup</th><th>Compatibility</th></tr></thead>
      <tbody>
        ${
          evaluatedRoles.length
            ? evaluatedRoles
                .map(
                  (m) =>
                    `<tr><td>${escapeHtml(m.role)}</td><td>${escapeHtml(m.company)}</td><td>${escapeHtml(m.modality)}</td><td><strong>${m.compat.percentage}%</strong></td></tr>`
                )
                .join("")
            : `<tr><td colspan="4">No target OJT roles entered.</td></tr>`
        }
      </tbody>
    </table>
  `;

  document.getElementById("print-modal").classList.remove("hidden");
}

function downloadPortfolioCsv() {
  const rows = [
    ["SECTION", "TITLE / FIELD", "CATEGORY / VALUE", "DETAILS / SKILLS", "URL / EXTRA"],
    ["STUDENT", "Full Name", state.student.name || "", "", ""],
    ["STUDENT", "Institute / Dept", state.institute || "", "", ""],
    ["STUDENT", "Program", state.student.program || "", "", ""],
    ["STUDENT", "Specialization", state.track || "", "", ""],
    ["STUDENT", "Required Hours", state.student.hours || "", "", ""]
  ];

  state.skills.forEach((s) => {
    rows.push(["SKILL", s.name, s.category, s.level, ""]);
  });

  state.portfolio.forEach((p) => {
    rows.push(["PORTFOLIO", p.title, p.category, p.stack, p.url]);
  });

  const csv = rows
    .map((r) => r.map((cell) => `"${String(cell || "").replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "SkillMap_OJT_Portfolio.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function refreshAllViews() {
  renderSkillBank();
  renderTargetRoles();
  renderRoleBreakdown();
}

// ============================================================================
// Boot
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
  loadState();
  initNavigation();
  initSkillAndRoleBuilders();
  initCompatibilityAnalyzer();
  initPortfolio();

  refreshAllViews();
  renderPortfolioFeed();
});