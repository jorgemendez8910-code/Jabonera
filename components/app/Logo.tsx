// Pure render — usable in RSC and Client components

interface LogoProps {
  size?: number
  color?: string
  mark?: string
  wordmark?: boolean
  style?: React.CSSProperties
}

export function Logo({
  size = 26,
  color = 'var(--color-bark)',
  mark = 'var(--color-clay)',
  wordmark = true,
  style,
}: LogoProps) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.34, ...style }}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
        <circle cx="16" cy="16" r="15" fill={mark} />
        <circle cx="12" cy="13" r="4.2" fill="#fff" fillOpacity="0.9" />
        <circle cx="20.5" cy="17.5" r="3" fill="#fff" fillOpacity="0.55" />
        <circle cx="14" cy="21" r="2.2" fill="#fff" fillOpacity="0.4" />
        <circle cx="11" cy="11.4" r="1.1" fill={mark} />
      </svg>
      {wordmark && (
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: size * 0.92, color, letterSpacing: '-0.01em', lineHeight: 1,
        }}>
          Jabonera
        </span>
      )}
    </span>
  )
}
