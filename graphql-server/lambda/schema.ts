import { gql } from 'apollo-server-lambda'

export const typeDefs = gql`
  type Album {
    Album: String
    Artist: String
    NumSongs: String
    ReleaseYear: String
    Sales: String
    RecordLabel: String
  }

  input AlbumInput {
    Album: String!
    Artist: String!
    NumSongs: String!
    ReleaseYear: String!
    Sales: String!
    RecordLabel: String!
  }

  type Query {
    artistAlbums(artist: String!): [Album]
  }

  type Mutation {
    newAlbum(input: AlbumInput!): Album
  }
`