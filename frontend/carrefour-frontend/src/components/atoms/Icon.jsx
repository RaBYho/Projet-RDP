/**
 * Icon — wrapper typé pour Material Symbols Outlined.
 *
 * @param {string}  name      - nom du symbole (ex: "traffic", "check_circle")
 * @param {number}  size      - taille en px (défaut 18)
 * @param {string}  className - classes additionnelles (couleur, marges…)
 * @param {'outline'|'filled'} variant - style du glyphe
 * @param {'none'|'spin'|'pulse'|'bounce'} animate - animation
 */
export default function Icon({
  name,
  size = 18,
  className = '',
  variant = 'outline',
  animate = 'none',
  ...rest
}) {
  const fontFamily =
    variant === 'filled'
      ? 'material-symbols-outlined'
      : 'material-symbols-outlined';

  const animationClass = {
    none:   '',
    spin:   'animate-[spin_1.6s_linear_infinite]',
    pulse:  'animate-pulse',
    bounce: 'animate-bounce',
  }[animate] ?? '';

  return (
    <span
      className={[
        fontFamily,
        'inline-flex items-center justify-center',
        'select-none leading-none',
        'transition-transform duration-200 ease-out',
        animationClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        fontSize: `${size}px`,
        width: `${size}px`,
        height: `${size}px`,
        fontVariationSettings:
          variant === 'filled'
            ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
            : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
      }}
      aria-hidden="true"
      {...rest}
    >
      {name}
    </span>
  );
}