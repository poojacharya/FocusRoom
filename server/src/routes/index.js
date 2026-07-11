import { Router } from 'express'
import healthRoutes from './health.routes.js'

const router = Router()

router.use('/health', healthRoutes)

// Future feature routers get mounted here, e.g.:
// router.use('/auth', authRoutes)
// router.use('/users', userRoutes)
// router.use('/rooms', roomRoutes)

export default router
