# ezwill Playwright UI Checks

Windows-desktop viewport (1920×1080, Chromium w/ Windows UA) checks for the
`ezwillandtrust.com` **Create Your Will** flow.

## Scenario covered

1. Load `/create-your-will/#gf_2`
2. Complete **Get Started** (step 1) and advance
3. On **Family & Beneficiaries** (step 2), answer **Yes** to
   *"Are you married or have a partner?"*
4. Assert additional partner fields appear (conditional logic).
5. Screenshots saved to `screenshots/` at each step.

## Run locally

```bash
cd playwright
npm install
npx playwright install chromium
npm test
npm run report   # open HTML report
```

Override the site under test:

```bash
BASE_URL=https://staging.ezwillandtrust.com npm test
```

## CI

`.github/workflows/playwright-windows.yml` runs on `windows-latest` for every
push / PR / manual dispatch and uploads the HTML report + screenshots as
artifacts.

> Note: the workflow file lives inside this `playwright/` folder for
> self-contained delivery. Move it to the repo root's `.github/workflows/` when
> integrating into the main repo, or set the workflow's working directory to
> `playwright/` (add `defaults.run.working-directory: playwright` at the job
> level).
