# Appraised — device value estimator

A three-step tool that estimates what an iPhone or Android phone is worth
based on model, storage, and condition. Built as a static site: plain HTML,
CSS, and JavaScript, no build step or framework required.

## Folder structure

```
device-value-checker/
├── index.html          The whole page: header, hero, how-it-works,
│                        the estimator markup, and the "why" section.
├── css/
│   └── styles.css       All styling — colors, type, layout, and every
│                         component (buttons, pills, the ticket cards).
├── js/
│   ├── data.js           The device catalog + all pricing reference
│   │                      numbers (tiers, depreciation rate, storage
│   │                      adjustments, condition factors).
│   ├── pricing.js         The calculation logic. Pure functions only —
│   │                       no DOM access — so it's easy to reason about
│   │                       or reuse later (e.g. behind a real API).
│   └── app.js              The only file that touches the page: reads
│                            the form, calls pricing.js, and renders
│                            the result.
└── README.md
```

Script load order matters and is already set in `index.html`:
`data.js` → `pricing.js` → `app.js`.

## Running it locally in VS Code

No build tools needed. Either:

- Install the **Live Server** extension, then right-click `index.html` →
  "Open with Live Server", or
- Just double-click `index.html` to open it directly in a browser.

## How the pricing works

Instead of hand-typing a price for every model × storage × condition
combination, each device in `data.js` only stores a `tier`
(e.g. `flagship_pro`, `midrange`, `foldable`) and a launch `year`.
`pricing.js` computes a value at runtime:

1. Start from the tier's reference value (`TIER_BASE_VALUE`).
2. Depreciate it based on age (`ANNUAL_DEPRECIATION`).
3. Add the storage adjustment for the selected size.
4. Multiply by condition factors for screen, back/sides, battery
   health, and carrier lock.
5. Subtract flat deductions for any reported faults, and apply a
   larger cut if water damage is checked.

## Extending it

- **Add a phone**: add one object to the `DEVICES` array in `data.js`
  with a `brand`, `name`, `year`, and an existing `tier` key. No pricing
  code to touch.
- **Add a new tier** (e.g. a tablet line): add entries to
  `TIER_BASE_VALUE` and `STORAGE_OPTIONS` in `data.js`.
- **Change how much condition affects price**: adjust the numbers in
  `CONDITION_FACTORS` or `FUNCTIONAL_DEDUCTIONS`.

## Note

The prices this tool shows are illustrative estimates for a portfolio
demo — they are not connected to a live marketplace or real trade-in
pricing feed.
