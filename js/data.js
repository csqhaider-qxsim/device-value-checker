/**
 * data.js
 * -------
 * The device catalog and every reference number the pricing engine needs.
 *
 * Why models don't carry a hardcoded price:
 * Instead of typing a resale value for every model x storage x condition
 * combination (thousands of numbers to maintain), each device only carries
 * a `tier` and a `year`. pricing.js turns those into a base value at
 * runtime. Add a new phone by adding one line here — no pricing math to
 * duplicate.
 */

// Used for age-based depreciation. Update this each year.
const CURRENT_YEAR = 2026;

// Reference resale value (GBP) for a device in the newest condition state,
// at its smallest common storage size, the year it launched.
const TIER_BASE_VALUE = {
  flagship_pro_max: 700, // iPhone Pro Max / Galaxy Ultra / Pixel Pro XL
  flagship_pro: 600, // iPhone Pro / Galaxy Plus / Pixel Pro
  flagship_air: 560, // iPhone Air (ultra-thin flagship)
  flagship: 470, // iPhone standard / Galaxy S / Pixel standard
  foldable: 780, // Fold-style foldables
  foldable_flip: 560, // Flip-style foldables
  midrange: 300, // e / a / FE / mini variants
  budget: 210, // SE and similar
};

// Roughly how much value a device loses per year on the used market.
// A device loses this fraction of what it was worth the year before.
const ANNUAL_DEPRECIATION = 0.16;
const MIN_YEAR_FACTOR = 0.22; // value never depreciates below this fraction

// Storage upsizes, keyed by tier, in GBP added over the base storage size.
const STORAGE_OPTIONS = {
  flagship_pro_max: [
    { gb: 256, adjustment: 0 },
    { gb: 512, adjustment: 60 },
    { gb: 1024, adjustment: 140 },
  ],
  flagship_pro: [
    { gb: 128, adjustment: 0 },
    { gb: 256, adjustment: 50 },
    { gb: 512, adjustment: 120 },
  ],
  flagship_air: [
    { gb: 256, adjustment: 0 },
    { gb: 512, adjustment: 70 },
  ],
  flagship: [
    { gb: 128, adjustment: 0 },
    { gb: 256, adjustment: 45 },
    { gb: 512, adjustment: 100 },
  ],
  foldable: [
    { gb: 256, adjustment: 0 },
    { gb: 512, adjustment: 65 },
    { gb: 1024, adjustment: 150 },
  ],
  foldable_flip: [
    { gb: 256, adjustment: 0 },
    { gb: 512, adjustment: 55 },
  ],
  midrange: [
    { gb: 64, adjustment: 0 },
    { gb: 128, adjustment: 30 },
    { gb: 256, adjustment: 65 },
  ],
  budget: [
    { gb: 64, adjustment: 0 },
    { gb: 128, adjustment: 25 },
  ],
};

// Multipliers applied on top of the base + storage value.
const CONDITION_FACTORS = {
  screen: { excellent: 1, good: 0.9, fair: 0.72, poor: 0.45 },
  body: { excellent: 1, good: 0.94, fair: 0.82, poor: 0.62 },
  battery: { high: 1, mid: 0.95, low: 0.85, unknown: 0.9 },
  lock: { unlocked: 1, locked: 0.85 },
};

// Flat GBP deductions for reported functional faults.
const FUNCTIONAL_DEDUCTIONS = {
  cameraIssue: 18,
  speakerMicIssue: 12,
  biometricIssue: 22,
  buttonIssue: 10,
};

// Applied as a multiplier, after everything else, if checked.
const WATER_DAMAGE_MULTIPLIER = 0.55;

const MIN_OFFER = 15;

// The device catalog. tier keys must exist in TIER_BASE_VALUE and
// STORAGE_OPTIONS. year is the launch year, used for depreciation.
const DEVICES = [
  // --- Apple -------------------------------------------------------
  { id: "iphone-17-pro-max", brand: "Apple", name: "iPhone 17 Pro Max", year: 2025, tier: "flagship_pro_max" },
  { id: "iphone-17-pro", brand: "Apple", name: "iPhone 17 Pro", year: 2025, tier: "flagship_pro" },
  { id: "iphone-air", brand: "Apple", name: "iPhone Air", year: 2025, tier: "flagship_air" },
  { id: "iphone-17", brand: "Apple", name: "iPhone 17", year: 2025, tier: "flagship" },
  { id: "iphone-17e", brand: "Apple", name: "iPhone 17e", year: 2026, tier: "midrange" },
  { id: "iphone-16-pro-max", brand: "Apple", name: "iPhone 16 Pro Max", year: 2024, tier: "flagship_pro_max" },
  { id: "iphone-16-pro", brand: "Apple", name: "iPhone 16 Pro", year: 2024, tier: "flagship_pro" },
  { id: "iphone-16-plus", brand: "Apple", name: "iPhone 16 Plus", year: 2024, tier: "flagship" },
  { id: "iphone-16", brand: "Apple", name: "iPhone 16", year: 2024, tier: "flagship" },
  { id: "iphone-16e", brand: "Apple", name: "iPhone 16e", year: 2025, tier: "midrange" },
  { id: "iphone-15-pro-max", brand: "Apple", name: "iPhone 15 Pro Max", year: 2023, tier: "flagship_pro_max" },
  { id: "iphone-15-pro", brand: "Apple", name: "iPhone 15 Pro", year: 2023, tier: "flagship_pro" },
  { id: "iphone-15-plus", brand: "Apple", name: "iPhone 15 Plus", year: 2023, tier: "flagship" },
  { id: "iphone-15", brand: "Apple", name: "iPhone 15", year: 2023, tier: "flagship" },
  { id: "iphone-14-pro-max", brand: "Apple", name: "iPhone 14 Pro Max", year: 2022, tier: "flagship_pro_max" },
  { id: "iphone-14-pro", brand: "Apple", name: "iPhone 14 Pro", year: 2022, tier: "flagship_pro" },
  { id: "iphone-14-plus", brand: "Apple", name: "iPhone 14 Plus", year: 2022, tier: "flagship" },
  { id: "iphone-14", brand: "Apple", name: "iPhone 14", year: 2022, tier: "flagship" },
  { id: "iphone-13-pro-max", brand: "Apple", name: "iPhone 13 Pro Max", year: 2021, tier: "flagship_pro_max" },
  { id: "iphone-13-pro", brand: "Apple", name: "iPhone 13 Pro", year: 2021, tier: "flagship_pro" },
  { id: "iphone-13", brand: "Apple", name: "iPhone 13", year: 2021, tier: "flagship" },
  { id: "iphone-13-mini", brand: "Apple", name: "iPhone 13 mini", year: 2021, tier: "midrange" },
  { id: "iphone-se-3", brand: "Apple", name: "iPhone SE (3rd gen)", year: 2022, tier: "budget" },
  { id: "iphone-12", brand: "Apple", name: "iPhone 12", year: 2020, tier: "flagship" },
  { id: "iphone-11", brand: "Apple", name: "iPhone 11", year: 2019, tier: "flagship" },

  // --- Samsung -------------------------------------------------------
  { id: "galaxy-s25-ultra", brand: "Samsung", name: "Galaxy S25 Ultra", year: 2025, tier: "flagship_pro_max" },
  { id: "galaxy-s25-plus", brand: "Samsung", name: "Galaxy S25+", year: 2025, tier: "flagship_pro" },
  { id: "galaxy-s25", brand: "Samsung", name: "Galaxy S25", year: 2025, tier: "flagship" },
  { id: "galaxy-s24-ultra", brand: "Samsung", name: "Galaxy S24 Ultra", year: 2024, tier: "flagship_pro_max" },
  { id: "galaxy-s24-plus", brand: "Samsung", name: "Galaxy S24+", year: 2024, tier: "flagship_pro" },
  { id: "galaxy-s24", brand: "Samsung", name: "Galaxy S24", year: 2024, tier: "flagship" },
  { id: "galaxy-s24-fe", brand: "Samsung", name: "Galaxy S24 FE", year: 2024, tier: "midrange" },
  { id: "galaxy-s23-ultra", brand: "Samsung", name: "Galaxy S23 Ultra", year: 2023, tier: "flagship_pro_max" },
  { id: "galaxy-s23-plus", brand: "Samsung", name: "Galaxy S23+", year: 2023, tier: "flagship_pro" },
  { id: "galaxy-s23", brand: "Samsung", name: "Galaxy S23", year: 2023, tier: "flagship" },
  { id: "galaxy-z-fold-6", brand: "Samsung", name: "Galaxy Z Fold6", year: 2024, tier: "foldable" },
  { id: "galaxy-z-flip-6", brand: "Samsung", name: "Galaxy Z Flip6", year: 2024, tier: "foldable_flip" },
  { id: "galaxy-z-fold-5", brand: "Samsung", name: "Galaxy Z Fold5", year: 2023, tier: "foldable" },
  { id: "galaxy-a55", brand: "Samsung", name: "Galaxy A55", year: 2024, tier: "midrange" },
  { id: "galaxy-a35", brand: "Samsung", name: "Galaxy A35", year: 2024, tier: "budget" },

  // --- Google -------------------------------------------------------
  { id: "pixel-10-pro-xl", brand: "Google", name: "Pixel 10 Pro XL", year: 2025, tier: "flagship_pro_max" },
  { id: "pixel-10-pro", brand: "Google", name: "Pixel 10 Pro", year: 2025, tier: "flagship_pro" },
  { id: "pixel-10", brand: "Google", name: "Pixel 10", year: 2025, tier: "flagship" },
  { id: "pixel-9-pro-xl", brand: "Google", name: "Pixel 9 Pro XL", year: 2024, tier: "flagship_pro_max" },
  { id: "pixel-9-pro", brand: "Google", name: "Pixel 9 Pro", year: 2024, tier: "flagship_pro" },
  { id: "pixel-9", brand: "Google", name: "Pixel 9", year: 2024, tier: "flagship" },
  { id: "pixel-9a", brand: "Google", name: "Pixel 9a", year: 2025, tier: "midrange" },
  { id: "pixel-8-pro", brand: "Google", name: "Pixel 8 Pro", year: 2023, tier: "flagship_pro" },
  { id: "pixel-8", brand: "Google", name: "Pixel 8", year: 2023, tier: "flagship" },
  { id: "pixel-8a", brand: "Google", name: "Pixel 8a", year: 2024, tier: "midrange" },
  { id: "pixel-7-pro", brand: "Google", name: "Pixel 7 Pro", year: 2022, tier: "flagship_pro" },
  { id: "pixel-7", brand: "Google", name: "Pixel 7", year: 2022, tier: "flagship" },
  { id: "pixel-6a", brand: "Google", name: "Pixel 6a", year: 2022, tier: "midrange" },
];
