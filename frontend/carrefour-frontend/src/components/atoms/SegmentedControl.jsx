import Icon from './Icon.jsx';

/**
 * SegmentedControl — groupe de choix mutuellement exclusifs.
 *
 * @param {Array<{value: string, label?: string, icon?: string, tone?: string}>} options
 * @param {string}   value    - valeur sélectionnée (contrôlé)
 * @param {Function} onChange - reçoit la nouvelle valeur
 * @param {'sm'|'md'|'lg'} size
 * @param {boolean}  fullWidth
 * @param {boolean}  disabled
 * @param {string}   ariaLabel - pour l'accessibilité
 * @param {string}   className
 */
export default function SegmentedControl({
  options = [],
  value,
  onChange,
  size = 'md',
  fullWidth = false,
  disabled = false,
  ariaLabel,
  className = '',
  ...rest
}) {
  const SIZES = {
    sm: {
      container: 'p-0.5 gap-0.5 rounded-md',
      item: 'px-2 py-1 text-label-sm gap-1 rounded',
      iconSize: 12,
    },
    md: {
      container: 'p-0.5 gap-0.5 rounded-lg',
      item: 'px-space-sm py-1 text-label-md gap-1.5 rounded-md',
      iconSize: 14,
    },
    lg: {
      container: 'p-1 gap-1 rounded-lg',
      item: 'px-space-md py-1.5 text-body-md gap-2 rounded-md',
      iconSize: 16,
    },
  };

  const sz = SIZES[size] ?? SIZES.md;

  const handleSelect = (optionValue) => {
    if (disabled || optionValue === value) return;
    onChange?.(optionValue);
  };

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={[
        'inline-flex items-center bg-surface-muted',
        sz.container,
        fullWidth ? 'w-full' : '',
        disabled ? 'opacity-50 pointer-events-none' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {options.map((opt) => {
        const isActive = opt.value === value;

        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            disabled={disabled}
            onClick={() => handleSelect(opt.value)}
            className={[
              'inline-flex items-center justify-center',
              sz.item,
              'font-medium whitespace-nowrap',
              'transition-all duration-200 ease-out',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
              fullWidth ? 'flex-1' : '',
              isActive
                ? 'bg-surface-panel text-primary shadow-sm font-semibold'
                : 'text-ink-muted hover:text-ink hover:bg-surface-panel/60',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {opt.icon && (
              <Icon
                name={opt.icon}
                size={sz.iconSize}
                className={
                  isActive
                    ? 'transition-transform duration-200 ease-out scale-110'
                    : 'transition-transform duration-200 ease-out'
                }
              />
            )}
            {opt.label && <span>{opt.label}</span>}
          </button>
        );
      })}
    </div>
  );
}