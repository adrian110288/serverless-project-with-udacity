import { DynamoDBStreamHandler, DynamoDBStreamEvent } from "aws-lambda";
import 'source-map-support/register'
import * as elasticsearch from 'elasticsearch'
import * as httpAwsEs from 'http-aws-es'

const esHost = process.env.ES_ENDPOINT

const es = new elasticsearch.Client({
    host: esHost,
    connectionClass: httpAwsEs
})

export const handler: DynamoDBStreamHandler = async (event: DynamoDBStreamEvent) => {

    for (const record of event.Records) {
        
        if (record.eventName !== "INSERT") {
            continue
        }

        const newItem = record.dynamodb.NewImage

        const imageId = newItem.imageId.S

        const body = {
            imageId,
            groupId: newItem.groupId.S,
            imageUrl: newItem.imageUrl.S,
            title: newItem.title.S,
            timestamp: newItem.timestamp.S
        }

        await es.index({
            index: 'images-index',
            type: 'images',
            id: imageId,
            body
        })

    }
}