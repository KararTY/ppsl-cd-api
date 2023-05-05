import { userCore } from '../user/user.schema.js'
import { postMetadataCore } from './post.schema.js'

export const postMetadataWithUser = postMetadataCore.extend({
  user: userCore.optional()
})
