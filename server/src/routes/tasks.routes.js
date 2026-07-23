import { Router } from 'express'
import { protect } from '../middleware/auth.js'
import { validateCreateTask, validateUpdateTask } from '../middleware/validateTasks.js'
import { listTasks, createTask, updateTask, deleteTask } from '../controllers/tasks.controller.js'

const router = Router()

// Same pattern as Notes — every task route requires an authenticated
// user, and every controller call above scopes its query to
// req.user._id, so one person can never read, edit, or delete another
// person's tasks by guessing an id.
router.use(protect)

router.get('/', listTasks)
router.post('/', validateCreateTask, createTask)
router.patch('/:id', validateUpdateTask, updateTask)
router.delete('/:id', deleteTask)

export default router
