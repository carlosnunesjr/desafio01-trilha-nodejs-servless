import { APIGatewayProxyHandler } from "aws-lambda"
import { document } from "../utils/dynamodbClient";

import { v4 as uuidv4 } from "uuid";

import dayjs from "dayjs";

interface ITodo {
    title: string;
    deadline: string
}

export const handler: APIGatewayProxyHandler = async (event) => {

    const { userid } = event.pathParameters;
    const { title, deadline } = JSON.parse(event.body) as ITodo;

    const id = uuidv4();

    await document.put({
        TableName: "users_todos",
        Item: {
            id,
            user_id: userid,
            title,
            done: false,
            deadline: dayjs(new Date(deadline)).format("DD/MM/YYYY")
        }
    }).promise();

    const response = await document.query({
        TableName: "users_todos",
        KeyConditionExpression: "user_id = :userid and id = :id",
        ExpressionAttributeValues: {
            ":userid": userid,
            ":id": id
        }
    }).promise();

    return {
        statusCode: 201,
        body: JSON.stringify(
            response.Items[0]
        )
    }
}