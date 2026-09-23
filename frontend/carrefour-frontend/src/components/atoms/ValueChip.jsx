import Icon from './Icon.jsx';

/**
 * ValueChip — chip compacte pour afficher une valeur avec sa clé / unité.
 *
 * @param {string}   label     - clé affichée en gris (ex: "t =", "M₀ :")
 * @param {string|number} value - valeur affichée en gras
 * @param {string}   unit      - unité optionnelle après la valeur (ex: "s", "v/h")
 * @param {string}   icon      - icône optionnelle avant le label
 * @param {'primary'|'success'|'warning'|'danger'|'neutral'|'pedestrian'} tone
 * @param {'sm'|'md'} size
 * @param {string}   className
 */
export default function ValueChip({
  label,
  value,
  unit,
  icon,
  tone = 'neutral',
  size = 'md',
  className = '',
  ...rest
}) {
  // --- Tones : applique une couleur de fond + couleur de la valeur ---
  const TONES = {
    neutral:    { bg: 'bg-surface-muted',       text: 'text-ink',       border: 'border-border' },
    primary:    { bg: 'bg-primary-soft',        text: 'text-primary',   border: 'border-primary/20' },
    success:    { bg: 'bg-secondary-soft',      text: 'text-secondary', border: 'border-secondary/20' },
    warning:    { bg: 'bg-tertiary-soft',       text: 'text-tertiary',  border: 'border-tertiary/20' },
    danger:     { bg: 'bg-danger-soft',         text: 'text-danger',    border: 'border-danger/20' },
    pedestrian: { bg: 'bg-pedestrian-soft',     text: 'text-pedestrian',border: 'border-pedestrian/20' },
  };
  const palette = TONES[tone] ?? TONES.neutral;

  // --- Sizes ---
  const SIZES = {
    sm: { base: 'h-6 px-1.5 gap-1 rounded text-code-sm', iconSize: 11 },
    md: { base: 'h-7 px-2 gap-1.5 rounded-md text-code-md', iconSize: 13 },
  };
  const sz = SIZES[size] ?? SIZES.md;

  return (
    <span
      className={[
        'inline-flex items-center',
        sz.base,
        'border',
        'font-mono whitespace-nowrap tabular-nums',
        'transition-colors duration-200 ease-out',
        palette.bg,
        palette.border,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {icon && (
        <Icon
          name={icon}
          size={sz.iconSize}
          className={['shrink-0', palette.text].join(' ')}
        />
      )}

      {label && (
        <span className="text-ink-muted font-medium">{label}</span>
      )}

      {value !== undefined && value !== null && (
        <span className={['font-bold', palette.text].join(' ')}>
          {value}
          {unit && <span className="font-medium opacity-70 ml-0.5">{unit}</span>}
        </span>
      )}
    </span>
  );
}