/**
 * Pill — indicateur d'état avec point coloré.
 *
 * @param {React.ReactNode} children
 * @param {'primary'|'success'|'warning'|'danger'|'pedestrian'|'neutral'} tone
 * @param {'soft'|'outline'} variant
 * @param {boolean} pulse    - fait pulser le point (état actif/en cours)
 * @param {boolean} live     - synonyme sémantique de pulse (pour la lisibilité)
 * @param {string}  icon     - icône optionnelle à la place du point
 * @param {string}  className
 */
export default function Pill({
  children,
  tone = 'success',
  variant = 'soft',
  pulse = false,
  live = false,
  icon,
  className = '',
  ...rest
}) {
  const shouldPulse = pulse || live;

  // --- Tones (couleurs du point + fond + texte) ---
  const TONES = {
    neutral:    { dot: 'bg-ink-muted',    soft: 'bg-surface-muted text-ink-muted border-border',           outline: 'bg-transparent text-ink-muted border-border-strong' },
    primary:    { dot: 'bg-primary',      soft: 'bg-primary-soft text-primary border-primary/20',           outline: 'bg-transparent text-primary border-primary/40' },
    success:    { dot: 'bg-secondary',    soft: 'bg-secondary-soft text-secondary border-secondary/20',     outline: 'bg-transparent text-secondary border-secondary/40' },
    warning:    { dot: 'bg-tertiary',     soft: 'bg-tertiary-soft text-tertiary border-tertiary/20',        outline: 'bg-transparent text-tertiary border-tertiary/40' },
    danger:     { dot: 'bg-danger',       soft: 'bg-danger-soft text-danger border-danger/20',              outline: 'bg-transparent text-danger border-danger/40' },
    pedestrian: { dot: 'bg-pedestrian',   soft: 'bg-pedestrian-soft text-pedestrian border-pedestrian/20',  outline: 'bg-transparent text-pedestrian border-pedestrian/40' },
  };

  const palette = TONES[tone] ?? TONES.success;
  const colorClass = variant === 'outline' ? palette.outline : palette.soft;

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5',
        'px-2.5 py-1 rounded-full',
        'border',
        'font-mono text-badge-mono uppercase tracking-wider font-semibold',
        'whitespace-nowrap',
        'transition-colors duration-200 ease-out',
        colorClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {/* Indicateur visuel : soit une icône, soit un point */}
      {icon ? (
        <span
          className={[
            'material-symbols-outlined text-[12px] leading-none shrink-0',
            shouldPulse ? 'animate-pulse' : '',
          ].join(' ')}
        >
          {icon}
        </span>
      ) : (
        <span className="relative flex items-center justify-center shrink-0 w-2 h-2">
          {/* Halo qui pulse à l'extérieur du point */}
          {shouldPulse && (
            <span
              className={[
                'absolute inline-flex w-full h-full rounded-full',
                palette.dot,
                'opacity-60 animate-ping',
              ].join(' ')}
            />
          )}
          {/* Point principal */}
          <span
            className={[
              'relative inline-flex w-2 h-2 rounded-full',
              palette.dot,
            ].join(' ')}
          />
        </span>
      )}

      {children}
    </span>
  );
}