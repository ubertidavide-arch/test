import { type ProjectState } from '../data/models'

const STORAGE_KEY = 'gatekeeper-project'

export const loadProjectState = (): ProjectState | null => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return null
  }
  try {
    return JSON.parse(raw) as ProjectState
  } catch {
    return null
  }
}

export const saveProjectState = (state: ProjectState): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}
