'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/app/Logo'

export function Nav() {
  const [open, setOpen] = useState(false)

  const close = () => setOpen(false)

  return (
    <nav className="lp-nav">
      <div className="wrap">
        <Logo size={28} />

        {/* Desktop: full nav links + login */}
        <div className="nav-links">
          <a className="nav-link" href="#como">Cómo funciona</a>
          <a className="nav-link" href="#features">Características</a>
          <a className="nav-link" href="#precio">Precio</a>
          <Link className="btn btn-primary" href="/login">Iniciar sesión</Link>
        </div>

        {/* Mobile: login button (always visible) + hamburger for nav links */}
        <div className="nav-mobile-actions">
          <Link className="btn btn-primary nav-login-mobile" href="/login">Iniciar sesión</Link>
          <button
            className="nav-burger"
            aria-label="Abrir menú"
            aria-expanded={open}
            aria-controls="nav-drawer"
            onClick={() => setOpen(v => !v)}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Mobile drawer — nav links only (login is always in the bar) */}
      <div className={`nav-drawer${open ? ' open' : ''}`} id="nav-drawer">
        <a href="#como"     onClick={close}>Cómo funciona</a>
        <a href="#features" onClick={close}>Características</a>
        <a href="#precio"   onClick={close}>Precio</a>
      </div>
    </nav>
  )
}
