import { Router, Request, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/auth.middleware'
import { upload } from '../middleware/upload.middleware'

const router = Router()

/**
 * POST /api/v1/upload/vehicle-images
 * Upload multiple vehicle images (max 10)
 * Requires authentication
 */
router.post(
  '/vehicle-images',
  authenticate,
  upload.array('images', 10), // Accept up to 10 images
  (req: AuthRequest, res: Response) => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'No images uploaded',
        })
      }

      // Return the public URLs for the uploaded images
      const imageUrls = req.files.map((file) => `/uploads/vehicles/${file.filename}`)

      res.status(200).json({
        status: 'success',
        data: {
          images: imageUrls,
          count: imageUrls.length,
        },
      })
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to upload images',
      })
    }
  }
)

/**
 * DELETE /api/v1/upload/vehicle-images
 * Delete vehicle images
 * Requires authentication
 */
router.delete('/vehicle-images', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const { images } = req.body

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No images specified for deletion',
      })
    }

    const fs = require('fs')
    const path = require('path')
    const uploadDir = path.join(__dirname, '../../../web/public/uploads/vehicles')

    let deletedCount = 0
    const errors: string[] = []

    for (const imageUrl of images) {
      try {
        // Extract filename from URL (e.g., /uploads/vehicles/image-123.jpg -> image-123.jpg)
        const filename = imageUrl.split('/').pop()
        const filePath = path.join(uploadDir, filename)

        // Check if file exists and delete it
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
          deletedCount++
        }
      } catch (err: any) {
        errors.push(`Failed to delete ${imageUrl}: ${err.message}`)
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        deleted: deletedCount,
        errors: errors.length > 0 ? errors : undefined,
      },
    })
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to delete images',
    })
  }
})

export default router
