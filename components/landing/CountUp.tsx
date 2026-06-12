'use client'

import { useEffect, useRef, useState } from 'react'

export function CountUp({ to }: { to: number }) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Reset so the counter always starts from 0 on every mount / back-navigation
    setValue(0)
    let raf = 0

    const run = () => {
      let start: number | null = null
      const tick = (ts: number) => {
        if (!start) start = ts
        const p = Math.min(1, (ts - start) / 1100)
        setValue(Math.round((1 - Math.pow(1 - p, 3)) * to))
        if (p < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }

    // IntersectionObserver already handles "animate once" via disconnect()
    // — no external `observed` ref needed (that was causing the back-nav bug)
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        run()
      },
      { threshold: 0.6 },
    )

    io.observe(el)

    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [to])

  return <span ref={ref}>{value}</span>
}
