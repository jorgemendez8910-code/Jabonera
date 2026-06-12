// Explicit variants instead of boolean props (skill: patterns-explicit-variants)
import { Icon } from './Icon'

type Variant = 'primary' | 'ghost' | 'soft'

interface JButtonProps {
  children: React.ReactNode
  variant?: Variant
  block?: boolean
  icon?: string
  iconRight?: string
  onClick?: () => void
  disabled?: boolean
  style?: React.CSSProperties
  type?: 'button' | 'submit'
}

export function JButton({
  children,
  variant = 'primary',
  block,
  icon,
  iconRight,
  onClick,
  disabled,
  style,
  type = 'button',
}: JButtonProps) {
  return (
    <button
      type={type}
      className={`j-btn j-btn-${variant}${block ? ' j-btn-block' : ''}`}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {icon && <Icon name={icon} size={20} stroke={2.4} />}
      <span>{children}</span>
      {iconRight && <Icon name={iconRight} size={20} stroke={2.4} />}
    </button>
  )
}
