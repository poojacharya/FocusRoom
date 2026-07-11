import { Router } from 'express'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiResponse } from '../utils/ApiResponse.js'

const router = Router()

router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.status(200).json(
      new ApiResponse(200, {
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      }),
    )
  }),
)

export default router
