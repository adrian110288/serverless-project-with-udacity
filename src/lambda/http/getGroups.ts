import { APIGatewayProxyHandler } from 'aws-lambda'
import 'source-map-support/register'
import { DynamoDB } from 'aws-sdk'

const docClient = new DynamoDB.DocumentClient()
const groupsTable = process.env.GROUPS_TABLE

export const handler: APIGatewayProxyHandler = async (event, _context) => {

    const result = await docClient.scan({
        TableName: groupsTable
    }).promise()

    const items = result.Items

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ items })
    };
}
