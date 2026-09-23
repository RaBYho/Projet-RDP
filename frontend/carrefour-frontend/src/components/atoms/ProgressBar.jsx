/**
 * ProgressBar — barre de progression.
 *
 * @param {number}  value    - 0 à 100 (ignoré si indeterminate=true)
 * @param {'primary'|'success'|'warning'|'danger'} tone
 * @param {'sm'|'md'|'lg'} size
 * @param {boolean} indeterminate - mode indéterminé (shimmer qui glisse)
 * @param {boolean} shimmer       - effet shimmer sur la barre déterminée
 * @param {string}  label         - texte à gauche au-dessus
 * @param {string}  hint          - texte à droite au-dessus (ex: "68 %")
 * @param {boolean} showValue     - affiche automatiquement "value %" à droite
 * @param {string}  className
 */
export default function ProgressBar({
  value = 0,
  tone = 'primary',
  size = 'md',
  indeterminate = false,
  shimmer = false,
  label,
  hint,
  showValue = false,
  className = '',
  ...rest
}) {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0));

  // --- Tones ---
  const TONES = {
    primary: { bar: 'bg-primary',     track: 'bg-primary-soft',     shimmerFrom: 'via-white/60' },
    success: { bar: 'bg-secondary',   track: 'bg-secondary-soft',   shimmerFrom: 'via-white/60' },
    warning: { bar: 'bg-tertiary',    track: 'bg-tertiary-soft',    shimmerFrom: 'via-white/60' },
    danger:  { bar: 'bg-danger',      track: 'bg-danger-soft',      shimmerFrom: 'via-white/60' },
  };
  const palette = TONES[tone] ?? TONES.primary;

  // --- Sizes ---
  const SIZES = {
    sm: { track: 'h-1',   radius: 'rounded-full', text: 'text-label-sm' },
    md: { track: 'h-1.5', radius: 'rounded-full', text: 'text-label-md' },
    lg: { track: 'h-2.5', radius: 'rounded-full', text: 'text-body-sm' },
  };
  const sz = SIZES[size] ?? SIZES.md;

  const hintText = showValue ? `${Math.round(clamped)} %` : hint;
  const showHeader = Boolean(label || hintText);

  return (
    <div
      className={['w-full flex flex-col gap-1', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {/* En-tête optionnel : label à gauche + hint à droite */}
      {showHeader && (
        <div className={['flex items-center justify-between', sz.text].join(' ')}>
          {label && (
            <span className="text-ink-muted font-medium truncate">{label}</span>
          )}
          {hintText && (
            <span className="text-ink font-mono font-semibold tabular-nums shrink-0 ml-2">
              {hintText}
            </span>
          )}
        </div>
      )}

      {/* Piste */}
      <div
        role="progressbar"
        aria-valuemin={indeterminate ? undefined : 0}
        aria-valuemax={indeterminate ? undefined : 100}
        aria-valuenow={indeterminate ? undefined : clamped}
        aria-label={label || undefined}
        className={[
          'relative w-full overflow-hidden',
          sz.track,
          sz.radius,
          palette.track,
        ].join(' ')}
      >
        {/* Mode indéterminé : barre de 40 % qui glisse en boucle */}
        {indeterminate ? (
          <div
            className={[
              'absolute inset-y-0 w-2/5',
              palette.bar,
              sz.radius,
              'animate-[indeterminate_1.4s_ease-in-out_infinite]',
            ].join(' ')}
          />
        ) : (
          <div
            className={[
              'relative h-full',
              palette.bar,
              sz.radius,
              'transition-[width] duration-500 ease-out',
            ].join(' ')}
            style={{ width: `${clamped}%` }}
          >
            {/* Shimmer optionnel : bande lumineuse qui traverse la barre */}
            {shimmer && clamped > 0 && (
              <div
                className={[
                  'absolute inset-0',
                  'bg-gradient-to-r from-transparent to-transparent',
                  palette.shimmerFrom,
                  'animate-[shimmer_1.8s_linear_infinite]',
                ].join(' ')}
                style={{ backgroundSize: '200% 100%' }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}