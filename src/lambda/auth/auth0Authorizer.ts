import 'source-map-support/register'
import { CustomAuthorizerHandler, CustomAuthorizerEvent } from 'aws-lambda'
import { verify } from 'jsonwebtoken'
import { JwtToken } from '../../auth/JwtToken'

const auth0Secret = process.env.AUTH_0_SECRET
 
export const handler: CustomAuthorizerHandler = async (event: CustomAuthorizerEvent) => {

    try {

        const decodedToken = verifyToken(event.authorizationToken)

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

function verifyToken(authHeader: string): JwtToken {


    if (!authHeader) {
        throw new Error("No auth header")
    }

    if (!authHeader.toLocaleLowerCase().startsWith('bearer')) {
        throw new Error("Invalid auth header")
    }

    const split = authHeader.split(' ')
    const token = split[1]

    return verify(token, auth0Secret) as JwtToken
}