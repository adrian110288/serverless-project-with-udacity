import { APIGatewayProxyHandler } from 'aws-lambda'
import 'source-map-support/register'
import { DynamoDB } from 'aws-sdk'
import * as uuid from 'uuid'

const docClient = new DynamoDB.DocumentClient()
const groupsTable = process.env.GROUPS_TABLE

export const handler: APIGatewayProxyHandler = async (event, _context) => {

    const itemId = uuid.v4()

    const parsedBody = JSON.parse(event.body)

    const newItem = {
        id: itemId,
        ...parsedBody
    }

    await docClient.put({
        TableName: groupsTable,
        Item: newItem
    }).promise()

    return {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ newItem })
    };
}
