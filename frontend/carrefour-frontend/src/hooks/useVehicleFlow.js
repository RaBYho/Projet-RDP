import { useEffect, useRef, useState } from "react";

/* Active les logs de debug dans la console (à mettre false en prod) */
const DEBUG = false;

const DIRECTIONS = {
  ns: {
    axis: "y",
    lane: 340,
    start: -40,
    stopLine: 260,
    exit: 820,
    sign: +1,
    orientation: "south",
    color: "#2563EB",
    firePlace: "P1",
  },
  nsSud: {
    axis: "y",
    lane: 460,
    start: 840,
    stopLine: 540,
    exit: -20,
    sign: -1,
    orientation: "north",
    color: "#2563EB",
    firePlace: "P1",
  },
  eo: {
    axis: "x",
    lane: 460,
    start: -40,
    stopLine: 260,
    exit: 820,
    sign: +1,
    orientation: "east",
    color: "#0284C7",
    firePlace: "P4",
  },
  eoEst: {
    axis: "x",
    lane: 340,
    start: 840,
    stopLine: 540,
    exit: -20,
    sign: -1,
    orientation: "west",
    color: "#0284C7",
    firePlace: "P4",
  },
};

const SPEED = 140;
const CAR_LENGTH = 34;
const MIN_GAP = 8;

function distanceToStop(cfg, position) {
  return cfg.sign > 0 ? cfg.stopLine - position : position - cfg.stopLine;
}

/* Vérifie si deux tableaux de véhicules sont identiques (positions + états) */
function areVehiclesEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (
      a[i].id !== b[i].id ||
      a[i].position !== b[i].position ||
      a[i].state !== b[i].state
    ) {
      return false;
    }
  }
  return true;
}

export function useVehicleFlow({ marking }) {
  const [vehicles, setVehicles] = useState([]);
  const nextIdRef = useRef(1);
  const prevCountsRef = useRef({ ns: 0, nsSud: 0, eo: 0, eoEst: 0 });
  const markingRef = useRef(marking);
  const rafRef = useRef();
  const lastTimeRef = useRef(0);

  /* ⚠️ Extraire les compteurs en PRIMITIFS — évite les boucles infinies.
     marking est un objet dont la référence peut changer à chaque render. */
  const nsCount = marking?.P7 ?? 0;
  const nsSudCount = marking?.P16 ?? 0;
  const eoCount = marking?.P8 ?? 0;
  const eoEstCount = marking?.P17 ?? 0;

  /* Mettre à jour la ref du marking à chaque changement (pour la boucle RAF) */
  useEffect(() => {
    markingRef.current = marking;
  }, [marking]);

  /* Sync véhicules quand les compteurs changent (primitifs en deps) */
  useEffect(() => {
    const target = {
      ns: nsCount,
      nsSud: nsSudCount,
      eo: eoCount,
      eoEst: eoEstCount,
    };
    const prev = prevCountsRef.current;

    /* Aucun changement → ne pas toucher au state */
    if (
      target.ns === prev.ns &&
      target.nsSud === prev.nsSud &&
      target.eo === prev.eo &&
      target.eoEst === prev.eoEst
    ) {
      return;
    }

    if (DEBUG) {
      console.log("[flow] sync", { prev, target });
    }

    setVehicles((list) => {
      const next = [...list];

      for (const dir of Object.keys(target)) {
        const diff = (target[dir] ?? 0) - (prev[dir] ?? 0);
        const cfg = DIRECTIONS[dir];

        if (diff > 0) {
          const dirCars = next.filter((v) => v.dir === dir);
          const backmostDist = dirCars.reduce((acc, v) => {
            return Math.max(acc, distanceToStop(cfg, v.position));
          }, 0);

          for (let i = 0; i < diff; i++) {
            const dist = backmostDist + (i + 1) * (CAR_LENGTH + MIN_GAP);
            const position = cfg.stopLine - cfg.sign * dist;
            next.push({
              id: nextIdRef.current++,
              dir,
              position,
              state: "queue",
            });
          }
        } else if (diff < 0) {
          const queue = next
            .filter((v) => v.dir === dir && v.state === "queue")
            .sort(
              (a, b) =>
                distanceToStop(cfg, a.position) -
                distanceToStop(cfg, b.position),
            );

          const toDispatch = -diff;
          let dispatched = 0;
          for (const v of queue) {
            if (dispatched >= toDispatch) break;
            v.state = "crossing";
            dispatched++;
          }
        }
      }

      return next;
    });

    prevCountsRef.current = target;
  }, [nsCount, nsSudCount, eoCount, eoEstCount]);

  /* Boucle RAF */
  useEffect(() => {
    const loop = (time) => {
      const dt = lastTimeRef.current
        ? Math.min((time - lastTimeRef.current) / 1000, 0.1)
        : 0;
      lastTimeRef.current = time;

      setVehicles((list) => {
        /* Rien à animer → ne pas re-render */
        if (list.length === 0) return list;

        const m = markingRef.current ?? {};
        const byDir = {};
        for (const v of list) {
          if (!byDir[v.dir]) byDir[v.dir] = [];
          byDir[v.dir].push(v);
        }

        const next = [];
        let changed = false;

        for (const dir of Object.keys(byDir)) {
          const cfg = DIRECTIONS[dir];
          const isGreen = (m[cfg.firePlace] ?? 0) > 0;

          const cars = byDir[dir].sort(
            (a, b) =>
              distanceToStop(cfg, a.position) - distanceToStop(cfg, b.position),
          );

          let frontmostPosition = null;

          for (const car of cars) {
            let newPosition = car.position + cfg.sign * SPEED * dt;
            let state = car.state;

            const distToStop = distanceToStop(cfg, newPosition);
            if (state === "queue" && distToStop < 0 && !isGreen) {
              newPosition = cfg.stopLine;
            }

            if (state === "queue" && distanceToStop(cfg, newPosition) < 0) {
              state = "crossing";
            }

            if (frontmostPosition !== null) {
              const minAllowed =
                frontmostPosition - cfg.sign * (CAR_LENGTH + MIN_GAP);
              if (cfg.sign > 0) {
                newPosition = Math.min(newPosition, minAllowed);
              } else {
                newPosition = Math.max(newPosition, minAllowed);
              }
            }

            const pastExit =
              cfg.sign > 0 ? newPosition > cfg.exit : newPosition < cfg.exit;
            if (pastExit) {
              changed = true;
              continue;
            }

            frontmostPosition = newPosition;

            /* Détecter un vrai changement */
            if (newPosition !== car.position || state !== car.state) {
              changed = true;
            }

            next.push({ ...car, position: newPosition, state });
          }
        }

        /* Aucun changement réel → retourner la même liste
           (évite un re-render inutile) */
        if (!changed && areVehiclesEqual(list, next)) {
          return list;
        }

        return next;
      });

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return vehicles;
}

export function getVehicleRenderProps(vehicle) {
  const cfg = DIRECTIONS[vehicle.dir];
  if (!cfg) return null;

  const isX = cfg.axis === "x";
  return {
    x: isX ? vehicle.position : cfg.lane,
    y: isX ? cfg.lane : vehicle.position,
    orientation: cfg.orientation,
    color: cfg.color,
    type: "car",
  };
}
