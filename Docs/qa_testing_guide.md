# AidConnect QA Testing Guide

This document records only what has been implemented in the testing setup, why it was implemented, and which tools are used.

## 1. QA Objective Completed

The current QA implementation establishes a working automated baseline across three layers:

- frontend unit testing
- backend integration testing
- browser end-to-end smoke testing
- browser end-to-end authenticated testing (separate pipeline path)

This was done to improve release confidence while keeping production code changes minimal and merge-safe for a shared GitHub team project.

## 2. Tools Used

### Frontend Unit Testing

- Jest (via `react-scripts test`)
- React Testing Library
- `@testing-library/jest-dom`

Purpose:

- validate frontend logic and component behavior in isolation
- catch regressions quickly during development and CI

### Backend Integration Testing

- Node.js built-in test runner (`node --test`)
- `node:assert/strict`

Purpose:

- verify Express app startup and endpoint response behavior
- ensure backend availability checks run automatically

### End-to-End Testing

- Playwright (`@playwright/test`)
- Chromium browser runner

Purpose:

- validate real user flow behavior in a browser
- confirm key unauthenticated UI paths are functioning in smoke runs
- validate authenticated staff login and protected navigation in a separate auth run

### CI and Artifacts

- GitHub Actions workflow: `.github/workflows/ci.yml`
- Artifact upload for:
  - frontend build
  - Playwright smoke report
  - Playwright authenticated report

Purpose:

- make test execution consistent in pull requests and pushes
- preserve artifacts for visibility and debugging

## 3. What Was Implemented

### A. Frontend Unit Test Coverage

Implemented test files:

- `client/src/App.test.js`
  - placeholder sanity check only (`expect(true).toBe(true)`)
- `client/src/services/duplicationService.test.js`
  - duplication detection behavior
  - fail-open behavior on duplicate-check failure
  - priority score and label mapping
- `client/src/context/AuthContext.test.jsx`
  - session hydration behavior
  - login session creation and refresh behavior
  - logout cleanup and redirect behavior
- `client/src/components/ProtectedRoute.test.jsx`
  - loading state behavior
  - unauthenticated redirect behavior
  - role-based redirect behavior
  - authorized render behavior
- `client/src/services/api.test.js`
  - beneficiary validation behavior
  - duplicate beneficiary protection behavior
  - create-beneficiary payload shaping/trimming
  - beneficiary delete guard behavior
  - request status validation behavior
  - delivery completion status update behavior

Why this was done:

- these modules contain high-impact business and access logic
- regressions in these areas can silently break operations

### B. Backend Integration Coverage

Implemented test file:

- `server/index.test.js`
  - verifies `GET /` health endpoint response
  - verifies unknown routes return `404`
  - verifies CORS middleware headers are applied
  - verifies malformed JSON request payloads return `400`

Supporting production-safe update:

- `server/index.js`
  - exports `app`
  - starts listening only when executed directly (`require.main === module`)

Why this was done:

- allows integration testing without changing runtime behavior
- verifies API service availability in an automated way
- verifies core middleware and error-path behavior used by all routes

### C. End-to-End Browser Smoke Coverage

Implemented files:

- `client/playwright.config.js`
  - configures Playwright smoke execution and local static build server startup
  - runs only unauthenticated smoke spec (`auth-smoke.spec.js`) to keep smoke output clean
- `client/e2e/auth-smoke.spec.js`
  - landing page load verification
  - landing-to-login navigation verification
  - empty login validation feedback verification
- `client/playwright.auth.config.js`
  - configures authenticated Playwright run against real env configuration
  - loads `client/.env` for local authenticated execution
  - runs against a built app served locally for E2E stability
- `client/e2e/authenticated-role.spec.js`
  - role-based authenticated browser login verification
  - validates successful login by asserting dashboard page content
  - auto-skips only when required E2E environment variables are missing

Why this was done:

- confirms visible user behavior in a real browser
- provides quick smoke confidence before deeper E2E expansion
- provides a safe path to authenticated E2E without breaking smoke tests in local or CI

### D. Script and Repository Support

Updated files:

- `client/package.json`
  - `test:ci`
  - `test:e2e`
  - `test:e2e:auth`
  - `build:test`
  - `build:test:real`
  - `serve:build`
  - `start:test`
  - `start:test:real`
- `server/package.json`
  - `test` script set to `node --test`
- `.gitignore`
  - ignores Playwright generated folders (`client/test-results/`, `client/playwright-report/`)

Why this was done:

- standardizes test commands for local and CI use
- avoids committing generated test artifacts
- aligns E2E startup with static build serving (avoids dev-server deprecation noise)

### E. CI Workflow Enhancements

Updated file:

- `.github/workflows/ci.yml`

Implemented behavior:

- frontend, backend, and smoke E2E jobs run in CI
- dedicated authenticated E2E job (`e2e-auth`) added as a separate path
- authenticated E2E runs only when required secrets are present
- authenticated E2E is non-blocking on `feature/*` branches
- frontend tests run via `npm test -- --watchAll=false --passWithNoTests` in CI
- smoke E2E runs via `npx playwright test --config=playwright.config.js` in CI
- authenticated E2E runs via `npx playwright test --config=playwright.auth.config.js` when enabled
- frontend build and Playwright reports are uploaded as artifacts
- smoke E2E is included in `security-scan` dependency chain

Why this was done:

- ensures all test layers execute in automation
- makes failures and evidence visible to the team

## 4. Commands Used by the Team

Note: local QA commands below are the standardized team commands. CI uses workflow-specific commands documented in section 3.E.

### Frontend Tests

Run from `client/`:

```bash
npm run test:ci
```

### Backend Tests

Run from `server/`:

```bash
npm test
```

### E2E Smoke Tests

Run from `client/`:

```bash
npm run test:e2e
```

### E2E Authenticated Tests

Run from `client/`:

```bash
npm run test:e2e:auth
```

## 5. Verified Outcomes

Latest validated outcomes:

- frontend unit tests pass
- backend integration tests pass
- Playwright E2E smoke tests pass with 0 skips
- Playwright authenticated E2E test passes with valid credentials and project configuration

## 6. CI Secrets Required for Authenticated E2E

The `e2e-auth` CI job requires the following GitHub Actions secrets:

- `REACT_APP_APPWRITE_ENDPOINT`
- `REACT_APP_APPWRITE_PROJECT_ID`
- `REACT_APP_APPWRITE_DATABASE_ID`
- `E2E_STAFF_EMAIL`
- `E2E_STAFF_PASSWORD`

If any are missing, the authenticated test step is intentionally skipped and the workflow continues.

## 7. Exact Test Specifications (Current Files)

This section lists exactly what each test case asserts today.

### A. Frontend Unit Tests

`client/src/App.test.js`

- `placeholder`
  - asserts `true === true`
  - note: this test does not validate app behavior and should be replaced with real assertions later

`client/src/services/duplicationService.test.js`

- `calculates priority score from urgency and vulnerability`
  - expects `getPriorityScore('EMERGENCY', 'CRITICAL')` to be `80`
  - expects `getPriorityScore('LOW', 'LOW')` to be `20`
  - expects fallback behavior for unknown urgency (`10`)
- `maps priority score to a critical label`
  - expects score `75` to map to label `Critical`
  - expects score `35` to map to label `Medium`
- `returns duplicate document when an active request exists`
  - mocks duplicate request lookup
  - asserts query contains beneficiary ID, aid type, recency filter, and non-rejected status
  - asserts return object `{ isDuplicate: true, duplicate }`
- `fails open when duplicate lookup errors`
  - forces lookup failure
  - asserts safe return `{ isDuplicate: false, duplicate: null }`
- `returns beneficiary aid history in descending order`
  - asserts returned documents are from mocked response
  - asserts query includes descending `$createdAt` and limit `20`

`client/src/services/api.test.js`

- `createBeneficiary rejects empty full name`
  - expects rejection with `Full name is required.`
- `createBeneficiary rejects duplicate national ID`
  - mocks existing beneficiary and expects duplicate-ID rejection
- `createBeneficiary trims values and creates document`
  - mocks non-duplicate path
  - asserts `createDocument` called for DB `aidconnect_db`, collection `beneficiaries`
  - asserts payload fields are trimmed (`fullName`, `uniqueId`, `location`, `phone`, `notes`)
- `deleteBeneficiary blocks when active requests exist`
  - mocks active request
  - expects rejection with active-request guard message
- `updateAidRequestStatus rejects invalid status`
  - expects invalid status to throw `Invalid status: INVALID`
- `updateDeliveryStatus stamps delivery date when delivered`
  - asserts `updateDocument` includes `status: delivered` and string `deliveryDate`

`client/src/context/AuthContext.test.jsx`

- `hydrates user session and exposes permissions`
  - mocks active account with label `ngoadmin`
  - asserts loading becomes false
  - asserts role is `ngoadmin`
  - asserts default page is `dashboard`
  - asserts permission checks for creating requests and accessing reports are `true`
- `login creates a session then re-checks account`
  - mocks first `account.get` failure (no session), then success as `fieldofficer`
  - asserts `createEmailPasswordSession` called with test credentials
  - asserts role updates to `fieldofficer`
- `logout clears client state and redirects even if session deletion fails`
  - mocks existing `viewer` session and forced delete-session failure
  - asserts user state clears to `none`
  - asserts navigation to `landing`
  - asserts localStorage keys `token` and `user` are removed

`client/src/components/ProtectedRoute.test.jsx`

- `renders loading state while auth is resolving`
  - asserts `Loading...` is shown and no redirect occurs
- `redirects unauthenticated users to login`
  - asserts navigation to `login`
  - asserts protected container renders empty
- `redirects unauthorized staff to dashboard`
  - with role `fieldofficer`, asserts redirect to `dashboard`
- `redirects beneficiary to beneficiary portal when role is not allowed`
  - with role `beneficiary`, asserts redirect to `beneficiary-portal`
- `renders content for authorized users`
  - with role `ngoadmin`, asserts secure content is rendered and no redirect occurs

### B. Backend Integration Tests

`server/index.test.js`

- `GET / returns service health message`
  - asserts HTTP `200`
  - asserts response body `AidConnect API is running`
- `returns 404 for unknown routes`
  - asserts HTTP `404` on missing route
- `applies CORS headers on responses`
  - sends request with Origin header
  - asserts HTTP `200`
  - asserts `access-control-allow-origin` header is `*`
- `returns 400 for malformed JSON payloads`
  - sends malformed JSON payload
  - asserts HTTP `400`

### C. End-to-End Browser Tests

`client/e2e/auth-smoke.spec.js`

- `opens landing page and navigates to login`
  - opens `/`
  - asserts `AidConnect` brand text is visible
  - asserts `Sign In` button is visible
  - clicks `Sign In`
  - asserts `Welcome back` and `Sign In as Staff` are visible on login view
- `shows validation when login is submitted empty`
  - opens login from landing
  - submits without credentials
  - asserts validation message `Please fill in all fields.` is visible

`client/e2e/authenticated-role.spec.js`

- `staff login reaches protected navigation (missing env)`
  - intentionally skips when any required env key is missing:
    - `E2E_STAFF_EMAIL`
    - `E2E_STAFF_PASSWORD`
    - `REACT_APP_APPWRITE_ENDPOINT`
    - `REACT_APP_APPWRITE_PROJECT_ID`
- `staff login reaches protected navigation`
  - opens `/`
  - navigates to login and submits staff credentials from env vars
  - asserts `AidConnect` text is visible after login
  - asserts dashboard heading `Dashboard Overview` is visible
