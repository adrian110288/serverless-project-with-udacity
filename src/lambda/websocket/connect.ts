import { APIGatewayProxyHandler, APIGatewayProxyEvent } from "aws-lambda";
import 'source-map-support/register'
import * as AWS from 'aws-sdk'

const connectionTable = process.env.CONNECTIONS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {

    const connectionId = event.requestContext.connectionId
    const timestamp = new Date().toISOString()

    const item = {
        id: connectionId,
        timestamp
    }

    await new AWS.DynamoDB.DocumentClient().put({
        TableName: connectionTable,
        Item: item
    }).promise()

    return {
        statusCode: 200,
        body: ''
    }

}
