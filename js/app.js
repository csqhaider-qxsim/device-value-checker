/**
 * app.js
 * ------
 * The only file that touches the DOM. Reads device/pricing data from
 * data.js, does the math via pricing.js, and renders the result.
 */

const state = {
  brand: "all",
  deviceId: null,
};

const els = {
  brandFilter: document.getElementById("brandFilter"),
  modelSelect: document.getElementById("modelSelect"),
  storageSelect: document.getElementById("storageSelect"),
  progress: document.getElementById("progress"),
  resultValue: document.getElementById("resultValue"),
  resultDevice: document.getElementById("resultDevice"),
  breakdownTable: document.querySelector("#breakdownTable tbody"),
};

// ---------------------------------------------------------------------
// Step 1: brand filter + model + storage selects
// ---------------------------------------------------------------------

function devicesForBrand(brand) {
  return brand === "all" ? DEVICES : DEVICES.filter((d) => d.brand === brand);
}

function populateModelSelect() {
  const options = devicesForBrand(state.brand);
  els.modelSelect.innerHTML = options
    .map((d) => `<option value="${d.id}">${d.brand} ${d.name}</option>`)
    .join("");

  state.deviceId = options.length ? options[0].id : null;
  populateStorageSelect();
}

function populateStorageSelect() {
  const device = DEVICES.find((d) => d.id === state.deviceId);
  if (!device) {
    els.storageSelect.innerHTML = "";
    return;
  }
  const options = getStorageOptions(device.tier);
  els.storageSelect.innerHTML = options
    .map((o) => `<option value="${o.gb}">${o.gb} GB</option>`)
    .join("");
}

els.brandFilter.addEventListener("click", (event) => {
  const button = event.target.closest("[data-brand]");
  if (!button) return;

  state.brand = button.dataset.brand;
  els.brandFilter
    .querySelectorAll(".pill")
    .forEach((p) => p.classList.toggle("is-active", p === button));

  populateModelSelect();
});

els.modelSelect.addEventListener("change", () => {
  state.deviceId = els.modelSelect.value;
  populateStorageSelect();
});

// ---------------------------------------------------------------------
// Step navigation
// ---------------------------------------------------------------------

function goToStep(stepNumber) {
  document.querySelectorAll(".step").forEach((stepEl) => {
    stepEl.classList.toggle("is-hidden", stepEl.dataset.step !== String(stepNumber));
  });
  els.progress.querySelectorAll(".progress-stub").forEach((stub) => {
    const n = Number(stub.dataset.step);
    stub.classList.toggle("is-active", n === stepNumber);
    stub.classList.toggle("is-done", n < stepNumber);
  });
}

document.getElementById("toStep2").addEventListener("click", () => goToStep(2));
document.getElementById("toStep1").addEventListener("click", () => goToStep(1));
document.getElementById("toStep2From3").addEventListener("click", () => goToStep(2));

document.getElementById("toStep3").addEventListener("click", () => {
  renderResult();
  goToStep(3);
});

document.getElementById("startOver").addEventListener("click", () => {
  document.querySelectorAll('.step input[type="radio"]').forEach((input) => {
    input.checked = input.defaultChecked;
  });
  document.querySelectorAll('.step input[type="checkbox"]').forEach((input) => {
    input.checked = false;
  });
  goToStep(1);
});

// ---------------------------------------------------------------------
// Reading the form + rendering the result
// ---------------------------------------------------------------------

function radioValue(name) {
  const checked = document.querySelector(`input[name="${name}"]:checked`);
  return checked ? checked.value : null;
}

function readAnswers() {
  const faults = Array.from(
    document.querySelectorAll('input[name="fault"]:checked')
  ).map((el) => el.value);

  return {
    storageGb: Number(els.storageSelect.value),
    screen: radioValue("screen"),
    body: radioValue("body"),
    battery: radioValue("battery"),
    lock: radioValue("lock"),
    faults,
    waterDamage: document.getElementById("waterDamage").checked,
  };
}

const CONDITION_LABELS = {
  screen: { excellent: "Excellent", good: "Good", fair: "Fair", poor: "Cracked" },
  body: { excellent: "Excellent", good: "Good", fair: "Fair", poor: "Heavily worn" },
  battery: { high: "90% or above", mid: "80–89%", low: "Below 80%", unknown: "Not sure" },
  lock: { unlocked: "Unlocked", locked: "Locked to a carrier" },
};

const FAULT_LABELS = {
  cameraIssue: "Camera",
  speakerMicIssue: "Speaker or mic",
  biometricIssue: "Face ID / fingerprint",
  buttonIssue: "A button",
};

function formatSigned(amount) {
  const rounded = Math.round(amount);
  if (rounded > 0) return `<span class="amt-pos">+£${rounded}</span>`;
  if (rounded < 0) return `<span class="amt-neg">−£${Math.abs(rounded)}</span>`;
  return `<span class="amt-zero">—</span>`;
}

function formatFactorAsAdjustment(factor, base) {
  // Shows the approximate £ impact of a multiplier, for a readable row.
  const impact = Math.round(base * (factor - 1));
  return formatSigned(impact);
}

function renderResult() {
  const device = DEVICES.find((d) => d.id === state.deviceId);
  const answers = readAnswers();
  const offer = computeOffer(device, answers);

  els.resultValue.textContent = `£${offer.total}`;
  els.resultDevice.textContent = `${device.brand} ${device.name} · ${offer.storageGb} GB`;

  const rows = [
    ["Base value", `£${offer.base}`],
    ["Storage", formatSigned(offer.storageAdjustment)],
    [`Screen — ${CONDITION_LABELS.screen[answers.screen]}`, formatFactorAsAdjustment(offer.screenFactor, offer.base + offer.storageAdjustment)],
    [`Back & sides — ${CONDITION_LABELS.body[answers.body]}`, formatFactorAsAdjustment(offer.bodyFactor, offer.base + offer.storageAdjustment)],
    [`Battery — ${CONDITION_LABELS.battery[answers.battery]}`, formatFactorAsAdjustment(offer.batteryFactor, offer.base + offer.storageAdjustment)],
    [`Carrier — ${CONDITION_LABELS.lock[answers.lock]}`, formatFactorAsAdjustment(offer.lockFactor, offer.base + offer.storageAdjustment)],
  ];

  if (answers.faults.length) {
    rows.push([
      `Reported faults — ${answers.faults.map((f) => FAULT_LABELS[f]).join(", ")}`,
      `−£${offer.faultTotal}`,
    ]);
  }

  if (offer.waterDamage) {
    rows.push(["Water damage", "Large reduction applied"]);
  }

  rows.push(["Estimated offer", `£${offer.total}`]);

  els.breakdownTable.innerHTML = rows
    .map(
      ([label, value], i) =>
        `<tr class="${i === rows.length - 1 ? "breakdown-total" : ""}"><td>${label}</td><td>${value}</td></tr>`
    )
    .join("");
}

// ---------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------

populateModelSelect();
goToStep(1);
