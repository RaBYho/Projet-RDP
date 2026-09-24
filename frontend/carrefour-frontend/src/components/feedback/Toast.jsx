import { useEffect } from 'react';
import Icon from '../atoms/Icon.jsx';
import { useNetwork } from '../../context/NetworkContext.jsx';

/**
 * Toast — notification flottante pour les erreurs et infos.
 *
 * Branché directement sur NetworkContext :
 *   - Lit `toast` ({ kind, message })
 *   - Appelle `dismissToast()` pour fermer
 *   - Support clavier (Échap)
 *
 * Placement : bas-centre, au-dessus du ControlPanel.
 *
 * Auto-dismiss : géré par NetworkContext (4s), pas ici.
 */
export default function Toast() {
  const { toast, dismissToast } = useNetwork();

  /* Fermeture au clavier (Échap) */
  useEffect(() => {
    if (!toast) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') dismissToast?.();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [toast, dismissToast]);

  if (!toast) return null;

  const isError = toast.kind === 'error';

  const TONES = {
    error: {
      bg: 'bg-danger-soft',
      border: 'border-danger/40',
      text: 'text-danger',
      icon: 'error',
    },
    info: {
      bg: 'bg-secondary-soft',
      border: 'border-secondary/40',
      text: 'text-secondary',
      icon: 'info',
    },
  };

  const t = isError ? TONES.error : TONES.info;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-[fadeUp_250ms_ease-out]"
    >
      <div
        className={[
          'flex items-center gap-space-md',
          'px-space-lg py-space-md rounded-lg',
          'shadow-l2 border',
          'max-w-md',
          t.bg,
          t.border,
          t.text,
        ].join(' ')}
      >
        <Icon name={t.icon} size={18} className="shrink-0" />

        <span className="text-label-md font-medium flex-1 min-w-0">
          {toast.message}
        </span>

        <button
          type="button"
          onClick={dismissToast}
          title="Fermer (Échap)"
          className="
            w-6 h-6 rounded flex items-center justify-center shrink-0
            hover:bg-white/40 transition-colors duration-200
            focus:outline-none focus-visible:ring-2 focus-visible:ring-current/30
          "
        >
          <Icon name="close" size={14} />
        </button>
      </div>
    </div>
  );
}