import { DynamoDBClient, PutItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'
import { Album } from './types'

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION })

export const addAlbum = async (input: Album): Promise<Album> => {
  console.log(`Adding new album - ${JSON.stringify(input)}`)
  try {
    const result = await dynamoClient.send(
      new PutItemCommand({
        TableName: process.env.TABLE_NAME,
        Item: marshall({
          PK: `ARTIST#${input.Artist}`,
          SK: `ALBUM#${input.Album}`,
          ...input
        })
      })
    )
    console.log(result)

  } catch (err) {
    console.error(err)
    const error = err as Error
    throw Error(error.message as string)
  }

  return input
}

export const getAlbumsByArtist = async (artist: string): Promise<Album[] | null> => {
  console.log(`Getting ${artist} albums`)
  try {
    const { Items: items } = await dynamoClient.send(
      new QueryCommand({
        TableName: process.env.TABLE_NAME,
        KeyConditionExpression: 'PK = :val',
        ExpressionAttributeValues: marshall({
          ':val': `ARTIST#${artist}`
        })
      })
    )
    console.log(items)

    if (items != undefined) {
      const albums_list: Album[] = items.map((item) => {
        delete item.PK
        delete item.SK
        return unmarshall(item) as Album
      })
      return albums_list
    }

    return null
  } catch (err) {
    console.error(err)
    const error = err as Error
    throw Error(error.message as string)
  }
}