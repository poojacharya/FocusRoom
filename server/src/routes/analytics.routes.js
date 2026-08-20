import { Router } from 'express'
import { protect } from '../middleware/auth.js'
import { getProductivityAnalytics } from '../controllers/analytics.controller.js'

const router = Router()

// Same pattern as Notes/Tasks/FocusSessions — requires an authenticated
// user, and the controller scopes every query to req.user._id, so one
// person can never read another person's productivity analytics.
router.use(protect)

router.get('/', getProductivityAnalytics)

export default router
