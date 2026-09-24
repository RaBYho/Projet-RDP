import { useEffect, useRef, useState } from "react";

/**
 * Configuration des 4 directions de circulation.
 * Chaque direction est un axe 1D (x ou y) avec :
 *   - lane      : coordonnée fixe sur l'autre axe
 *   - start     : point d'apparition (off-screen)
 *   - stopLine  : position d'arrêt au feu rouge
 *   - exit      : point de disparition (off-screen)
 *   - sign      : +1 si la coordonnée augmente, -1 sinon
 *   - firePlace : place du Petri qui autorise le passage (vert)
 */
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

const SPEED = 90; // pixels par seconde
const CAR_LENGTH = 34; // longueur d'une voiture (px)
const MIN_GAP = 8; // écart minimum entre 2 voitures

/**
 * Calcule la distance signée d'une position par rapport à la stop line.
 * Positif = encore dans la file. Négatif = déjà traversé.
 */
function distanceToStop(cfg, position) {
  return cfg.sign > 0 ? cfg.stopLine - position : position - cfg.stopLine;
}

/**
 * useVehicleFlow — simulation de circulation côté client.
 *
 * @param {Object} marking - marking_vector du NetworkContext
 * @returns {Array<{id, dir, position, state}>}
 */
export function useVehicleFlow({ marking }) {
  const [vehicles, setVehicles] = useState([]);
  const nextIdRef = useRef(1);
  const prevCountsRef = useRef({ ns: 0, nsSud: 0, eo: 0, eoEst: 0 });
  const markingRef = useRef(marking);
  const rafRef = useRef();
  const lastTimeRef = useRef(0);

  /* Synchronise le ref du marking pour la boucle d'animation */
  useEffect(() => {
    markingRef.current = marking;
  }, [marking]);

  /* -------------------------------------------------------------- */
  /* Sync : ajout / retrait de véhicules quand le marquage change    */
  /* -------------------------------------------------------------- */
  useEffect(() => {
    const target = {
      ns: marking.P7 ?? 0,
      nsSud: marking.P16 ?? 0,
      eo: marking.P8 ?? 0,
      eoEst: marking.P17 ?? 0,
    };
    const prev = prevCountsRef.current;

    setVehicles((list) => {
      const next = [...list];

      for (const dir of Object.keys(target)) {
        const diff = (target[dir] ?? 0) - (prev[dir] ?? 0);
        const cfg = DIRECTIONS[dir];

        if (diff > 0) {
          /* Ajoute des voitures au fond de la file */
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
          /* Passe la voiture de tête en mode 'crossing' */
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
  }, [marking]);

  /* -------------------------------------------------------------- */
  /* Boucle d'animation                                              */
  /* -------------------------------------------------------------- */
  useEffect(() => {
    const loop = (time) => {
      const dt = lastTimeRef.current
        ? Math.min((time - lastTimeRef.current) / 1000, 0.1)
        : 0;
      lastTimeRef.current = time;

      setVehicles((list) => {
        const m = markingRef.current ?? {};
        const byDir = {};
        for (const v of list) {
          if (!byDir[v.dir]) byDir[v.dir] = [];
          byDir[v.dir].push(v);
        }

        const next = [];

        for (const dir of Object.keys(byDir)) {
          const cfg = DIRECTIONS[dir];
          const isGreen = (m[cfg.firePlace] ?? 0) > 0;

          /* Trie : voiture de tête en premier */
          const cars = byDir[dir].sort(
            (a, b) =>
              distanceToStop(cfg, a.position) - distanceToStop(cfg, b.position),
          );

          let frontmostPosition = null;

          for (const car of cars) {
            let newPosition = car.position + cfg.sign * SPEED * dt;
            let state = car.state;

            /* Empêche de franchir la stop line si rouge */
            const distToStop = distanceToStop(cfg, newPosition);
            if (state === "queue" && distToStop < 0 && !isGreen) {
              newPosition = cfg.stopLine;
            }

            /* Bascule en 'crossing' dès qu'elle franchit la stop line */
            if (state === "queue" && distanceToStop(cfg, newPosition) < 0) {
              state = "crossing";
            }

            /* Respecte l'écart minimum avec la voiture de devant */
            if (frontmostPosition !== null) {
              const minAllowed =
                frontmostPosition - cfg.sign * (CAR_LENGTH + MIN_GAP);
              if (cfg.sign > 0) {
                newPosition = Math.min(newPosition, minAllowed);
              } else {
                newPosition = Math.max(newPosition, minAllowed);
              }
            }

            /* Sortie de scène → suppression */
            const pastExit =
              cfg.sign > 0 ? newPosition > cfg.exit : newPosition < cfg.exit;
            if (pastExit) continue;

            frontmostPosition = newPosition;
            next.push({ ...car, position: newPosition, state });
          }
        }

        return next;
      });

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return vehicles;
}

/**
 * Convertit un véhicule en props pour le composant <Vehicle>.
 */
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
