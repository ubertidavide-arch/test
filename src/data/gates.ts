import { type GateStatus, type ProjectState } from './models'

export type GateDefinition = {
  id: string
  step: number
  title: string
  owner: string
  checklist: string[]
}

export const gateDefinitions: GateDefinition[] = [
  {
    id: 'gate-0',
    step: 0,
    title: 'Impostazione iniziale',
    owner: 'Davide',
    checklist: [
      'Obiettivo del progetto scritto',
      'Vincoli dichiarati (budget/tempo/tecnici)',
      'Fuori scope esplicitato',
    ],
  },
  {
    id: 'gate-1',
    step: 1,
    title: 'Analisi di fattibilità',
    owner: 'Andrea',
    checklist: ['Fattibilità tecnica chiara', 'Complessità stimabile (anche a range)'],
  },
  {
    id: 'gate-2',
    step: 2,
    title: 'Definizione tecnica',
    owner: 'Andrea + Yuri + Fede',
    checklist: [
      'Requisiti funzionali scritti',
      'Scope definito',
      'Architettura tecnica decisa',
    ],
  },
  {
    id: 'gate-3',
    step: 3,
    title: 'Allineamento finale',
    owner: 'Davide',
    checklist: [
      'Figma condiviso e approvato',
      'Flussi principali validati',
      'Backlog minimo definito',
    ],
  },
]

export const createInitialProjectState = (): ProjectState => ({
  gates: gateDefinitions.map((gate) => ({
    id: gate.id,
    title: gate.title,
    owner: gate.owner,
    items: gate.checklist.map((label, index) => ({
      id: `${gate.id}-item-${index}`,
      label,
      checked: null,
    })),
  })),
  overrides: [],
})

export const canEditGate = (
  index: number,
  gates: { status: GateStatus }[],
): boolean => {
  if (index === 0) {
    return true
  }
  return gates[index - 1]?.status === 'PASS'
}
