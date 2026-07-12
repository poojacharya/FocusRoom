import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { verifyAccessToken } from '../utils/jwt.js'
import { User } from '../models/User.model.js'

/**
 * Not mounted on any route yet — there's nothing to protect until a later
 * feature (User Profiles, etc.) adds routes that need it. Ready to use via:
 *
 *   import { protect } from '../middleware/auth.js'
 *   router.get('/me', protect, getMe)
 */
export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || ''
  const [scheme, token] = header.split(' ')

  if (scheme !== 'Bearer' || !token) {
    throw new ApiError(401, 'Not authenticated')
  }

  let payload
  try {
    payload = verifyAccessToken(token)
  } catch {
    throw new ApiError(401, 'Invalid or expired access token')
  }

  const user = await User.findById(payload.sub)
  if (!user) {
    throw new ApiError(401, 'User no longer exists')
  }

  req.user = user
  next()
})
