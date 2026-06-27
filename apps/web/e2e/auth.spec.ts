import { test, expect } from '@playwright/test';

// Reference end-to-end flow. Exercises the REAL app + API + database through a
// browser: the login form, the auth call, the redirect, and a protected page.
// Uses the seeded account (see apps/api/prisma/seed.ts).
//
// Pattern for agents writing E2E: drive the UI like a user (getByLabel/getByRole),
// assert on what the user sees and where they land — and cover the failure path,
// not just the happy one.

const SEEDED_EMAIL = 'admin@example.com';
const SEEDED_PASSWORD = 'Password123!';

test('user can log in and reach the dashboard', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Email').fill(SEEDED_EMAIL);
  await page.getByLabel('Password').fill(SEEDED_PASSWORD);
  await page.getByRole('button', { name: 'Log in' }).click();

  // Lands on the protected dashboard.
  await expect(page).toHaveURL(/\/dashboard/);
});

test('shows an error on wrong credentials and stays on login', async ({
  page,
}) => {
  await page.goto('/login');

  await page.getByLabel('Email').fill(SEEDED_EMAIL);
  await page.getByLabel('Password').fill('definitely-wrong');
  await page.getByRole('button', { name: 'Log in' }).click();

  // An error is shown and we do NOT navigate to the dashboard.
  await expect(page.getByText(/invalid|failed|incorrect/i)).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

test('unauthenticated visit to a protected page redirects to login', async ({
  page,
}) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login/);
});
