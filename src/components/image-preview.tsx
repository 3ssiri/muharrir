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
      {/* Sources are arbitrary-size data: URLs and remote previews, so the
          plain <img> is intentional here (next/image adds little for a static
          export with images.unoptimized and complicates data URLs). */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
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
