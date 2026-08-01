import { Router } from 'express'
import { protect } from '../middleware/auth.js'
import {
  validateCreateFocusSession,
  validateUpdateFocusSession,
} from '../middleware/validateFocusSessions.js'
import {
  listFocusSessions,
  createFocusSession,
  getFocusSession,
  updateFocusSession,
  deleteFocusSession,
} from '../controllers/focusSessions.controller.js'

const router = Router()

// Same pattern as Notes/Tasks — every route requires an authenticated
// user, and every controller call above scopes its query to
// req.user._id, so one person can never read, edit, or delete another
// person's focus sessions by guessing an id.
router.use(protect)

router.get('/', listFocusSessions)
router.post('/', validateCreateFocusSession, createFocusSession)
router.get('/:id', getFocusSession)
router.patch('/:id', validateUpdateFocusSession, updateFocusSession)
router.delete('/:id', deleteFocusSession)

export default router
