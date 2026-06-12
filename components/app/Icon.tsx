// Pure render — no hooks, usable in RSC or Client components

const ICONS: Record<string, string> = {
  home:      'M3 11.5 12 4l9 7.5M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9',
  book:      'M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2zM18 3v18M8 7h6M8 11h6',
  calc:      'M5 3h14a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM8 7h8M8 12h2M8 16h2M14 12h2M14 16h2',
  user:      'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 20a7 7 0 0 1 14 0',
  bell:      'M6 9a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7M10 20a2 2 0 0 0 4 0',
  clock:     'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  layers:    'M12 3 3 8l9 5 9-5-9-5zM3 13l9 5 9-5M3 17l9 5 9-5',
  arrowR:    'M5 12h14M13 6l6 6-6 6',
  arrowL:    'M19 12H5M11 18l-6-6 6-6',
  chevD:     'M6 9l6 6 6-6',
  check:     'M5 12l5 5 9-11',
  plus:      'M12 5v14M5 12h14',
  minus:     'M5 12h14',
  bulb:      'M9 18h6M10 21h4M12 3a6 6 0 0 1 4 10.5c-.7.7-1 1.3-1 2.5H9c0-1.2-.3-1.8-1-2.5A6 6 0 0 1 12 3z',
  warn:      'M12 3 2 20h20L12 3zM12 9v5M12 17.5v.5',
  heart:     'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z',
  save:      'M5 3h11l4 4v14H5zM8 3v6h7M8 14h8',
  trash:     'M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13h10l1-13',
  shield:    'M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3zM9 12l2 2 4-4',
  arrowDown: 'M12 5v14M6 13l6 6 6-6',
}

interface IconProps {
  name: string
  size?: number
  color?: string
  stroke?: number
  fill?: string
  style?: React.CSSProperties
}

export function Icon({ name, size = 24, color = 'currentColor', stroke = 2, fill = 'none', style }: IconProps) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill={fill} stroke={color}
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      style={style}
    >
      <path d={ICONS[name] ?? ''} />
    </svg>
  )
}
