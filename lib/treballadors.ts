import { Treballador } from "@/types"

export const TREBALLADORS: Treballador[] = [
  { id: "1.1", nom: "Mohamed", cognoms: "Ouhtaj",  rol: "conductor_camio" },
  { id: "1.2", nom: "Samer",   cognoms: "Ali",     rol: "fix_satellit1"  },
  { id: "1.3", nom: "Fredi",   cognoms: "",         rol: "operari"        },
  { id: "1.4", nom: "Karim",   cognoms: "",         rol: "operari"        },
  { id: "1.5", nom: "Mamadou", cognoms: "",         rol: "conductor_camio"},
  { id: "1.6", nom: "Mourad",  cognoms: "",         rol: "operari"        },
  { id: "1.7", nom: "Koke",    cognoms: "",         rol: "operari"        },
  { id: "1.8", nom: "Mimoun",  cognoms: "",         rol: "operari"        },
]

export const NOMS_TREBALLADORS = TREBALLADORS.map(t => t.nom)

function rangeDies(any: number, mes: number, ini: number, fi: number): string[] {
  const dies: string[] = []
  for (let d = ini; d <= fi; d++) {
    const data = new Date(any, mes - 1, d)
    if (data.getMonth() === mes - 1) {
      dies.push(`${any}-${String(mes).padStart(2, "0")}-${String(d).padStart(2, "0")}`)
    }
  }
  return dies
}

// ⚠️ PER_CONFIRMAR — el Francesc ha de verificar tots els períodes marcats
export const VACANCES_2026: Record<string, string[]> = {
  Mohamed: [
    // Agost: 3-31
    ...rangeDies(2026, 8, 3, 31),
    // Setembre: 1-2
    ...rangeDies(2026, 9, 1, 2),
  ],
  Samer: [
    // Juliol: 10-12, 20-21, 24-26
    // ⚠️ PER_CONFIRMAR: possible que hi hagi més dies
    ...rangeDies(2026, 7, 10, 12),
    ...rangeDies(2026, 7, 20, 21),
    ...rangeDies(2026, 7, 24, 26),
  ],
  Fredi: [
    // Abril: 6-10
    ...rangeDies(2026, 4, 6, 10),
    // Juliol: 15, 22
    ...rangeDies(2026, 7, 15, 15),
    ...rangeDies(2026, 7, 22, 22),
    // Agost: 13-14
    ...rangeDies(2026, 8, 13, 14),
    // Octubre: 5-8, 19-20
    // ⚠️ PER_CONFIRMAR: verificar total dies i períodes
    ...rangeDies(2026, 10, 5, 8),
    ...rangeDies(2026, 10, 19, 20),
  ],
  Karim: [
    // Octubre: 5-25
    // ⚠️ PER_CONFIRMAR: té "Lactància/Baixa potanitat" — verificar jornada reduïda
    ...rangeDies(2026, 10, 5, 25),
  ],
  Mamadou: [
    // Juny: 1-5
    ...rangeDies(2026, 6, 1, 5),
    // Setembre: 4, 8-9, 11-13
    // ⚠️ PER_CONFIRMAR: dies exactes
    ...rangeDies(2026, 9, 4, 4),
    ...rangeDies(2026, 9, 8, 9),
    ...rangeDies(2026, 9, 11, 13),
    // Desembre: 1-2, 7-11
    // ⚠️ PER_CONFIRMAR: dies exactes
    ...rangeDies(2026, 12, 1, 2),
    ...rangeDies(2026, 12, 7, 11),
  ],
  Mourad: [
    // Març: 9-20
    ...rangeDies(2026, 3, 9, 20),
    // Juny: 12, 16-19, 23, 25-27, 29-30
    // ⚠️ PER_CONFIRMAR: dies exactes
    ...rangeDies(2026, 6, 12, 12),
    ...rangeDies(2026, 6, 16, 19),
    ...rangeDies(2026, 6, 23, 23),
    ...rangeDies(2026, 6, 25, 27),
    ...rangeDies(2026, 6, 29, 30),
  ],
  Koke: [
    // Juny: 1-21
    // ⚠️ PER_CONFIRMAR: sembla molt extens, verificar
    ...rangeDies(2026, 6, 1, 21),
    // Setembre: 15-20
    ...rangeDies(2026, 9, 15, 20),
  ],
  Mimoun: [
    // Juliol: tot el mes (22 dies laborables)
    // ⚠️ PER_CONFIRMAR: dies exactes
    ...rangeDies(2026, 7, 1, 31),
  ],
}

export function getVacancesDelMes(mes: number, any: number): Record<string, string[]> {
  const prefix = `${any}-${String(mes).padStart(2, "0")}-`
  const resultat: Record<string, string[]> = {}
  for (const [nom, dies] of Object.entries(VACANCES_2026)) {
    const diesDelMes = dies.filter(d => d.startsWith(prefix))
    if (diesDelMes.length > 0) {
      resultat[nom] = diesDelMes
    }
  }
  return resultat
}

export function estaDeVacances(nom: string, data: string): boolean {
  return (VACANCES_2026[nom] ?? []).includes(data)
}
