import clsx from 'clsx'

const variants = {
  gold:    { border: '1px solid rgba(201,168,76,0.40)', color: '#f0d8a0', background: 'rgba(201,168,76,0.10)' },
  teal:    { border: '1px solid rgba(74,158,122,0.35)', color: '#4A9E7A', background: 'rgba(74,158,122,0.10)' },
  saffron: { border: '1px solid rgba(232,134,26,0.35)', color: '#E8861A', background: 'rgba(232,134,26,0.10)' },
  crimson: { border: '1px solid rgba(176,48,32,0.35)',  color: '#B03020', background: 'rgba(176,48,32,0.10)' },
  default: { border: '1px solid rgba(61,46,30,0.8)',    color: '#C4A97A', background: 'rgba(31,23,16,0.7)' },
}

export default function Badge({ children, variant = 'default', className }) {
  const v = variants[variant] ?? variants.default
  return (
    <span
      style={v}
      className={clsx(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md',
        'text-[10px] font-cinzel font-semibold tracking-[0.14em] uppercase',
        className
      )}
    >
      {children}
    </span>
  )
}
