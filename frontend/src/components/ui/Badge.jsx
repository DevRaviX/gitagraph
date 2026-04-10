import clsx from 'clsx'

const variants = {
  gold:    'border-gold-dim    text-gold    bg-gold-faint',
  teal:    'border-teal/30     text-teal    bg-teal/10',
  saffron: 'border-saffron/30  text-saffron bg-saffron/10',
  crimson: 'border-crimson/30  text-crimson bg-crimson/10',
  default: 'border-border      text-ink-2   bg-bg-3',
}

export default function Badge({ children, variant = 'default', className }) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-md',
      'text-[11px] font-semibold border tracking-wide',
      variants[variant], className
    )}>
      {children}
    </span>
  )
}
