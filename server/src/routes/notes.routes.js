import { Router } from 'express'
import { protect } from '../middleware/auth.js'
import { validateCreateNote, validateUpdateNote } from '../middleware/validateNotes.js'
import { listNotes, createNote, getNote, updateNote, deleteNote } from '../controllers/notes.controller.js'

const router = Router()

// Every notes route requires an authenticated user, and every controller
// above scopes its query to req.user._id — one person can never read,
// edit, or delete another person's notes by guessing an id.
router.use(protect)

router.get('/', listNotes)
router.post('/', validateCreateNote, createNote)
router.get('/:id', getNote)
router.patch('/:id', validateUpdateNote, updateNote)
router.delete('/:id', deleteNote)

export default router
