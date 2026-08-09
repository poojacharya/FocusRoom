import { Router } from 'express'
import { protect } from '../middleware/auth.js'
import { validateSendFriendRequest } from '../middleware/validateFriends.js'
import {
  searchUsers,
  listFriends,
  listIncomingRequests,
  listSentRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
} from '../controllers/friends.controller.js'

const router = Router()

// Same pattern as Notes/Tasks/FocusSessions — every route requires an
// authenticated user, and every controller above scopes its query to
// req.user._id (via userA/userB/requestedBy), so one person can never
// view, accept, reject, or remove another person's friendships by
// guessing an id.
router.use(protect)

// '/requests/sent' and '/requests' are registered ahead of the generic
// DELETE '/:id' at the bottom, per the route-ordering rule established
// in auth.routes.js/notes.routes.js: specific paths before generic
// patterns, so a param route can never accidentally swallow a literal
// path segment.
router.get('/', listFriends)
router.get('/requests/sent', listSentRequests)
router.get('/requests', listIncomingRequests)
router.get('/search', searchUsers)
router.post('/requests', validateSendFriendRequest, sendFriendRequest)
router.patch('/requests/:id/accept', acceptFriendRequest)
router.patch('/requests/:id/reject', rejectFriendRequest)
router.delete('/:id', removeFriend)

export default router
