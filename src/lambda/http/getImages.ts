import { APIGatewayProxyHandler } from 'aws-lambda'
import 'source-map-support/register'
import { DynamoDB } from 'aws-sdk'

const docClient = new DynamoDB.DocumentClient()

const groupsTable = process.env.GROUPS_TABLE
const imagesTable = process.env.IMAGES_TABLE

export const handler: APIGatewayProxyHandler = async (event, _context) => {

    const groupId = event.pathParameters.groupId

    // const result = await docClient.scan({
    //     TableName: groupsTable
    // }).promise()

    // const items = result.Items

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
        };
    }

    const images = await getImagePerGroup(groupId)

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ items: images })
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
