import Icon from './Icon.jsx';

/**
 * Toggle — interrupteur booléen.
 *
 * @param {boolean}  checked    - état contrôlé
 * @param {Function} onChange   - reçoit le nouvel état en argument
 * @param {string}   label      - libellé affiché à droite
 * @param {string}   icon       - icône optionnelle à gauche du label
 * @param {'sm'|'md'} size
 * @param {boolean}  disabled
 * @param {string}   className
 */
export default function Toggle({
  checked = false,
  onChange,
  label,
  icon,
  size = 'md',
  disabled = false,
  className = '',
  ...rest
}) {
  const SIZES = {
    sm: {
      track: 'w-8 h-4',
      thumb: 'w-3 h-3',
      translate: 'translate-x-4',
      iconSize: 12,
      gap: 'gap-1.5',
      text: 'text-label-sm',
    },
    md: {
      track: 'w-10 h-5',
      thumb: 'w-4 h-4',
      translate: 'translate-x-5',
      iconSize: 14,
      gap: 'gap-2',
      text: 'text-label-md',
    },
  };

  const sz = SIZES[size] ?? SIZES.md;

  const handleToggle = () => {
    if (disabled) return;
    onChange?.(!checked);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange?.(!checked);
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label || undefined}
      disabled={disabled}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      className={[
        'inline-flex items-center',
        sz.gap,
        'transition-opacity duration-200',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 rounded-md',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {/* Piste */}
      <span
        className={[
          'relative inline-flex items-center shrink-0',
          'rounded-full',
          'transition-colors duration-300 ease-out',
          checked ? 'bg-primary' : 'bg-border-strong',
          sz.track,
        ].join(' ')}
      >
        {/* Curseur */}
        <span
          className={[
            'absolute left-0.5 top-1/2 -translate-y-1/2',
            'bg-white rounded-full shadow-sm',
            'transition-transform duration-300 ease-out',
            sz.thumb,
            checked ? sz.translate : 'translate-x-0',
          ].join(' ')}
        />
      </span>

      {/* Label + icône optionnels */}
      {(label || icon) && (
        <span className={`inline-flex items-center gap-1 ${sz.text} text-ink`}>
          {icon && <Icon name={icon} size={sz.iconSize} className="text-ink-muted" />}
          {label}
        </span>
      )}
    </button>
  );
}