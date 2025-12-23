import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type WizardStep = 'client'|'project'|'areas'|'dimensions'|'quotation'|'cutlist'|'material'

type WizardState = {
  step: WizardStep
  theme: 'light'|'dark'
  selectedClientId?: number
  selectedProjectId?: number
  selectedQuoteId?: number
}

const LS_KEY = 'interior_wizard_state_v1'

function load(): WizardState | null {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || 'null') } catch { return null }
}
function save(state: WizardState) {
  localStorage.setItem(LS_KEY, JSON.stringify(state))
}

const initial: WizardState = load() ?? {
  step: 'client',
  theme: (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light'
}

const slice = createSlice({
  name: 'wizard',
  initialState: initial,
  reducers: {
    setStep(state, action: PayloadAction<WizardStep>) {
      state.step = action.payload; save(state)
    },
    setTheme(state, action: PayloadAction<'light'|'dark'>) {
      state.theme = action.payload; save(state)
    },
    selectClient(state, action: PayloadAction<number | undefined>) {
      state.selectedClientId = action.payload; save(state)
    },
    selectProject(state, action: PayloadAction<number | undefined>) {
      state.selectedProjectId = action.payload; save(state)
    },
    selectQuote(state, action: PayloadAction<number | undefined>) {
      state.selectedQuoteId = action.payload; save(state)
    },
    resetAll() {
      const next: WizardState = { step: 'client', theme: initial.theme }
      save(next)
      return next
    }
  }
})

export const { setStep, setTheme, selectClient, selectProject, selectQuote, resetAll } = slice.actions
export default slice.reducer
