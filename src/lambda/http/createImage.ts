import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import * as uuid from 'uuid'

const docClient = new AWS.DynamoDB.DocumentClient()

const s3 = new AWS.S3({
  signatureVersion: 'v4'
})

const groupsTable = process.env.GROUPS_TABLE
const imagesTable = process.env.IMAGES_TABLE
const bucket = process.env.IMAGES_S3_BUCKET
const signedUrlExpiration = process.env.SIGNED_URL_EXPIRATION

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Caller event', event)
  const groupId = event.pathParameters.groupId
  const validGroupId = await groupExists(groupId)

  if (!validGroupId) {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Group does not exist'
      })
    }
  }

  const imageId = uuid.v4()
  const timestamp = new Date().toISOString()
  const newImage = JSON.parse(event.body)
  const imageUrl = `https://${bucket}.s3.amazonaws.com/${imageId}`

  const newItem = {
      groupId,
      timestamp,
      imageId,
      ...newImage,
      imageUrl
  }

  await docClient.put({
    TableName: imagesTable,
    Item: newItem
  }).promise()

  const uploadUrl = s3.getSignedUrl('putObject', {
    Bucket: bucket,
    Key: imageId,
    Expires: parseInt(signedUrlExpiration)
  })

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ 
      newItem,
      uploadUrl 
    })
  }
}

async function groupExists(groupId: string) {
  const result = await docClient
    .get({
      TableName: groupsTable,
      Key: {
        id: groupId
      }
    })
    .promise()

  console.log('Get group: ', result)
  return !!result.Item
}