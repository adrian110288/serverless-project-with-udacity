import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { JwtToken } from '../../auth/JwtToken'

// From Auth0 settings
const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJM7IUoE+niBDGMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi13OTF3azU3dy5ldS5hdXRoMC5jb20wHhcNMjAwNDEzMTAyNTUxWhcN
MzMxMjIxMTAyNTUxWjAkMSIwIAYDVQQDExlkZXYtdzkxd2s1N3cuZXUuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtNFOyCdIcyCOgB7u
Ronwe+4DfTD4nt0kCNbAXVl7NgnzpikxuPWTJncSC3PEN8tT4ePGpWuNnbnmiif8
FeTJ1yzBJMEjqg1XQh5ZNk0O9QpR0jFm2A0BzLdHE0JQ9LmQtLANKY8r5A6EsAU+
o0xmBAfsdYTI5KA3VhqrK3nONDGzdodjH2OMo+4ST1xCGmiO0jMiK3p47HDA/RNe
rj9zeAbkPF4UgizqCVObXU3cR/T6mnD29AW+FNOZrGKNJufnKMwpMkamf8m2jU9D
rc7UmAouKN3Uv890TEhxPhLwE2jnU/I3ybxq744qIIg5i3agCjMAIzHgwmvfLVc9
jUb8awIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBTFN2tLXHDO
s0TOmh6I/d+tUJ3/XDAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AGmbFj9rtJf9wr1+wb7uDuVMyCay5bYFEZXFejkVx8aPJ2kmYnKpugXqrf2mKMdW
4eWF1tLg3ulpY5YYouj87z8SUW2noDLcV+seb1hTrAVDfbqWAMF95CG2FG2HxT5k
9zv3adFmZoDGbQSaYJjHOslvHlN7h+Zq6QiZiqu8R0UWFI8ENMJoTpIFz4p0VbWO
AhGLn0+9ZslmtFGGXVG8Npe9bcbdA9NOPF/Iy1Yfb1gp4v8QrZ9qFtFRAel3E0dT
n8I84h63mmNG4oJsnwGyXQ1/JFsZlCEC3RS5JUrk6Yj6A321/JxsqexMc6tVswmq
vnMviyARTda9Bd4rFnJQhoM=
-----END CERTIFICATE-----`

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  try {
    const jwtToken = verifyToken(event.authorizationToken)
    console.log('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
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
  } catch (e) {
    console.log('User authorized', e.message)

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
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtToken
}