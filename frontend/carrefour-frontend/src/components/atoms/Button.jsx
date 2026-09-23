import Icon from './Icon.jsx';

/**
 * Button — bouton polyvalent.
 *
 * @param {React.ReactNode} children   - contenu (texte)
 * @param {'primary'|'secondary'|'danger'|'outline'|'ghost'|'success'} variant
 * @param {'sm'|'md'|'lg'} size
 * @param {string} iconLeft  - nom Material Symbols à gauche
 * @param {string} iconRight - nom Material Symbols à droite
 * @param {boolean} loading  - affiche un spinner, désactive les clics
 * @param {boolean} disabled
 * @param {boolean} iconOnly - bouton carré (icône seule)
 * @param {boolean} fullWidth
 * @param {Function} onClick
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  loading = false,
  disabled = false,
  iconOnly = false,
  fullWidth = false,
  onClick,
  className = '',
  type = 'button',
  ...rest
}) {
  const isDisabled = disabled || loading;

  // --- Variants ---
  const VARIANTS = {
    primary: [
      'bg-primary text-white',
      'hover:bg-primary-hover',
      'border border-primary',
      'shadow-sm hover:shadow-md',
    ].join(' '),
    secondary: [
      'bg-surface-panel text-ink',
      'hover:bg-surface',
      'border border-border',
      'shadow-sm hover:shadow-md',
    ].join(' '),
    danger: [
      'bg-danger text-white',
      'hover:bg-danger-hover',
      'border border-danger',
      'shadow-sm hover:shadow-md',
    ].join(' '),
    success: [
      'bg-secondary text-white',
      'hover:bg-secondary-hover',
      'border border-secondary',
      'shadow-sm hover:shadow-md',
    ].join(' '),
    outline: [
      'bg-transparent text-ink',
      'hover:bg-surface-muted',
      'border border-border-strong',
    ].join(' '),
    ghost: [
      'bg-transparent text-ink-muted',
      'hover:bg-surface-muted hover:text-ink',
      'border border-transparent',
    ].join(' '),
  };

  // --- Sizes ---
  const SIZES = {
    sm: {
      base: 'h-7 px-2.5 text-label-sm gap-1 rounded-md',
      iconSize: 14,
      iconOnly: 'w-7 h-7 p-0',
    },
    md: {
      base: 'h-9 px-space-md text-label-md gap-1.5 rounded-md',
      iconSize: 16,
      iconOnly: 'w-9 h-9 p-0',
    },
    lg: {
      base: 'h-11 px-space-lg text-body-md gap-2 rounded-lg',
      iconSize: 20,
      iconOnly: 'w-11 h-11 p-0',
    },
  };

  const sz = SIZES[size] ?? SIZES.md;
  const variantClass = VARIANTS[variant] ?? VARIANTS.primary;

  const disabledClass = isDisabled
    ? 'opacity-50 cursor-not-allowed pointer-events-none'
    : 'cursor-pointer active:scale-[0.97]';

  const layoutClass = iconOnly
    ? `${sz.iconOnly} justify-center`
    : fullWidth
      ? 'w-full justify-center'
      : 'justify-center';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={[
        // Layout
        'inline-flex items-center',
        sz.base,
        layoutClass,
        // Typo
        'font-medium whitespace-nowrap',
        // Transitions
        'transition-all duration-200 ease-out',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        // Couleurs & état
        variantClass,
        disabledClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {loading ? (
        <Icon name="progress_activity" size={sz.iconSize} animate="spin" />
      ) : (
        iconLeft && <Icon name={iconLeft} size={sz.iconSize} />
      )}

      {!iconOnly && <span>{children}</span>}

      {!loading && iconRight && (
        <Icon
          name={iconRight}
          size={sz.iconSize}
          className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
        />
      )}
    </button>
  );
}