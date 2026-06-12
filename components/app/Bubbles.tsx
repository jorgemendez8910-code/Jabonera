'use client'

import { useMemo } from 'react'

const COLORS = ['#F2C4C4', '#D8D0E8', '#C8D8C0', '#F4C4A0', '#E8C870']

export function Bubbles({ count = 18 }: { count?: number }) {
  // useMemo so bubbles are stable across renders (skill: rerender-memo)
  const bubbles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 14 + Math.random() * 42,
      delay: Math.random() * 2.2,
      dur: 4.5 + Math.random() * 3.5,
      drift: (Math.random() - 0.5) * 60,
      hue: COLORS[i % 5],
    })), [count])

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 5 }}>
      {bubbles.map(b => (
        <span
          key={b.id}
          style={{
            position: 'absolute', bottom: -60, left: `${b.left}%`,
            width: b.size, height: b.size, borderRadius: '50%',
            background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,.9), ${b.hue}66 55%, ${b.hue}33 100%)`,
            border: '1px solid rgba(255,255,255,.5)',
            boxShadow: 'inset -2px -3px 6px rgba(74,55,40,.06)',
            animation: `bubbleUp ${b.dur}s ease-in ${b.delay}s infinite`,
            ['--drift' as string]: `${b.drift}px`,
          }}
        />
      ))}
    </div>
  )
}
