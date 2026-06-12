import Image from 'next/image'

interface RecipeImageProps {
  /** URL from Supabase Storage. When undefined/null the gradient shows instead. */
  src?: string | null
  /** CSS gradient — always set as background so it shows during load or as fallback */
  gradient: string
  alt: string
  className?: string
  style?: React.CSSProperties
  /** Overlay content (badges, emoji, patterns) rendered on top of image or gradient */
  children?: React.ReactNode
  /**
   * Hint for Next.js Image optimizer — tell it how wide the image appears on screen
   * so it generates and serves the right file size. Pick the closest preset:
   *   "hero"      → full viewport width (RecipeDetailScreen header)
   *   "card"      → 2-4 column grid card (RecetasListScreen thumbnails)
   *   "thumbnail" → small avatar-sized square (dashboard / historial minicards)
   */
  variant?: 'hero' | 'card' | 'thumbnail'
}

const SIZES: Record<NonNullable<RecipeImageProps['variant']>, string> = {
  // Full-width across the viewport: mobile is ~390px, desktop up to 1440px
  hero: '100vw',
  // 2 cols on mobile (~50vw), 3 on tablet (~33vw), auto-fill ≥210px on desktop (~25vw)
  card: '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw',
  // Fixed tiny square — 50px rendered, 3× retina = 150px, round up
  thumbnail: '60px',
}

/**
 * Shows a recipe photo when available, falling back to the CSS gradient.
 * The gradient is always the background so there is no flash of empty space
 * while the image loads or if it fails.
 *
 * Upload size: 1200 × 800 px (3:2 landscape, WebP or JPEG ≤85% quality).
 * object-fit: cover handles the center-crop for each display context.
 */
export function RecipeImage({
  src,
  gradient,
  alt,
  className,
  style,
  children,
  variant = 'card',
}: RecipeImageProps) {
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: gradient,
        ...style,
      }}
    >
      {src && (
        <Image
          src={src}
          alt={alt}
          fill
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          sizes={SIZES[variant]}
          priority={variant === 'hero'}
        />
      )}
      {children}
    </div>
  )
}
