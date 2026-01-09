import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { type GateStatus, type ProjectState, getGateStatus } from './data/models'
import { canEditGate, createInitialProjectState, gateDefinitions } from './data/gates'
import { loadProjectState, saveProjectState } from './utils/storage'

type OverrideFormState = {
  gateId: string
  by: string
  note: string
}

function statusLabel(status: GateStatus) {
  switch (status) {
    case 'PASS':
      return 'PASS'
    case 'FAIL':
      return 'FAIL'
    default:
      return 'INCOMPLETO'
  }
}

function statusClass(status: GateStatus) {
  switch (status) {
    case 'PASS':
      return 'status-pass'
    case 'FAIL':
      return 'status-fail'
    default:
      return 'status-incomplete'
  }
}

function Checkbox({
  checked,
  disabled,
  label,
  onToggle,
}: {
  checked: boolean | null
  disabled?: boolean
  label: string
  onToggle: () => void
}) {
  const ref = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = checked === null
    }
  }, [checked])

  return (
    <label className={`check-item ${disabled ? 'disabled' : ''}`}>
      <input
        ref={ref}
        type="checkbox"
        checked={checked === true}
        disabled={disabled}
        aria-label={label}
        onChange={onToggle}
      />
      <span>{label}</span>
      {checked === null && <em className="check-hint">Non valorizzato</em>}
    </label>
  )
}

function App() {
  const [project, setProject] = useState<ProjectState>(() =>
    loadProjectState() ?? createInitialProjectState(),
  )
  const [importError, setImportError] = useState<string | null>(null)
  const [overrideForm, setOverrideForm] = useState<OverrideFormState>(() => ({
    gateId: gateDefinitions[0].id,
    by: '',
    note: '',
  }))

  useEffect(() => {
    saveProjectState(project)
  }, [project])

  const gatesWithStatus = useMemo(
    () =>
      project.gates.map((gate) => ({
        ...gate,
        status: getGateStatus(gate.items),
      })),
    [project.gates],
  )

  const canRegisterOverride =
    overrideForm.by.trim() === 'Filippo' && overrideForm.note.trim().length > 0

  const updateChecklist = (gateId: string, itemId: string) => {
    setProject((prev) => ({
      ...prev,
      gates: prev.gates.map((gate) => {
        if (gate.id !== gateId) {
          return gate
        }
        return {
          ...gate,
          items: gate.items.map((item) => {
            if (item.id !== itemId) {
              return item
            }
            if (item.checked === null) {
              return { ...item, checked: true }
            }
            return { ...item, checked: !item.checked }
          }),
        }
      }),
    }))
  }

  const handleExport = () => {
    const data = JSON.stringify(project, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'gate-progetto.json'
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const handleImport = async (file: File | null) => {
    if (!file) {
      return
    }
    try {
      const text = await file.text()
      const parsed = JSON.parse(text) as ProjectState
      if (!parsed || !Array.isArray(parsed.gates)) {
        throw new Error('Formato non valido')
      }
      setProject({
        gates: parsed.gates,
        overrides: Array.isArray(parsed.overrides) ? parsed.overrides : [],
      })
      setImportError(null)
    } catch (error) {
      setImportError(
        error instanceof Error ? error.message : 'Errore durante l’import',
      )
    }
  }

  const registerOverride = () => {
    if (!canRegisterOverride) {
      return
    }
    setProject((prev) => ({
      ...prev,
      overrides: [
        ...prev.overrides,
        {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          gateId: overrideForm.gateId,
          by: overrideForm.by.trim(),
          note: overrideForm.note.trim(),
          at: new Date().toISOString(),
        },
      ],
    }))
    setOverrideForm((prev) => ({ ...prev, note: '' }))
  }

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <p className="eyebrow">Gate di progetto 0→3</p>
          <h1>Gatekeeper</h1>
          <p className="subtitle">
            Checklist, stati e override per garantire che ogni gate venga chiuso
            in modo ordinato.
          </p>
        </div>
        <div className="export-card">
          <h2>Export / Import</h2>
          <p className="muted">
            Salva e condividi il progetto con un file JSON (localStorage).
          </p>
          <div className="export-actions">
            <button type="button" onClick={handleExport}>
              Scarica JSON
            </button>
            <label className="file-input">
              Carica JSON
              <input
                type="file"
                accept="application/json"
                onChange={(event) =>
                  void handleImport(event.currentTarget.files?.[0] ?? null)
                }
              />
            </label>
          </div>
          {importError && <p className="error">{importError}</p>}
        </div>
      </header>

      <main className="gates">
        {gatesWithStatus.map((gate, index) => {
          const editable = canEditGate(index, gatesWithStatus)
          return (
            <section key={gate.id} className="gate-card">
              <div className="gate-header">
                <div>
                  <p className="gate-title">Gate {gateDefinitions[index].step}</p>
                  <h2>{gate.title}</h2>
                  <p className="owner">Owner: {gate.owner}</p>
                </div>
                <span className={`status ${statusClass(gate.status)}`}>
                  {statusLabel(gate.status)}
                </span>
              </div>
              {!editable && (
                <p className="blocked">
                  Bloccato: il gate precedente deve essere PASS.
                </p>
              )}
              <div className="checklist">
                {gate.items.map((item) => (
                  <Checkbox
                    key={item.id}
                    checked={item.checked}
                    label={item.label}
                    disabled={!editable}
                    onToggle={() => updateChecklist(gate.id, item.id)}
                  />
                ))}
              </div>
            </section>
          )
        })}
      </main>

      <section className="override-section">
        <div className="override-card">
          <h2>Override Direzione</h2>
          <p className="muted">
            Solo Filippo può registrare un override. Ogni override richiede una
            traccia scritta (link o testo).
          </p>
          <div className="override-form">
            <label>
              Gate
              <select
                value={overrideForm.gateId}
                onChange={(event) =>
                  setOverrideForm((prev) => ({
                    ...prev,
                    gateId: event.target.value,
                  }))
                }
              >
                {gateDefinitions.map((gate) => (
                  <option key={gate.id} value={gate.id}>
                    Gate {gate.step} - {gate.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Nome (solo Filippo)
              <input
                type="text"
                value={overrideForm.by}
                onChange={(event) =>
                  setOverrideForm((prev) => ({
                    ...prev,
                    by: event.target.value,
                  }))
                }
                placeholder="Filippo"
              />
            </label>
            <label>
              Traccia scritta (link o testo)
              <textarea
                rows={3}
                value={overrideForm.note}
                onChange={(event) =>
                  setOverrideForm((prev) => ({
                    ...prev,
                    note: event.target.value,
                  }))
                }
                placeholder="Inserisci link o note di approvazione"
              />
            </label>
            <button
              type="button"
              onClick={registerOverride}
              disabled={!canRegisterOverride}
            >
              Registra override
            </button>
            {!canRegisterOverride && (
              <p className="muted">
                Inserisci “Filippo” e una traccia scritta per abilitare.
              </p>
            )}
          </div>
        </div>

        <div className="override-log">
          <h3>Log override</h3>
          {project.overrides.length === 0 ? (
            <p className="muted">Nessun override registrato.</p>
          ) : (
            <ul>
              {project.overrides.map((entry) => {
                const gate = gateDefinitions.find(
                  (definition) => definition.id === entry.gateId,
                )
                return (
                  <li key={entry.id}>
                    <div>
                      <strong>
                        Gate {gate?.step} - {gate?.title}
                      </strong>
                      <span className="muted">
                        {' '}
                        · {new Date(entry.at).toLocaleString('it-IT')}
                      </span>
                    </div>
                    <div>
                      <span className="tag">Direzione: {entry.by}</span>
                    </div>
                    <p>{entry.note}</p>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}

export default App
