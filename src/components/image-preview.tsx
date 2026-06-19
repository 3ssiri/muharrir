'use client'

import { useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

interface ImagePreviewProps {
  src: string
  alt: string
  className?: string
}

export function ImagePreview({ src, alt, className = '' }: ImagePreviewProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={`cursor-pointer hover:opacity-90 transition-opacity ${className}`}
        onClick={() => setOpen(true)}
      />

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={[{ src }]}
      />
    </>
  )
}
