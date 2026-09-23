## Carrefour Intelligent — Réseau de Petri

### Places

| ID | Signification | Jetons initiaux |
|---|---|---|
| P1 | Feu NS vert | 1 |
| P2 | Feu NS orange | 0 |
| P3 | Feu NS rouge | 0 |
| P4 | Feu EO vert | 0 |
| P5 | Feu EO orange | 0 |
| P6 | Feu EO rouge | 1 |
| P7 | File voitures NS (capteur présence) | 0 |
| P8 | File voitures EO (capteur présence) | 0 |
| P9 | Bouton piéton appuyé | 0 |
| P10 | Feu piéton vert | 0 |
| P11 | Véhicule urgence détecté | 0 |
| P12 | Mode urgence actif | 0 |
| P13 | Bus détecté sur voie prioritaire | 0 |
| P14 | Mode bus prioritaire actif | 0 |
| P15 | Compteur de cycles écoulés (timer) | 0 |

### Transitions

| ID | Condition (entrée) | Effet (sortie) |
|---|---|---|
| T1 : NS vert → orange | P1 | P2 |
| T2 : NS orange → rouge | P2 | P3 |
| T3 : EO rouge → vert | P3 + P6 + P8 (présence) | P4 |
| T4 : EO vert → orange | P4 | P5 |
| T5 : EO orange → rouge | P5 | P6 |
| T6 : NS rouge → vert | P6 + P3 + P7 (présence) | P1 |
| T7 : demande piéton | bouton pressé | P9 |
| T8 : piéton vert | P3 + P6 + P9 (tous rouges) | P10 |
| T9 : fin passage piéton | P10 | retour rouges normaux |
| T10 : urgence détectée | P11 | force tout rouge → P12 |
| T11 : fin urgence | P12 | reprise cycle normal |
| T12 : bus détecté | P13 | P14 (voie bus prioritaire) |
| T13 : fin priorité bus | P14 | reprise cycle normal |
| T14 : arrivée voiture NS | — | +1 jeton P7 |
| T15 : arrivée voiture EO | — | +1 jeton P8 |
| T16 : tick timer | — | +1 jeton P15, déclenche changement si N ticks atteints sans condition |

### Logique de priorité hiérarchique
```
Urgence (P12) > Bus prioritaire (P14) > Présence normale (P7/P8) > Timer (P15)
```

### Contraintes affichées dans l'interface

1. **Exclusion mutuelle** — P1 et P4 (NS vert / EO vert) jamais marquées simultanément
2. **Bornage** — chaque place feu (P1–P6, P10) ≤ 1 jeton
3. **Priorité urgence** — P12 actif ⟹ toutes les places feu véhicules = rouge (P3 + P6)
4. **Sécurité piéton** — P10 actif ⟹ P3 et P6 actives obligatoirement
5. **Capteur de présence** — T3/T6 ne se déclenchent que si file correspondante (P7/P8) non vide
6. **Priorité bus** — P14 actif ⟹ voie bus passe au vert dès que possible, sans forcer tout au rouge
7. **Temporisation** — changement automatique après N ticks si aucune condition ne force le changement avant

### Portée globale
~15 places, ~16 transitions — couvre exclusion mutuelle, bornage, priorité hiérarchique, conditions d'activation, et temporisation.
