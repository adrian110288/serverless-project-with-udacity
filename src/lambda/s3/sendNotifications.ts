import { S3Handler, S3Event } from "aws-lambda";
import 'source-map-support/register'
import * as AWS from 'aws-sdk'

const connectionTable = process.env.CONNECTIONS_TABLE
const stage = process.env.STAGE
const apiId = process.env.API_ID

const connectionParams = {
    apiVersion: "2018-11-29",
    endpoint: `${apiId}.execute-api.us-east-1.amazonaws.com/${stage}`
}

const apiGateway = new AWS.ApiGatewayManagementApi(connectionParams)

export const handler: S3Handler = async(event: S3Event) => {

    for (const record of event.Records) {
        
        const key = record.s3.object.key

        const connections = await new AWS.DynamoDB.DocumentClient().scan({
            TableName: connectionTable
        }).promise()

        const payload = {
            imageId: key
        }

        for (const connection of connections.Items) {
            await sendMessage(connection.id, payload)  
        }
    }

}

async function sendMessage(connectionId, payload) {

    try {

        await apiGateway.postToConnection({
            ConnectionId: connectionId,
            Data: JSON.stringify(payload)
        }).promise()

        
    } catch (e) {
        console.log("Failed to send messag", JSON.stringify(e))

        if (e.statusCOde === 410) {
            console.log('Connection stale')

            await new AWS.DynamoDB.DocumentClient().delete({
                TableName: connectionTable,
                Key: {
                    id: connectionId
                }
            }).promise()
        }

    }
}