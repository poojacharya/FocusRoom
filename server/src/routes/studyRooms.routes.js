import { Router } from 'express'
import { protect } from '../middleware/auth.js'
import { validateCreateRoom, validateJoinRoom } from '../middleware/validateStudyRooms.js'
import {
  listMyRooms,
  createRoom,
  joinRoom,
  getRoom,
  listRoomMessages,
  leaveRoom,
  deleteRoom,
} from '../controllers/studyRooms.controller.js'

const router = Router()

// Same pattern as Notes/Tasks/FocusSessions/Friends — every route
// requires an authenticated user, and every controller above scopes its
// query to req.user._id (via owner/members), so one person can never
// read, join, leave, or delete another person's rooms — or read another
// room's chat history — by guessing an id.
router.use(protect)

// '/join' registered ahead of the generic '/:id' routes, per the
// route-ordering rule already established in auth.routes.js/
// notes.routes.js/friends.routes.js: specific paths before generic
// param patterns.
router.get('/', listMyRooms)
router.post('/', validateCreateRoom, createRoom)
router.post('/join', validateJoinRoom, joinRoom)
router.get('/:id', getRoom)
router.get('/:id/messages', listRoomMessages)
router.post('/:id/leave', leaveRoom)
router.delete('/:id', deleteRoom)

export default router
