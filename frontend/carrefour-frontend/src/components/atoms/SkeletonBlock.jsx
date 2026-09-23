/**
 * SkeletonBlock — placeholder de chargement avec shimmer.
 *
 * @param {'rect'|'circle'|'text'} shape
 * @param {string|number} width  - ex: '100%', 48, '12rem'
 * @param {string|number} height - ex: 16, '1rem' (ignoré si shape='circle')
 * @param {number}  size      - pour shape='circle' uniquement (px)
 * @param {string}  className - classes additionnelles
 * @param {number}  lines     - pour shape='text' : nombre de lignes à empiler
 */
export default function SkeletonBlock({
  shape = 'rect',
  width = '100%',
  height = 16,
  size,
  className = '',
  lines = 1,
  ...rest
}) {
  // Convertit un nombre en pixels
  const toCss = (v) => (typeof v === 'number' ? `${v}px` : v);

  // --- Style de base commun ---
  const baseClass = [
    'relative overflow-hidden',
    'bg-surface-muted',
    'animate-[shimmer_1.8s_linear_infinite]',
  ].join(' ');

  // Gradient shimmer appliqué en fond animé
  const shimmerStyle = {
    backgroundImage:
      'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.65) 50%, transparent 100%)',
    backgroundSize: '200% 100%',
    backgroundRepeat: 'no-repeat',
  };

  // --- Forme circle ---
  if (shape === 'circle') {
    const diameter = size ?? (typeof height === 'number' ? height : 40);
    return (
      <span
        className={[baseClass, 'rounded-full inline-block shrink-0', className]
          .filter(Boolean)
          .join(' ')}
        style={{
          width: `${diameter}px`,
          height: `${diameter}px`,
          ...shimmerStyle,
        }}
        aria-hidden="true"
        {...rest}
      />
    );
  }

  // --- Forme text (multi-lignes) ---
  if (shape === 'text') {
    const safeLines = Math.max(1, Math.floor(lines));
    return (
      <span
        className={['flex flex-col gap-1.5', className].filter(Boolean).join(' ')}
        aria-hidden="true"
        {...rest}
      >
        {Array.from({ length: safeLines }).map((_, i) => {
          // Dernière ligne : plus courte (comme du texte réel)
          const isLast = i === safeLines - 1 && safeLines > 1;
          return (
            <span
              key={i}
              className={[baseClass, 'rounded', 'block'].join(' ')}
              style={{
                width: isLast ? '60%' : toCss(width),
                height: toCss(height),
                ...shimmerStyle,
              }}
            />
          );
        })}
      </span>
    );
  }

  // --- Forme rect (défaut) ---
  return (
    <span
      className={[baseClass, 'rounded', 'block', className]
        .filter(Boolean)
        .join(' ')}
      style={{
        width: toCss(width),
        height: toCss(height),
        ...shimmerStyle,
      }}
      aria-hidden="true"
      {...rest}
    />
  );
}