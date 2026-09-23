---
name: Carrefour Intelligent
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434655'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#006c4a'
  on-secondary: '#ffffff'
  secondary-container: '#82f5c1'
  on-secondary-container: '#00714e'
  tertiary: '#824500'
  on-tertiary: '#ffffff'
  tertiary-container: '#a65900'
  on-tertiary-container: '#ffede1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#85f8c4'
  secondary-fixed-dim: '#68dba9'
  on-secondary-fixed: '#002114'
  on-secondary-fixed-variant: '#005137'
  tertiary-fixed: '#ffdcc3'
  tertiary-fixed-dim: '#ffb77d'
  on-tertiary-fixed: '#2f1500'
  on-tertiary-fixed-variant: '#6e3900'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Geist
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
  body-lg:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-md:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  body-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  code-lg:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
  label-md:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-sm:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
  badge-mono:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 12px
    letterSpacing: 0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-dense: 0.5rem
  margin: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2rem
---

## Brand & Style

This design system embodies a high-precision, industrial-scientific interface crafted for civil engineers, traffic researchers, and system modelers. The aesthetic synthesizes the clarity of modern CAD/IDE engineering environments with the polish of contemporary analytical SaaS. 

The emotional tone is calm, authoritative, deterministic, and razor-sharp. Visual noise is minimized to prioritize cognitive focus on complex real-time discrete-event models, vector states, and concurrent Petri net graphs. Micro-details—such as 1px hairline structural borders, telemetry monospaced accents, and systematic color coding—reinforce a sense of operational safety and rigorous mathematical control.

## Colors

The palette establishes an analytical hierarchy through a light, low-fatigue slate base and dedicated functional domain hues tailored for light-mode telemetry workspaces:

- **Primary (`#2563EB`)**: Traffic telemetry, standard vehicle flow nodes, transition triggers, and active primary controls.
- **Secondary (`#059669`)**: Permissive signal phases (green lights), active Petri net marking tokens, and satisfied invariant constraints.
- **Tertiary (`#D97706`) / Auxiliary Orange (`#EA580C`)**: Transit priority queues (bus corridors), clearance intervals (amber signals), and capacity warnings.
- **Neutral (`#64748B`)**: Structural dividers, axis grids, inactive Petri net places/transitions, and secondary metadata.

### System Domain Constants
- **Emergency / Stop Phase**: `#DC2626` (Red lights, emergency vehicle preemption, conflict violations).
- **Pedestrian Domain**: `#7C3AED` (Crosswalk demand phases, pedestrian walk/clearance transitions).
- **Surfaces**: Canvas base is optimized for light mode with clean light tones (`#F8FAFC`), panel containers sit on elevated surfaces (`#FFFFFF`), and structural hairline borders utilize refined contrast variants (`#E2E8F0`). High-density text hierarchy relies on `#0F172A` (primary text), `#475569` (secondary values), and `#64748B` (captions and units).

## Typography

The typography leverages a dual-font structure:

1. **Geist**: Applied across all application chrome, section headers, standard values, toolbars, and modal structures. Provides neutral, high-density legibility without idiosyncratic distortions.
2. **JetBrains Mono**: Strictly reserved for mathematical notations, state matrices, Petri net vectors ($M_0, M_1$), firing sequences, timestamp counters, physical units ($m/s^2$, $veh/h$), and code-like telemetry values.

All numerical matrix values and state readouts must utilize tabular numerals (`font-variant-numeric: tabular-nums`) to prevent spatial jitter during live simulation playback.

## Layout & Spacing

The application employs a fixed-dock engineering workbench architecture optimized for widescreen desktop interaction:

- **Global Shell**: A 3-tier layout featuring a fixed top telemetry ribbon (48px height), a dynamic central split-canvas (Petri net graph view adjacent to real-time physical junction simulation), and collapsible docking sidebars (width: 320px–380px) for parametric inputs and state inspectors.
- **Rhythm**: Standard 4px spatial units with an 8px default progression. Component internals use compact vertical padding (`space-xs` and `space-sm`) to support high-density parameter tuning.
- **Canvas Panels**: Interactive visualizer viewports leverage fluid flex structures maintaining 16px section margins and 8px gutters between synchronized analytical tool windows.

## Elevation & Depth

Visual separation relies primarily on structural hairline outlines complemented by clean, low-opacity shadows adapted for light-mode interfaces to maintain a modern, surgical CAD look:

- **Level 0 (Base Workbench)**: Flat `#F8FAFC` background. Canvas grids are rendered with subtle dotted line arrays (16px grid intervals).
- **Level 1 (Panels & Toolbars)**: `#FFFFFF` surface with a crisp `1px solid #E2E8F0` border. Shadow: `0 1px 3px 0 rgba(0, 0, 0, 0.05)`.
- **Level 2 (Floating Inspect Panels & Flyouts)**: `#FFFFFF` surface, `1px solid #CBD5E1`. Shadow: `0 4px 12px -2px rgba(0, 0, 0, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)`.
- **Level 3 (Modal Dialogs & Command Palette)**: `#FFFFFF` with `1px solid #94A3B8`. Shadow: `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.04)`.

## Shapes

The design system maintains a **Soft** shape profile (`roundedness: 1`), conveying technical discipline and instrument-grade construction:

- **Interactive Controls & Panels**: Standard components (inputs, panels, buttons, cards) utilize `4px` (`rounded-sm` / `0.25rem`) to `6px` radii.
- **Modals & Containers**: Outer window containers feature `8px` (`rounded-lg` / `0.5rem`).
- **Telemetry Badges & Petri Net Tokens**: Discrete state pills and status indicators leverage full pill caps (`9999px`) to visually contrast against the rigid rectilinear layout grids.

## Components

### Buttons & Simulation Controls
- **Primary Action (Run / Apply)**: Background `#2563EB`, text `#FFFFFF`, 4px radius, medium font weight. Hover: `#1D4ED8`. Active: `#1E40AF`.
- **Simulation Control Group**: Segmented horizontal toolbar (`Play`, `Step`, `Pause`, `Reset`). Connected inline group with `1px solid #E2E8F0` dividing lines, using JetBrains Mono time step labels.
- **Destructive / Halt**: Outline or solid with `#DC2626` accents for immediate intersection freeze or constraint violations.

### Status Badges & Vector Chips
- **Geometry**: Compact pill-shaped containers (`border-radius: 9999px`), padding `2px 8px`.
- **Typographic Treatment**: `badge-mono` uppercase styling.
- **Variants**:
  - *Standard Traffic*: Background `#F1F5F9`, border `1px solid #CBD5E1`, text `#1E293B`.
  - *Green / Permitted*: Background `#ECFDF5`, border `1px solid #A7F3D0`, text `#065F46`.
  - *Transit / Yellow*: Background `#FFFBEB`, border `1px solid #FDE68A`, text `#78350F`.
  - *Pedestrian Phase*: Background `#F5F3FF`, border `1px solid #DDD6FE`, text `#4C1D95`.
  - *Emergency Preemption*: Background `#FEF2F2`, border `1px solid #FECACA`, text `#7F1D1D`.

### Cards & Analytical Panels
- Light surface background (`#FFFFFF`), `1px solid #E2E8F0` outer edge, 6px radius.
- Headers are delineated by a bottom `1px solid #E2E8F0` rule, with title in `headline-sm` alongside real-time monospace parameter readouts.

### Form Inputs & Parameter Sliders
- **Inputs**: Height 32px, border `1px solid #CBD5E1`, background `#FFFFFF`, text `#0F172A`. Focused: `border-color: #2563EB` with `box-shadow: 0 0 0 1px #2563EB`. Text displays in `code-md` for numerical values.
- **Toggles & Checkboxes**: Square with 3px border radius, accentuating technical control over decorative smoothness.

### Petri Net Graph Node Elements
- **Places ($P_n$)**: Crisp circular nodes with 2px stroke (`#64748B`), filled with `#F8FAFC`. Monospace subscript labels centered or adjacent. Active markings indicated by solid `#059669` or `#2563EB` inner token dots.
- **Transitions ($T_n$)**: Rectangular bars (width: 32px, height: 8px or vertical equivalents), transitioning from `#94A3B8` (idle) to filled `#2563EB` or `#059669` when enabled and firing.