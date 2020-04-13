import 'source-map-support/register'
import { CustomAuthorizerHandler, CustomAuthorizerEvent } from 'aws-lambda'
import { verify } from 'jsonwebtoken'
import { JwtToken } from '../../auth/JwtToken'
import * as AWS from 'aws-sdk'

const auth0SecretId = process.env.AUTH_0_SECRET_ID
const auth0SecretField = process.env.AUTH_0_SECRET_FIELD

const client = new AWS.SecretsManager()

let cachedSecret: string
 
export const handler: CustomAuthorizerHandler = async (event: CustomAuthorizerEvent) => {

    try {

        const decodedToken = await verifyToken(event.authorizationToken)

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

}

async function verifyToken(authHeader: string): Promise<JwtToken> {


    if (!authHeader) {
        throw new Error("No auth header")
    }

    if (!authHeader.toLocaleLowerCase().startsWith('bearer')) {
        throw new Error("Invalid auth header")
    }

    const split = authHeader.split(' ')
    const token = split[1]

    const secretObject = await getSecret()
    const secret = secretObject[auth0SecretField]

    return verify(token, secret) as JwtToken
}

async function getSecret() {

    if (cachedSecret) return cachedSecret

    const data = await client.getSecretValue({
        SecretId: auth0SecretId
    }).promise()

    cachedSecret = data.SecretString

    return JSON.parse(cachedSecret)


}