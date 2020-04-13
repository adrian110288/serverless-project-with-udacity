import 'source-map-support/register'
import { CustomAuthorizerHandler, CustomAuthorizerEvent } from 'aws-lambda'
import { verify } from 'jsonwebtoken'
import { JwtToken } from '../../auth/JwtToken'
import * as middy from 'middy'
import { secretsManager } from 'middy/middlewares'

const auth0SecretId = process.env.AUTH_0_SECRET_ID
const auth0SecretField = process.env.AUTH_0_SECRET_FIELD

export const handler = middy(async (event: CustomAuthorizerEvent, context) => {

    try {

        const decodedToken = verifyToken(
            event.authorizationToken,
            context.AUTH0_SECRET[auth0SecretField])

        return {
            principalId: decodedToken.sub,
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Allow',
                        Resource: '*'
                    }
                ]
            }
        }


    } catch(e) {

        return {
            principalId: 'user',
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Deny',
                        Resource: '*'
                    }
                ]
            }
        }
    }

})

function verifyToken(authHeader: string, secret: string): JwtToken {


    if (!authHeader) {
        throw new Error("No auth header")
    }

    if (!authHeader.toLocaleLowerCase().startsWith('bearer')) {
        throw new Error("Invalid auth header")
    }

    const split = authHeader.split(' ')
    const token = split[1]

    return verify(token, secret) as JwtToken
}

// async function getSecret() {

//     if (cachedSecret) return cachedSecret

//     const data = await client.getSecretValue({
//         SecretId: auth0SecretId
//     }).promise()

//     cachedSecret = data.SecretString

//     return JSON.parse(cachedSecret)


// }

handler.use(
    secretsManager({
      cache: true,
      cacheExpiryInMillis: 60000,
      // Throw an error if can't read the secret
      throwOnFailedCall: true,
      secrets: {
        AUTH0_SECRET: auth0SecretId
      }
    })
  )