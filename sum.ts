import {test as base} from '@playwright/test'
import { getenvVar } from '../helpers/env-setup'

export const test = base.extend<{accessToken: string}>({
    accessToken : async({request}, use) => {
        //get acess token for authorization
        const accessTokenRequest =await request.post('https://dev-mgookyv6tfz7u120.us.auth0.com/oauth/token', {
            headers: {'content-type': 'application/json'},
            data : {
                  client_id: getenvVar('CLIENT_ID'),
                  client_secret: getenvVar('CLIENT_SECRET'),
                  audience:getenvVar('AUDIENCE'),
                  grant_type: "client_credentials"
                    }
                })
        !accessTokenRequest.ok()?console.log(await accessTokenRequest.json()):null
        const body = await accessTokenRequest.json()
        const accessToki = await body.access_token
        console.log(accessToki)
        await use(accessToki)
    }
})
         
export {expect} from '@playwright/test'
            
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env') , 
                quiet: true});

export function getenvVar(name:string){
    const variable = process.env[name]
    if(variable)
        {return process.env[name]}
    else{throw new Error(name+ '- variable does not exist in .env file')}

}import {test , expect } from './fixture/base.fixture'


test('check create and delete user', async({request, accessToken})=> {
    //this test will create user then delete user and cofirm the same
 
    //fill toekn into header
    const authheader = {
            "authorization" : `Bearer ${accessToken}`,
            "accept": "application/json",
            "content-type" : "application/json",
            }

    const uniqueUsername = `user_${Date.now()}@gmail.com` 
    console.log(uniqueUsername)

    //create a unique user in DB
    const createNewUserRequest = await request.post('https://dev-mgookyv6tfz7u120.us.auth0.com/api/v2/users',
        {   headers : authheader,
            data : {
                email: uniqueUsername,
                password: 'Strong@12345',
                connection: 'Username-Password-Authentication',
                email_verified: true
            }
        }
    )

    const userId = (await createNewUserRequest.json()).user_id
    expect(await createNewUserRequest.ok()).toBeTruthy()
    console.log('created'+uniqueUsername+' ==> with user id'+userId)

    //check if user is present in DB
    const confirmUserRequest= await request.get(`https://dev-mgookyv6tfz7u120.us.auth0.com/api/v2/users/${userId}`,
        {headers : authheader}
    )
    !confirmUserRequest.ok()? console.log(await confirmUserRequest.json()): null
    expect(await confirmUserRequest.json()).toHaveProperty('name', uniqueUsername)

    //wait till user is updateed in index
    await expect(async () => {
    const response = await request.get('https://dev-mgookyv6tfz7u120.us.auth0.com/api/v2/users',{headers: authheader});
    expect(await response.text()).toContain(userId);
    }).toPass({
    intervals: [1_000, 2_000, 10_000],
    timeout: 60_000
    });
    // get the users list and numberof users
    const userListRequest = await request.get('https://dev-mgookyv6tfz7u120.us.auth0.com/api/v2/users',{headers: authheader})
    !userListRequest.ok()? console.log(await userListRequest.json()): null
    const numbOfUserBeforeDelete = (await userListRequest.json()).length
    console.log(numbOfUserBeforeDelete)

    //delete the user
    const deleteUserRequest = await request.delete(`https://dev-mgookyv6tfz7u120.us.auth0.com/api/v2/users/${userId}`, {headers: authheader})
    expect(deleteUserRequest.ok()).toBeTruthy()
    
    //wait till user deleted in index
    await expect(async () => {
    const response = await request.get('https://dev-mgookyv6tfz7u120.us.auth0.com/api/v2/users',{headers: authheader});
    expect(await response.text()).not.toContain(userId);
    }).toPass({
    intervals: [1_000, 2_000, 10_000],
    timeout: 60_000
    });

    //confirm user to be deleted
    const usersAfterDelete = await request.get('https://dev-mgookyv6tfz7u120.us.auth0.com/api/v2/users', { headers: authheader})
    await expect(await usersAfterDelete.json()).toHaveLength(numbOfUserBeforeDelete-1)
    const userArray = await usersAfterDelete.json()
    userArray.forEach(async user => { await expect(user).not.toHaveProperty('name', uniqueUsername )
    })
})

    import { defineConfig, devices } from '@playwright/test';
import { getenvVar } from './api-testing/helpers/env-setup';
/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */


/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
