import { ApolloServer } from 'apollo-server-lambda'
import { resolvers } from './resolvers'
import { typeDefs } from './schema'


const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: !!process.env.IS_LOCAL
})

export const handler = server.createHandler()