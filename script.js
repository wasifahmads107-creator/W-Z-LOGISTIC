// ============================================================
// W-Z LOGISTIC — Truck Driving Simulator
// Menu interactivity: environment / vehicle / control selection,
// coin balance, level path generation, toast feedback.
//
// Card content now comes from the data files loaded before this
// script: environments-data.js, vehicles-data.js, controls-data.js,
// levels-data.js (see VEHICLES, ENVIRONMENTS, CONTROLS, LEVEL_GROUPS).
// ============================================================

(function () {
  "use strict";

  /* ---------- STATE ---------- */
  const state = {
    coins: 25000,
    environment: ENVIRONMENTS.find((e) => e.active)?.id || ENVIRONMENTS[0].id,
    vehicle: VEHICLES.find((v) => v.active)?.id || VEHICLES[0].id,
    control: CONTROLS.find((c) => c.active)?.id || CONTROLS[0].id,
  };

  /* ---------- TOAST ---------- */
  let toastTimer = null;
  function showToast(msg) {
    const toast = document.getElementById("toast");
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
  }

  /* ---------- ENVIRONMENT PICKER ---------- */
  function buildEnvironments() {
    const grid = document.getElementById("envGrid");
    grid.innerHTML = ENVIRONMENTS.map(
      (env) => `
      <button class="env-card${env.active ? " active" : ""}" data-env="${env.id}" data-scheme="${env.scheme}">
        <span class="env-card__art"></span>
        <span class="env-card__label">${env.label}</span>
      </button>`
    ).join("");

    grid.addEventListener("click", (e) => {
      const card = e.target.closest(".env-card");
      if (!card) return;
      grid.querySelectorAll(".env-card").forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
      state.environment = card.dataset.env;
      showToast(`Environment set to ${card.querySelector(".env-card__label").textContent}`);
    });
  }

  /* ---------- MAIN MENU ---------- */
  function initMenu() {
    document.querySelectorAll(".menu-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.dataset.action;
        if (action === "play") {
          showToast(`Starting drive — ${capitalize(state.vehicle)} on ${capitalize(state.environment)}`);
          return;
        }
        showToast(`${capitalize(action.replace("freedrive", "free drive").replace("moregames", "more games"))} opened`);
      });
    });

    document.getElementById("addCoinsBtn").addEventListener("click", () => {
      state.coins += 500;
      document.getElementById("coinValue").textContent = state.coins.toLocaleString();
      showToast("+500 coins added");
    });
  }

  /* ---------- VEHICLE CAROUSEL ---------- */
  function buildVehicles() {
    const track = document.getElementById("vehicleTrack");
    const left = document.getElementById("vehLeft");
    const right = document.getElementById("vehRight");

    track.innerHTML = VEHICLES.map(
      (v) => `
      <button class="vehicle-card${v.active ? " active" : ""}" data-vehicle="${v.id}">
        <span class="vehicle-card__photo">
          <img src="${v.img}" alt="${v.alt}" loading="lazy">
        </span>
        <span class="vehicle-card__label">${v.name}${v.sub ? `<br><small>${v.sub}</small>` : ""}</span>
      </button>`
    ).join("");

    track.addEventListener("click", (e) => {
      const card = e.target.closest(".vehicle-card");
      if (!card) return;
      track.querySelectorAll(".vehicle-card").forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
      state.vehicle = card.dataset.vehicle;
      showToast(`Vehicle selected: ${card.querySelector(".vehicle-card__label").textContent.replace(/\s+/g, " ")}`);
    });

    left.addEventListener("click", () => track.scrollBy({ left: -240, behavior: "smooth" }));
    right.addEventListener("click", () => track.scrollBy({ left: 240, behavior: "smooth" }));
  }

  /* ---------- CONTROL SYSTEM ---------- */
  function buildControls() {
    const grid = document.getElementById("controlGrid");
    grid.innerHTML = CONTROLS.map(
      (c) => `
      <button class="control-card${c.active ? " active" : ""}" data-control="${c.id}">
        <span class="control-card__icon">${c.icon}</span>
        <span>${c.label}</span>
      </button>`
    ).join("");

    grid.addEventListener("click", (e) => {
      const card = e.target.closest(".control-card");
      if (!card) return;
      grid.querySelectorAll(".control-card").forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
      state.control = card.dataset.control;
      showToast(`Control system: ${capitalize(card.dataset.control)}`);
    });
  }

  /* ---------- PREVIEW STRIP ---------- */
  function initPreview() {
    const strip = document.getElementById("previewStrip");
    strip.addEventListener("click", (e) => {
      const card = e.target.closest(".preview-card");
      if (!card) return;
      strip.querySelectorAll(".preview-card").forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
    });
  }

  /* ---------- LEVEL PATH ---------- */
  function buildLevels() {
    const track = document.getElementById("levelsTrack");
    track.innerHTML = "";

    LEVEL_GROUPS.forEach((group, gi) => {
      const groupLabel = document.createElement("div");
      groupLabel.className = "level-group-label";
      groupLabel.textContent = group.label;
      track.appendChild(groupLabel);

      group.levels.forEach((lvl, li) => {
        const node = document.createElement("button");
        node.className = `level-node ${lvl.status}`;
        node.dataset.level = lvl.num;

        const badge =
          lvl.status === "locked"
            ? `<span class="level-node__lock">🔒</span>`
            : `<span class="level-node__stars">${"★".repeat(lvl.stars)}${"☆".repeat(3 - lvl.stars)}</span>`;

        node.innerHTML = `
          <span class="level-node__thumb">
            <span class="level-node__badge">${badge}</span>
          </span>
          <span class="level-node__label">Level ${String(lvl.num).padStart(2, "0")}</span>
        `;

        node.addEventListener("click", () => {
          if (lvl.status === "locked") {
            showToast(`Level ${lvl.num} is locked — finish earlier levels first`);
            return;
          }
          track.querySelectorAll(".level-node").forEach((n) => n.classList.remove("current"));
          node.classList.add("current");
          lvl.status = "current";
          showToast(`Level ${lvl.num} selected`);
        });

        track.appendChild(node);

        const isLastInGroup = li === group.levels.length - 1;
        const isLastGroup = gi === LEVEL_GROUPS.length - 1;
        if (!(isLastInGroup && isLastGroup)) {
          const connector = document.createElement("div");
          connector.className = "level-connector";
          track.appendChild(connector);
        }
      });
    });
  }

  /* ---------- HELPERS ---------- */
  function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /* ---------- INIT ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    buildEnvironments();
    initMenu();
    buildVehicles();
    buildControls();
    initPreview();
    buildLevels();
  });
})();
