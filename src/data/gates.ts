export type GateStatus = 'INCOMPLETE' | 'PASS' | 'FAIL'

export type ChecklistItem = {
  id: string
  label: string
  checked: boolean | null
}

export type GateDefinition = {
  id: string
  step: number
  title: string
  owner: string
  checklist: string[]
}

export type GateState = {
  id: string
  title: string
  owner: string
  items: ChecklistItem[]
}

export type OverrideEntry = {
  id: string
  gateId: string
  by: string
  note: string
  at: string
}

export type ProjectState = {
  gates: GateState[]
  overrides: OverrideEntry[]
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

export const getGateStatus = (items: ChecklistItem[]): GateStatus => {
  if (items.some((item) => item.checked === null)) {
    return 'INCOMPLETE'
  }
  if (items.every((item) => item.checked === true)) {
    return 'PASS'
  }
  return 'FAIL'
}

export const canEditGate = (
  index: number,
  gates: { status: GateStatus }[],
): boolean => {
  if (index === 0) {
    return true
  }
  return gates[index - 1]?.status === 'PASS'
}
