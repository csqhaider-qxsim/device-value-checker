/**
 * pricing.js
 * ----------
 * Pure calculation logic. No DOM code lives here on purpose — app.js is the
 * only file allowed to touch the page, which makes this file easy to test
 * or reuse (e.g. in a future backend) on its own.
 */

/** How much of a device's launch-year value is left, based on its age. */
function yearFactor(year) {
  const age = Math.max(0, CURRENT_YEAR - year);
  const factor = Math.pow(1 - ANNUAL_DEPRECIATION, age);
  return Math.max(MIN_YEAR_FACTOR, factor);
}

/** The devices available for a given storage GB at a given tier. */
function getStorageOptions(tier) {
  return STORAGE_OPTIONS[tier] || [];
}

/**
 * Calculates a full offer breakdown for one device + one set of answers.
 *
 * @param {object} device - an entry from DEVICES
 * @param {object} answers
 * @param {number} answers.storageGb
 * @param {"excellent"|"good"|"fair"|"poor"} answers.screen
 * @param {"excellent"|"good"|"fair"|"poor"} answers.body
 * @param {"high"|"mid"|"low"|"unknown"} answers.battery
 * @param {"unlocked"|"locked"} answers.lock
 * @param {string[]} answers.faults - keys from FUNCTIONAL_DEDUCTIONS
 * @param {boolean} answers.waterDamage
 * @returns {object} breakdown with every line item plus the final total
 */
function computeOffer(device, answers) {
  const base = TIER_BASE_VALUE[device.tier] * yearFactor(device.year);

  const storageOption =
    getStorageOptions(device.tier).find((o) => o.gb === answers.storageGb) ||
    getStorageOptions(device.tier)[0];
  const storageAdjustment = storageOption ? storageOption.adjustment : 0;

  const subtotal = base + storageAdjustment;

  const screenFactor = CONDITION_FACTORS.screen[answers.screen];
  const bodyFactor = CONDITION_FACTORS.body[answers.body];
  const batteryFactor = CONDITION_FACTORS.battery[answers.battery];
  const lockFactor = CONDITION_FACTORS.lock[answers.lock];

  let conditionAdjusted =
    subtotal * screenFactor * bodyFactor * batteryFactor * lockFactor;

  const faultTotal = (answers.faults || []).reduce(
    (sum, key) => sum + (FUNCTIONAL_DEDUCTIONS[key] || 0),
    0
  );
  conditionAdjusted -= faultTotal;

  if (answers.waterDamage) {
    conditionAdjusted *= WATER_DAMAGE_MULTIPLIER;
  }

  const total = Math.max(MIN_OFFER, Math.round(conditionAdjusted / 5) * 5);

  return {
    device,
    storageGb: storageOption ? storageOption.gb : answers.storageGb,
    base: Math.round(base),
    storageAdjustment,
    screenFactor,
    bodyFactor,
    batteryFactor,
    lockFactor,
    faultTotal,
    waterDamage: !!answers.waterDamage,
    total,
  };
}
