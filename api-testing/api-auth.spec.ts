import {test , expect } from './fixture/base.fixture'
import { getenvVar } from './helpers/env-setup'


test('check create and delete user', async({request, accessToken})=> {
    //this test will create user then delete user and cofirm the same
    const usersURL = `${getenvVar('AUDIENCE')}users`
    //fill toekn into header
    const authheader = {
            "authorization" : `Bearer ${accessToken}`,
            "accept": "application/json",
            "content-type" : "application/json",
            }

    const uniqueUsername = `user_${Date.now()}@gmail.com` 
    console.log(uniqueUsername)

    //create a unique user in DB
    const createNewUserRequest = await request.post( usersURL ,
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
    const confirmUserRequest= await request.get(`${usersURL}/${userId}`,
        {headers : authheader}
    )
    !confirmUserRequest.ok()? console.log(await confirmUserRequest.json()): null
    expect(await confirmUserRequest.json()).toHaveProperty('name', uniqueUsername)

    //wait till user is updateed in index
    await expect(async () => {
    const response = await request.get(usersURL,{headers: authheader});
    expect(await response.text()).toContain(userId);
    }).toPass({
    intervals: [1_000, 2_000, 10_000],
    timeout: 60_000
    });
    // get the users list and numberof users
    const userListRequest = await request.get(usersURL,{headers: authheader})
    !userListRequest.ok()? console.log(await userListRequest.json()): null
    const numbOfUserBeforeDelete = (await userListRequest.json()).length
    console.log(numbOfUserBeforeDelete)

    //delete the user
    const deleteUserRequest = await request.delete(`${usersURL}/${userId}`, {headers: authheader})
    expect(deleteUserRequest.ok()).toBeTruthy()
    
    //wait till user deleted in index
    await expect(async () => {
    const response = await request.get(usersURL,{headers: authheader});
    expect(await response.text()).not.toContain(userId);
    }).toPass({
    intervals: [1_000, 2_000, 10_000],
    timeout: 60_000
    });

    //confirm user to be deleted by -1 number of users
    const usersAfterDelete = await request.get(usersURL, { headers: authheader})
    await expect(await usersAfterDelete.json()).toHaveLength(numbOfUserBeforeDelete-1)
    const userArray = await usersAfterDelete.json()
    for(const user of userArray) {
        expect(await user).not.toHaveProperty('user_id',userId)
    }
})

    