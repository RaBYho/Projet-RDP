import { useState } from 'react';
import Icon from '../components/atoms/Icon.jsx';
import Badge from '../components/atoms/Badge.jsx';
import Button from '../components/atoms/Button.jsx';
import Toggle from '../components/atoms/Toggle.jsx';
import SegmentedControl from '../components/atoms/SegmentedControl.jsx';
import ProgressBar from '../components/atoms/ProgressBar.jsx';
import SkeletonBlock from '../components/atoms/SkeletonBlock.jsx';
import ValueChip from '../components/atoms/ValueChip.jsx';
import Pill from '../components/atoms/Pill.jsx';

/* ------------------------------------------------------------------ */
/*  Petit wrapper pour chaque section                                  */
/* ------------------------------------------------------------------ */
function Section({ title, subtitle, children }) {
  return (
    <section className="p-space-lg rounded-lg bg-surface-panel border border-border shadow-l1">
      <header className="mb-space-lg pb-space-md border-b border-border">
        <h2 className="text-headline-sm text-ink">{title}</h2>
        {subtitle && (
          <p className="text-body-sm text-ink-caption mt-0.5">{subtitle}</p>
        )}
      </header>
      <div className="flex flex-col gap-space-md">{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Ligne d'échantillons : label + zone de démonstration               */
/* ------------------------------------------------------------------ */
function Row({ label, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-space-sm">
      <span className="font-mono text-code-sm text-ink-caption sm:w-40 shrink-0">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-space-sm">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function KitchenSinkPage() {
  const [toggle1, setToggle1] = useState(true);
  const [toggle2, setToggle2] = useState(false);
  const [view, setView] = useState('formal');
  const [rate, setRate] = useState('1x');
  const [filter, setFilter] = useState('all');

  return (
    <div className="px-margin py-space-xl">
      {/* En-tête */}
      <div className="mb-space-xl">
        <Pill tone="primary" live>Phase 1 · Atomes</Pill>
        <h1 className="mt-space-md text-display text-ink">Kitchen Sink</h1>
        <p className="mt-space-sm text-body-lg text-ink-muted max-w-2xl">
          Validation visuelle des 9 atomes avant clôture de la Phase 1.
          Cette page est temporaire et sera supprimée avant la Phase 2.
        </p>
      </div>

      <div className="flex flex-col gap-space-lg max-w-5xl">

        {/* ============ ICON ============ */}
        <Section title="Icon" subtitle="Material Symbols · 3 tailles · animations">
          <Row label="tailles">
            <Icon name="traffic" size={14} />
            <Icon name="traffic" size={18} />
            <Icon name="traffic" size={24} />
            <Icon name="traffic" size={32} />
          </Row>
          <Row label="couleurs">
            <Icon name="check_circle" className="text-secondary" />
            <Icon name="warning" className="text-danger" />
            <Icon name="directions_bus" className="text-tertiary" />
            <Icon name="directions_walk" className="text-pedestrian" />
            <Icon name="sync" className="text-primary" />
          </Row>
          <Row label="animations">
            <Icon name="sync" animate="spin" />
            <Icon name="fiber_manual_record" animate="pulse" className="text-danger" />
            <Icon name="keyboard_arrow_down" animate="bounce" />
          </Row>
          <Row label="variant filled">
            <Icon name="favorite" size={20} />
            <Icon name="favorite" size={20} variant="filled" className="text-danger" />
          </Row>
        </Section>

        {/* ============ BADGE ============ */}
        <Section title="Badge" subtitle="3 variantes × 8 tones × 2 formes">
          <Row label="soft (défaut)">
            <Badge>Neutre</Badge>
            <Badge tone="primary">Primary</Badge>
            <Badge tone="success">Valide</Badge>
            <Badge tone="warning">En attente</Badge>
            <Badge tone="danger">Échec</Badge>
            <Badge tone="pedestrian">Piéton</Badge>
            <Badge tone="bus">Bus</Badge>
            <Badge tone="urgence">Urgence</Badge>
          </Row>
          <Row label="solid">
            <Badge tone="primary" variant="solid">Info</Badge>
            <Badge tone="success" variant="solid">OK</Badge>
            <Badge tone="warning" variant="solid">Warn</Badge>
            <Badge tone="danger" variant="solid">Échec</Badge>
          </Row>
          <Row label="outline">
            <Badge tone="primary" variant="outline">V2.4 LTS</Badge>
            <Badge tone="success" variant="outline">Conforme</Badge>
            <Badge tone="danger" variant="outline">Critique</Badge>
          </Row>
          <Row label="shape tag">
            <Badge tone="primary" shape="tag">v2.4 LTS</Badge>
            <Badge tone="neutral" shape="tag">Formel M(P)</Badge>
          </Row>
          <Row label="avec icône">
            <Badge tone="success" icon="check_circle">OK</Badge>
            <Badge tone="danger" icon="warning">Alerte</Badge>
          </Row>
        </Section>

        {/* ============ BUTTON ============ */}
        <Section title="Button" subtitle="6 variantes × 3 tailles × icônes × états">
          <Row label="variantes">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="success">Success</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
          </Row>
          <Row label="tailles">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </Row>
          <Row label="avec icônes">
            <Button iconLeft="swap_vert">Voiture NS</Button>
            <Button variant="secondary" iconLeft="restart_alt">Reset</Button>
            <Button variant="danger" iconLeft="warning">Urgence</Button>
            <Button variant="ghost" iconRight="chevron_right">Détails</Button>
          </Row>
          <Row label="icône seule">
            <Button size="sm" iconOnly iconLeft="zoom_in" variant="secondary" />
            <Button size="md" iconOnly iconLeft="zoom_out" variant="secondary" />
            <Button size="md" iconOnly iconLeft="fit_screen" variant="secondary" />
          </Row>
          <Row label="états">
            <Button loading>Chargement…</Button>
            <Button disabled>Désactivé</Button>
            <Button variant="danger" disabled>Urgence</Button>
          </Row>
          <Row label="pleine largeur">
            <div className="w-full max-w-md">
              <Button fullWidth iconRight="arrow_forward">Continuer</Button>
            </div>
          </Row>
        </Section>

        {/* ============ TOGGLE ============ */}
        <Section title="Toggle" subtitle="2 tailles × avec/sans icône">
          <Row label="avec label">
            <Toggle checked={toggle1} onChange={setToggle1} label="Capteurs" />
            <Toggle checked={toggle2} onChange={setToggle2} label="Trajectoires" />
          </Row>
          <Row label="avec icône + label">
            <Toggle
              checked={toggle1}
              onChange={setToggle1}
              label="Capteurs"
              icon="sensors"
            />
            <Toggle
              checked={toggle2}
              onChange={setToggle2}
              label="Trajectoires"
              icon="timeline"
            />
          </Row>
          <Row label="small">
            <Toggle size="sm" checked={toggle1} onChange={setToggle1} label="Mini" />
            <Toggle size="sm" checked={toggle2} onChange={setToggle2} label="Mini" />
          </Row>
          <Row label="sans label">
            <Toggle checked={toggle1} onChange={setToggle1} />
            <Toggle checked={toggle2} onChange={setToggle2} />
          </Row>
          <Row label="désactivé">
            <Toggle checked={false} disabled label="Off" />
            <Toggle checked={true} disabled label="On" />
          </Row>
        </Section>

        {/* ============ SEGMENTED CONTROL ============ */}
        <Section title="SegmentedControl" subtitle="Modes exclusifs · avec/sans icônes">
          <Row label="formelle/simplifiée">
            <SegmentedControl
              value={view}
              onChange={setView}
              ariaLabel="Mode d'affichage"
              options={[
                { value: 'formal', label: 'Formelle' },
                { value: 'simplified', label: 'Simplifiée' },
              ]}
            />
          </Row>
          <Row label="avec icônes">
            <SegmentedControl
              value={view}
              onChange={setView}
              ariaLabel="Mode d'affichage"
              options={[
                { value: 'formal', label: 'Formelle', icon: 'account_tree' },
                { value: 'simplified', label: 'Simplifiée', icon: 'visibility' },
              ]}
            />
          </Row>
          <Row label="cadence">
            <SegmentedControl
              size="sm"
              value={rate}
              onChange={setRate}
              ariaLabel="Cadence"
              options={[
                { value: '1x', label: '1×' },
                { value: '2x', label: '2×' },
                { value: '4x', label: '4×' },
              ]}
            />
          </Row>
          <Row label="filtres catégories">
            <SegmentedControl
              value={filter}
              onChange={setFilter}
              ariaLabel="Filtres"
              options={[
                { value: 'all', label: 'Tout' },
                { value: 'normal', label: 'Normal' },
                { value: 'bus', label: 'Bus' },
                { value: 'urgence', label: 'Urgence' },
                { value: 'pieton', label: 'Piéton' },
              ]}
            />
          </Row>
          <Row label="pleine largeur">
            <div className="w-full max-w-md">
              <SegmentedControl
                fullWidth
                value={view}
                onChange={setView}
                options={[
                  { value: 'formal', label: 'Formelle' },
                  { value: 'simplified', label: 'Simplifiée' },
                ]}
              />
            </div>
          </Row>
          <Row label="désactivé">
            <SegmentedControl
              disabled
              value="a"
              options={[
                { value: 'a', label: 'A' },
                { value: 'b', label: 'B' },
              ]}
            />
          </Row>
        </Section>

        {/* ============ PROGRESS BAR ============ */}
        <Section title="ProgressBar" subtitle="4 tones · déterminé/indéterminé · shimmer">
          <Row label="déterminé">
            <div className="w-full max-w-md flex flex-col gap-space-sm">
              <ProgressBar value={25} tone="primary" showValue />
              <ProgressBar value={50} tone="success" showValue />
              <ProgressBar value={75} tone="warning" showValue />
              <ProgressBar value={95} tone="danger" showValue />
            </div>
          </Row>
          <Row label="avec label + shimmer">
            <div className="w-full max-w-md">
              <ProgressBar
                value={68}
                tone="primary"
                label="Initialisation réseau"
                showValue
                shimmer
              />
            </div>
          </Row>
          <Row label="indéterminé">
            <div className="w-full max-w-md">
              <ProgressBar indeterminate tone="primary" />
            </div>
          </Row>
          <Row label="capacité (hint)">
            <div className="w-full max-w-md flex flex-col gap-space-sm">
              <ProgressBar value={25} tone="primary" label="File NS" hint="3 / 12" />
              <ProgressBar value={83} tone="warning" label="File EO" hint="10 / 12" />
              <ProgressBar value={100} tone="danger" label="Saturation" hint="12 / 12" />
            </div>
          </Row>
          <Row label="tailles">
            <div className="w-full max-w-md flex flex-col gap-space-sm">
              <ProgressBar size="sm" value={60} showValue />
              <ProgressBar size="md" value={60} showValue />
              <ProgressBar size="lg" value={60} showValue />
            </div>
          </Row>
        </Section>

        {/* ============ SKELETON BLOCK ============ */}
        <Section title="SkeletonBlock" subtitle="rect · circle · text multi-lignes">
          <Row label="rect">
            <SkeletonBlock width={120} height={16} />
            <SkeletonBlock width={80} height={24} />
            <SkeletonBlock width={200} height={12} />
          </Row>
          <Row label="circle">
            <SkeletonBlock shape="circle" size={24} />
            <SkeletonBlock shape="circle" size={36} />
            <SkeletonBlock shape="circle" size={48} />
          </Row>
          <Row label="text 1 ligne">
            <SkeletonBlock shape="text" width="100%" height={14} />
          </Row>
          <Row label="text 3 lignes">
            <div className="w-full max-w-md">
              <SkeletonBlock shape="text" lines={3} width="100%" height={12} />
            </div>
          </Row>
          <Row label="composé (avatar + texte)">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-muted w-full max-w-sm">
              <SkeletonBlock shape="circle" size={40} />
              <div className="flex flex-col gap-2 flex-1">
                <SkeletonBlock width="60%" height={12} />
                <SkeletonBlock width="40%" height={10} />
              </div>
            </div>
          </Row>
        </Section>

        {/* ============ VALUE CHIP ============ */}
        <Section title="ValueChip" subtitle="2 tailles × 6 tones × label/unité/icône">
          <Row label="basique">
            <ValueChip label="t =" value="142.4" unit="s" />
            <ValueChip label="M₀ :" value="8" unit="jetons" tone="primary" />
            <ValueChip label="|P| =" value="15" />
            <ValueChip label="|T| =" value="16" />
          </Row>
          <Row label="tones">
            <ValueChip label="P1 :" value="1" tone="success" />
            <ValueChip label="P11 :" value="0" tone="neutral" />
            <ValueChip label="Bus :" value="1" tone="warning" />
            <ValueChip label="Σ M =" value="9" tone="danger" />
            <ValueChip label="Piéton :" value="2" tone="pedestrian" />
          </Row>
          <Row label="avec icône">
            <ValueChip icon="schedule" label="NS :" value="3/12" tone="warning" />
            <ValueChip icon="directions_bus" value="45m" tone="warning" />
            <ValueChip icon="timer" value="08s" unit="avant orange" tone="primary" />
          </Row>
          <Row label="small">
            <ValueChip size="sm" label="P1 :" value="1" tone="success" />
            <ValueChip size="sm" label="P2 :" value="0" />
            <ValueChip size="sm" label="P3 :" value="1" tone="primary" />
          </Row>
        </Section>

        {/* ============ PILL ============ */}
        <Section title="Pill" subtitle="6 tones × pulse · avec/sans icône">
          <Row label="live (pulse)">
            <Pill tone="success" live>60 Hz Actif</Pill>
            <Pill tone="primary" live>Init en cours</Pill>
            <Pill tone="danger" live>Arrêt urgence</Pill>
            <Pill tone="warning" live>Bus en approche</Pill>
          </Row>
          <Row label="sans pulse">
            <Pill tone="neutral">En veille</Pill>
            <Pill tone="primary">Formel M(P)</Pill>
            <Pill tone="success">Conforme</Pill>
            <Pill tone="pedestrian">Phase piéton</Pill>
          </Row>
          <Row label="outline">
            <Pill tone="primary" variant="outline">En attente</Pill>
            <Pill tone="success" variant="outline" live>Direct</Pill>
            <Pill tone="danger" variant="outline">Critique</Pill>
          </Row>
          <Row label="avec icône">
            <Pill tone="warning" icon="directions_bus">Bus Ligne 04</Pill>
            <Pill tone="danger" icon="e911_emergency" live>Préemption</Pill>
            <Pill tone="primary" icon="verified_user">Sûr &amp; vivant</Pill>
          </Row>
        </Section>

        {/* Footer */}
        <div className="mt-space-xl p-space-md rounded-lg bg-surface-muted border border-border text-center">
          <p className="text-body-sm text-ink-muted">
            ✅ Les 9 atomes sont rendus. Si tout est visuellement cohérent,
            la Phase 1 peut être clôturée.
          </p>
        </div>

      </div>
    </div>
  );
}