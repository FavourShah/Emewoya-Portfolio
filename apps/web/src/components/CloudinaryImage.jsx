import React, { useState } from 'react';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dxochwmxk';

/**
 * Resolve an image source from either a full URL or a Cloudinary public_id.
 */
function buildImageSources(input, width, cloudName) {
  if (!input) return { src: '', srcSet: '' };
  const trimmed = input.trim();

  // If already a full URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    // If it's a Cloudinary URL, inject optimization parameters if not already present
    if (trimmed.includes('res.cloudinary.com') && trimmed.includes('/image/upload/')) {
      const parts = trimmed.split('/image/upload/');
      const prefix = parts[0] + '/image/upload/';
      const suffix = parts[1];

      // Avoid double-inserting if transformations already present
      if (!suffix.startsWith('f_auto') && !suffix.startsWith('q_auto')) {
        const src1x = `${prefix}f_auto,q_auto,w_${width}/${suffix}`;
        const src2x = `${prefix}f_auto,q_auto,w_${width * 2}/${suffix}`;
        return { src: src1x, srcSet: `${src1x} 1x, ${src2x} 2x`, rawFallback: trimmed };
      }
    }
    return { src: trimmed, srcSet: '', rawFallback: trimmed };
  }

  // If it's a public_id
  const activeCloud = cloudName || 'dxochwmxk';
  const baseUrl = `https://res.cloudinary.com/${activeCloud}/image/upload`;
  const src1x = `${baseUrl}/f_auto,q_auto,w_${width}/${trimmed}`;
  const src2x = `${baseUrl}/f_auto,q_auto,w_${width * 2}/${trimmed}`;
  return { src: src1x, srcSet: `${src1x} 1x, ${src2x} 2x`, rawFallback: src1x };
}

export default function CloudinaryImage({
  publicId,
  width = 600,
  alt,
  className = '',
  placeholderText = '[IMAGE]',
}) {
  const [loadError, setLoadError] = useState(false);

  if (!alt) {
    console.warn('CloudinaryImage rendered without alt text:', publicId);
  }

  const isRealImage =
    publicId &&
    !publicId.startsWith('[') &&
    !publicId.startsWith('placeholder-') &&
    publicId.trim() !== '';

  if (!isRealImage) {
    return (
      <div
        className={`aspect-[4/5] rounded-[28px] bg-surface border border-dashed border-[#8A929B] flex items-center justify-center text-center p-4 font-mono text-xs text-muted select-none ${className}`}
        aria-label={alt || placeholderText}
      >
        {placeholderText || publicId || '[PHOTO FROM LINKEDIN]'}
      </div>
    );
  }

  const { src, srcSet, rawFallback } = buildImageSources(publicId, width, CLOUD_NAME);

  return (
    <img
      src={loadError ? (rawFallback || publicId) : src}
      srcSet={loadError ? undefined : (srcSet || undefined)}
      alt={alt || 'Image'}
      loading="lazy"
      onError={() => {
        if (!loadError) {
          console.warn('[CloudinaryImage] Optimized image failed to load, falling back to raw source:', publicId);
          setLoadError(true);
        }
      }}
      className={`rounded-[28px] object-cover ${className}`}
    />
  );
}
