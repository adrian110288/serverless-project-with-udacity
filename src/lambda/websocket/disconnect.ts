import { APIGatewayProxyHandler, APIGatewayProxyEvent } from "aws-lambda";
import 'source-map-support/register'
import * as AWS from 'aws-sdk'

const connectionTable = process.env.CONNECTIONS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {

    const connectionId = event.requestContext.connectionId
    
    const key = {
        id: connectionId
    }

    await new AWS.DynamoDB.DocumentClient().delete({
        TableName: connectionTable,
        Key: key
    }).promise()

    return {
        statusCode: 200,
        body: ''
    }

}
