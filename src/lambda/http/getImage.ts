import { APIGatewayProxyHandler } from 'aws-lambda'
import 'source-map-support/register'
import { DynamoDB } from 'aws-sdk'

const docClient = new DynamoDB.DocumentClient()

const imagesTable = process.env.IMAGES_TABLE
const imageIdIndex = process.env.IMAGE_ID_INDEX

export const handler: APIGatewayProxyHandler = async (event, _context) => {

    const imageId = event.pathParameters.imageId

    const result = await docClient.query({
        TableName: imagesTable,
        IndexName: imageIdIndex,
        KeyConditionExpression: 'imageId = :imageId',
        ExpressionAttributeValues: {
            ':imageId': imageId
        },
        ScanIndexForward: true
    }).promise()

    if (result.Count !== 0) {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(result.Items[0])
        };
    }

    return {
        statusCode: 400,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: ''
    };
}

async function groupExists(groupId: string) {

    const result = await docClient.get({
        TableName: groupsTable,
        Key: {
            id: groupId
        }
    }).promise()

    return !!result.Item
}

async function getImagePerGroup(groupId: string) {

    const result = await docClient.query({
        TableName: imagesTable,
        KeyConditionExpression: 'groupId = :groupId',
        ExpressionAttributeValues: {
            ':groupId': groupId
        },
        ScanIndexForward: true
    }).promise()

    return result.Items
}
