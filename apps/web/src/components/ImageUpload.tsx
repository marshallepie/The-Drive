'use client'

import { useState, useRef } from 'react'
import apiClient from '@/lib/api/client'

interface ImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
}

export default function ImageUpload({ images, onImagesChange, maxImages = 10 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Check if adding these files would exceed max images
    if (images.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed`)
      return
    }

    try {
      setUploading(true)
      setError('')

      const formData = new FormData()
      Array.from(files).forEach((file) => {
        formData.append('images', file)
      })

      const response = await apiClient.post('/api/v1/upload/vehicle-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data.status === 'success') {
        const newImages = response.data.data.images
        onImagesChange([...images, ...newImages])
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload images')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = async (imageUrl: string) => {
    try {
      // Remove from UI immediately
      const updatedImages = images.filter((img) => img !== imageUrl)
      onImagesChange(updatedImages)

      // Delete from server in background
      await apiClient.delete('/api/v1/upload/vehicle-images', {
        data: { images: [imageUrl] },
      })
    } catch (err: any) {
      console.error('Failed to delete image:', err)
      // Image is already removed from UI, no need to show error
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload button */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Vehicle Images ({images.length}/{maxImages})
        </label>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={handleFileSelect}
          disabled={uploading || images.length >= maxImages}
          className="hidden"
          id="image-upload"
        />

        <label
          htmlFor="image-upload"
          className={`
            inline-flex items-center justify-center px-4 py-2 border border-gray-700 rounded
            cursor-pointer transition-colors
            ${
              uploading || images.length >= maxImages
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }
          `}
        >
          {uploading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Uploading...
            </>
          ) : images.length >= maxImages ? (
            'Maximum images reached'
          ) : (
            'Choose Images'
          )}
        </label>

        <p className="mt-1 text-xs text-gray-400">
          JPG, PNG, or WebP. Max 5MB per image. Up to {maxImages} images.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded text-sm">{error}</div>
      )}

      {/* Image previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((imageUrl, index) => (
            <div key={imageUrl} className="relative group">
              <div className="aspect-video bg-gray-800 rounded overflow-hidden">
                <img src={imageUrl} alt={`Vehicle ${index + 1}`} className="w-full h-full object-cover" />
              </div>

              {/* Remove button */}
              <button
                onClick={() => handleRemoveImage(imageUrl)}
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                type="button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Primary badge for first image */}
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">Primary</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
