import { useMemo } from 'react';
import Icon from '../atoms/Icon.jsx';
import Badge from '../atoms/Badge.jsx';
import { useNetwork } from '../../context/NetworkContext.jsx';
import { getCategory } from '../../theme/categories.js';

/* Mapping événement injecté → catégorie (pour l'enrichissement visuel). */
const INJECT_CATEGORY = {
  voiture_ns: 'normal',
  voiture_eo: 'normal',
  pieton:     'pieton',
  bus:        'bus',
  urgence:    'urgence',
};

/* Mapping événement injecté → label humain court. */
const INJECT_LABEL = {
  voiture_ns: 'Voiture NS',
  voiture_eo: 'Voiture EO',
  pieton:     'Piéton',
  bus:        'Bus RFID',
  urgence:    'Urgence',
};

/* Mapping événement injecté → icône Material Symbols. */
const INJECT_ICON = {
  voiture_ns: 'south',
  voiture_eo: 'east',
  pieton:     'directions_walk',
  bus:        'directions_bus',
  urgence:    'warning',
};

/**
 * Déduit la catégorie d'une entrée de journal.
 *   - kind='inject' → catégorie de l'événement
 *   - kind='fire'   → catégorie de la transition (depuis network.transitions)
 */
function entryCategory(entry, network) {
  if (entry.kind === 'inject') {
    const event = entry.transition?.replace('inject:', '') ?? '';
    return INJECT_CATEGORY[event] ?? 'normal';
  }
  const tr = network?.transitions?.find((t) => t.id === entry.transition);
  return tr?.category ?? 'normal';
}

/**
 * Déduit le label humain d'une entrée.
 */
function entryLabel(entry, network) {
  if (entry.kind === 'inject') {
    const event = entry.transition?.replace('inject:', '') ?? '';
    return INJECT_LABEL[event] ?? event;
  }
  const tr = network?.transitions?.find((t) => t.id === entry.transition);
  return tr ? `${entry.transition} · ${tr.label}` : entry.transition;
}

/**
 * Déduit l'icône d'une entrée.
 */
function entryIcon(entry, network, category) {
  if (entry.kind === 'inject') {
    const event = entry.transition?.replace('inject:', '') ?? '';
    return INJECT_ICON[event] ?? 'bolt';
  }
  return getCategory(category).icon;
}

/**
 * Formate un timestamp ISO en HH:MM:SS.
 */
function formatTime(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('fr-FR', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return '—';
  }
}

export default function JournalCard() {
  const { network, journal } = useNetwork();

  /* Enrichissement des entrées — fait une seule fois par render,
     dépend de `journal` et `network` (pour le lookup catégorie). */
  const enriched = useMemo(
    () =>
      (journal ?? []).map((entry) => {
        const category = entryCategory(entry, network);
        return {
          ...entry,
          _category: category,
          _label: entryLabel(entry, network),
          _icon: entryIcon(entry, network, category),
        };
      }),
    [journal, network]
  );

  return (
    <div className="bg-surface-panel rounded-lg border border-border shadow-l1 p-space-md flex flex-col gap-space-sm">

      {/* ---- En-tête ---- */}
      <div className="flex items-center justify-between gap-space-sm">
        <div className="flex items-center gap-space-xs">
          <Icon name="history" size={18} className="text-primary" />
          <span className="text-headline-sm text-ink">Journal des Tirs</span>
        </div>
        <Badge tone="neutral" variant="soft" shape="tag">
          {enriched.length} / 50
        </Badge>
      </div>

      {/* ---- Liste ou état vide ---- */}
      {enriched.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-1 h-[180px] overflow-y-auto pr-1 -mr-1">
          {enriched.map((entry) => (
            <JournalRow key={entry.key} entry={entry} />
          ))}
        </div>
      )}

    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sous-composant : une ligne du journal                               */
/* ------------------------------------------------------------------ */
function JournalRow({ entry }) {
  const cat = getCategory(entry._category);
  const delta = entry.delta;
  const deltaLabel =
    delta == null ? '—' : `${delta >= 0 ? '+' : ''}${delta}`;
  const deltaTone =
    delta == null
      ? 'text-ink-caption'
      : delta >= 0
        ? 'text-secondary'
        : 'text-danger';

  return (
    <div
      className="flex items-center gap-space-sm px-2 py-1.5 rounded bg-surface-muted hover:bg-surface transition-colors duration-200 ease-out"
    >
      {/* Pastille colorée catégorie */}
      <span
        className="w-1.5 h-6 rounded-full shrink-0"
        style={{ backgroundColor: cat.hex }}
      />

      {/* Timestamp mono */}
      <span className="font-mono text-[10px] text-ink-caption tabular-nums shrink-0">
        {formatTime(entry.timestamp)}
      </span>

      {/* Icône */}
      <Icon
        name={entry._icon}
        size={14}
        className="shrink-0"
        style={{ color: cat.hex }}
      />

      {/* Label — tronqué si trop long */}
      <span className="text-body-sm text-ink truncate flex-1 min-w-0">
        {entry._label}
      </span>

      {/* Delta */}
      <span
        className={[
          'font-mono text-code-sm font-semibold tabular-nums shrink-0',
          deltaTone,
        ].join(' ')}
      >
        ΔM={deltaLabel}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sous-composant : état vide                                          */
/* ------------------------------------------------------------------ */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-space-xs h-[180px] text-center">
      <Icon name="inbox" size={24} className="text-ink-disabled" />
      <p className="text-body-sm text-ink-caption">
        Aucun tir enregistré.
      </p>
      <p className="text-body-sm text-ink-disabled">
        Cliquez sur une transition franchissable, ou injectez un événement.
      </p>
    </div>
  );
}