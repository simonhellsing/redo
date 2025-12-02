'use client'

import { useState } from 'react'

interface ImageWithFallbackProps {
  src: string
  alt: string
  className?: string
  fallback?: React.ReactNode
}

export function ImageWithFallback({ src, alt, className, fallback }: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false)
  const [imageSrc, setImageSrc] = useState(() => {
    // Fix double customer-logos path if present
    if (src && src.includes('/customer-logos/customer-logos/')) {
      return src.replace(/\/customer-logos\/customer-logos\//, '/customer-logos/')
    }
    return src
  })

  if (hasError) {
    return fallback ? <>{fallback}</> : (
      <div className={`${className} bg-gray-100 flex items-center justify-center text-gray-400 text-xs`}>
        No image
      </div>
    )
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      crossOrigin="anonymous"
      onError={(e) => {
        console.error('Failed to load image:', {
          url: imageSrc,
          error: 'Image load failed - check if bucket is public and URL is correct',
        })
        setHasError(true)
      }}
      onLoad={() => {
        console.log('Image loaded successfully:', imageSrc)
      }}
    />
  )
}

