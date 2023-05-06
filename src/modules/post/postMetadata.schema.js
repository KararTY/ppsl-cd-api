import { userCorePublic } from '../user/user.schema.js'
import { postMetadataCore } from './post.schema.js'

export const postMetadataWithUser = postMetadataCore.extend({
  user: userCorePublic.optional()
})
