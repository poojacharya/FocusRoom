import { Router } from 'express'
import healthRoutes from './health.routes.js'
import authRoutes from './auth.routes.js'

const router = Router()

router.use('/health', healthRoutes)
router.use('/auth', authRoutes)

// Future feature routers get mounted here, e.g.:
// router.use('/users', userRoutes)
// router.use('/rooms', roomRoutes)

export default router
