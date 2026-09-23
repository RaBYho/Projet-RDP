import Icon from './Icon.jsx';

/**
 * Badge — étiquette courte, mono uppercase.
 *
 * @param {React.ReactNode} children - contenu (texte)
 * @param {'neutral'|'primary'|'success'|'warning'|'danger'|'pedestrian'|'bus'|'urgence'} tone
 * @param {'soft'|'solid'|'outline'} variant
 * @param {'pill'|'tag'} shape - pill = arrondi complet, tag = coins légers
 * @param {string} icon - nom Material Symbols optionnel
 * @param {string} className - classes additionnelles
 */
export default function Badge({
  children,
  tone = 'neutral',
  variant = 'soft',
  shape = 'pill',
  icon,
  className = '',
  ...rest
}) {
  // --- Tones sémantiques ---
  // On mappe vers les tokens Tailwind déjà définis dans la config.
  const TONES = {
    neutral: {
      soft:    'bg-surface-muted text-ink border-border',
      solid:   'bg-ink text-white border-ink',
      outline: 'bg-transparent text-ink-muted border-border-strong',
    },
    primary: {
      soft:    'bg-primary-soft text-primary border-primary/20',
      solid:   'bg-primary text-white border-primary',
      outline: 'bg-transparent text-primary border-primary/40',
    },
    success: {
      soft:    'bg-secondary-soft text-secondary border-secondary/20',
      solid:   'bg-secondary text-white border-secondary',
      outline: 'bg-transparent text-secondary border-secondary/40',
    },
    warning: {
      soft:    'bg-tertiary-soft text-tertiary border-tertiary/20',
      solid:   'bg-tertiary text-white border-tertiary',
      outline: 'bg-transparent text-tertiary border-tertiary/40',
    },
    danger: {
      soft:    'bg-danger-soft text-danger border-danger/20',
      solid:   'bg-danger text-white border-danger',
      outline: 'bg-transparent text-danger border-danger/40',
    },
    pedestrian: {
      soft:    'bg-pedestrian-soft text-pedestrian border-pedestrian/20',
      solid:   'bg-pedestrian text-white border-pedestrian',
      outline: 'bg-transparent text-pedestrian border-pedestrian/40',
    },
    // Aliases sémantiques (mêmes couleurs que ci-dessus)
    bus:     { soft: 'bg-tertiary-soft text-tertiary border-tertiary/20', solid: 'bg-tertiary text-white border-tertiary', outline: 'bg-transparent text-tertiary border-tertiary/40' },
    urgence: { soft: 'bg-danger-soft text-danger border-danger/20',       solid: 'bg-danger text-white border-danger',     outline: 'bg-transparent text-danger border-danger/40' },
  };

  const palette = TONES[tone] ?? TONES.neutral;
  const colorClass = palette[variant] ?? palette.soft;

  const shapeClass = shape === 'tag'
    ? 'rounded-md'
    : 'rounded-full';

  return (
    <span
      className={[
        'inline-flex items-center gap-1',
        'px-2 py-0.5 border',
        'font-mono text-badge-mono uppercase tracking-wider',
        'whitespace-nowrap',
        'transition-colors duration-200 ease-out',
        colorClass,
        shapeClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {icon && <Icon name={icon} size={10} />}
      {children}
    </span>
  );
}