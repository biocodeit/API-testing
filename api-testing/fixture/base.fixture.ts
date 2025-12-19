import {test as base} from '@playwright/test'
import { getenvVar } from '../helpers/env-setup'

export const test = base.extend<{accessToken: string}>({
    accessToken : async({request}, use) => {
        //get acess token for authorization
        const accessTokenRequest =await request.post(`https://${getenvVar('CLIENT')}.us.auth0.com/oauth/token`, {
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
        await use(accessToki)
    }
})
         
export {expect} from '@playwright/test'
            
