import { Router } from 'express'
import { protect } from '../middleware/auth.js'
import { validateCreateStudyPlan, validateUpdateStudyPlan } from '../middleware/validateStudyPlan.js'
import {
  getMyStudyPlan,
  createStudyPlan,
  updateStudyPlan,
  deleteStudyPlan,
} from '../controllers/studyPlan.controller.js'

const router = Router()

// Every route requires an authenticated user, and every controller call
// scopes its query to req.user._id — same pattern as Notes/Tasks/
// FocusSessions/Friends/StudyRooms. There is no :id in these routes
// since each user has exactly one study plan.
router.use(protect)

router.get('/', getMyStudyPlan)
router.post('/', validateCreateStudyPlan, createStudyPlan)
router.patch('/', validateUpdateStudyPlan, updateStudyPlan)
router.delete('/', deleteStudyPlan)

export default router
