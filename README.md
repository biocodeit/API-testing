# API Testing with Playwright

This repo demonstrates API end-to-end testing using Playwright.
It focuses on chaining APIs to test real user flows, with secure auth handling.

## Features
1. Playwright **fixtures** for pre-test setup
2. Auth0 **authentication & authorization** (client credentials flow)
3. Secure config using **.env** (no secrets committed)
4. API flow: **Create → Verify → Delete user**
5. Uses **POST, GET, DELETE** methods

## Tech Stack
Playwright · TypeScript · Node.js · Auth0 · dotenv

## Usage
```
git clone https://github.com/biocodeit/API-testing.git
cd API-testing
npm install
cp api-testing/helpers/.env.example api-testing/helpers/.env
# add your Auth0 credentials in .env
npx playwright test
```

## Prerequisites
- Auth0 account with Management API access
- Required permissions enabled for user create/delete
- .env is gitignored. Secrets are never pushed.

## Common Errors & Fixes (Auth0)
- 401 / 403 errors
  Check Monitoring → Logs in Auth0. Usually missing API permissions.
  Enable required scopes in Applications → Your App → APIs tab.

- Get user credential
  from Dashboard → Applications → Your API → Quickstart .

- Token generation fails
  Verify credentials from Dashboard → Applications → Your API → Quickstart.

- User not created / deleted
  Ensure Management API permissions are granted for create/delete users.
  > application> your application > api tab > click on “⌄” to expand > select needed permissions then update

- Email verification issues
  Use { email_verified: true } while creating users to avoid emails.
  Optional: integrate Mailtrap via Branding → Email Provider → SMTP.

- Domain validation errors
  Use a real-looking domain like @gmail.com.

 - useful sectios in dashboard:
     - application
     - authentication> database
     - user management
     - monitoring 

