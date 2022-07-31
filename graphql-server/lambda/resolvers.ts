import { addAlbum, getAlbumsByArtist } from './albums'
import { Album } from './types'

interface NewAlbumInput {
  input: Album
}

interface ArtistAlbumsProps {
  artist: string
}

export const resolvers = {
  Query: {
    artistAlbums: async (_: any, { artist }: ArtistAlbumsProps, __: any) => getAlbumsByArtist(artist)
  },
  Mutation: {
    newAlbum: async (_: any, { input }: NewAlbumInput, __: any) => addAlbum(input)
  }
}