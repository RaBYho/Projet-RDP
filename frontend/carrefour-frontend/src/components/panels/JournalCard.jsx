import { useMemo } from 'react';
import Icon from '../atoms/Icon.jsx';
import Badge from '../atoms/Badge.jsx';
import { useNetwork } from '../../context/NetworkContext.jsx';
import { getCategory } from '../../theme/categories.js';

const INJECT_CATEGORY = {
  voiture_ns: 'normal',
  voiture_eo: 'normal',
  pieton:     'pieton',
  bus:        'bus',
  urgence:    'urgence',
};

const INJECT_LABEL = {
  voiture_ns: 'Voiture NS',
  voiture_eo: 'Voiture EO',
  pieton:     'Piéton',
  bus:        'Bus RFID',
  urgence:    'Urgence',
};

const INJECT_ICON = {
  voiture_ns: 'south',
  voiture_eo: 'east',
  pieton:     'directions_walk',
  bus:        'directions_bus',
  urgence:    'warning',
};

function entryCategory(entry, network) {
  if (entry.kind === 'inject') {
    const event = entry.transition?.replace('inject:', '') ?? '';
    return INJECT_CATEGORY[event] ?? 'normal';
  }
  const tr = network?.transitions?.find((t) => t.id === entry.transition);
  return tr?.category ?? 'normal';
}

function entryLabel(entry, network) {
  if (entry.kind === 'inject') {
    const event = entry.transition?.replace('inject:', '') ?? '';
    return INJECT_LABEL[event] ?? event;
  }
  const tr = network?.transitions?.find((t) => t.id === entry.transition);
  return tr ? `${entry.transition} · ${tr.label}` : entry.transition;
}

function entryIcon(entry, network, category) {
  if (entry.kind === 'inject') {
    const event = entry.transition?.replace('inject:', '') ?? '';
    return INJECT_ICON[event] ?? 'bolt';
  }
  return getCategory(category).icon;
}

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

/**
 * JournalCard
 *
 * @param {boolean} fillHeight - true : la liste prend toute la hauteur (mode onglet)
 *                               false : la liste est limitée à 220px (mode empilé)
 */
export default function JournalCard({ fillHeight = false }) {
  const { network, journal } = useNetwork();

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

  const cardClass = fillHeight
    ? 'bg-surface-panel rounded-lg border border-border shadow-l1 p-space-lg flex flex-col gap-space-md h-full min-h-0'
    : 'bg-surface-panel rounded-lg border border-border shadow-l1 p-space-lg flex flex-col gap-space-md';

  const listClass = fillHeight
    ? 'flex flex-col gap-space-sm flex-1 min-h-0 overflow-y-auto scrollbar-thin pr-2 -mr-2'
    : 'flex flex-col gap-space-sm h-[220px] overflow-y-auto scrollbar-thin pr-2 -mr-2';

  return (
    <div className={cardClass}>
      {/* En-tête */}
      <div className="flex items-center justify-between gap-space-sm shrink-0">
        <div className="flex items-center gap-space-sm">
          <Icon name="history" size={18} className="text-primary" />
          <span className="text-headline-sm text-ink">Journal des Tirs</span>
        </div>
        <Badge tone="neutral" variant="soft" shape="tag">
          {enriched.length} / 50
        </Badge>
      </div>

      {/* Liste */}
      {enriched.length === 0 ? (
        <EmptyState fillHeight={fillHeight} />
      ) : (
        <div className={listClass}>
          {enriched.map((entry) => (
            <JournalRow key={entry.key} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}

function JournalRow({ entry }) {
  const cat = getCategory(entry._category);
  const delta = entry.delta;
  const deltaLabel = delta == null ? '—' : `${delta >= 0 ? '+' : ''}${delta}`;
  const deltaTone =
    delta == null
      ? 'text-ink-caption'
      : delta >= 0
        ? 'text-secondary'
        : 'text-danger';

  return (
    <div className="flex items-center gap-space-sm px-space-md py-space-sm rounded bg-surface-muted hover:bg-surface transition-colors duration-200 ease-out animate-[slideInTop_280ms_cubic-bezier(0.16,1,0.3,1)]">
      <span
        className="w-1.5 h-7 rounded-full shrink-0"
        style={{ backgroundColor: cat.hex }}
      />
      <span className="font-mono text-[10px] text-ink-caption tabular-nums shrink-0">
        {formatTime(entry.timestamp)}
      </span>
      <Icon
        name={entry._icon}
        size={14}
        className="shrink-0"
        style={{ color: cat.hex }}
      />
      <span className="text-body-sm text-ink truncate flex-1 min-w-0">
        {entry._label}
      </span>
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

function EmptyState({ fillHeight }) {
  return (
    <div
      className={[
        'flex flex-col items-center justify-center gap-space-sm text-center',
        fillHeight ? 'flex-1 min-h-0' : 'h-[220px]',
      ].join(' ')}
    >
      <Icon name="inbox" size={28} className="text-ink-disabled" />
      <div className="flex flex-col gap-space-xs">
        <p className="text-body-sm text-ink-caption">Aucun tir enregistré.</p>
        <p className="text-body-sm text-ink-disabled">
          Cliquez sur une transition franchissable, ou injectez un événement.
        </p>
      </div>
    </div>
  );
}