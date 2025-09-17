import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export const client = new DynamoDBClient({ region: "eu-north-1" });

export const docClient = DynamoDBDocumentClient.from(client);
