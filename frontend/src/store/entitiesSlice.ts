import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { api } from '../api'
import type { Client, Project, Area, Product, Quotation, QuoteItem, CutlistItem, MaterialSummary, ProductTemplate, TemplateParam } from '../types'

type EntitiesState = {
  clients: Client[]
  projects: Project[]
  areas: Area[]
  products: Product[]
  templates: ProductTemplate[]
  templateParams: TemplateParam[]
  quotes: Quotation[]
  quoteItems: QuoteItem[]
  cutlist: CutlistItem[]
  material?: MaterialSummary
  loading: boolean
  error?: string
}

const initial: EntitiesState = {
  clients: [],
  projects: [],
  areas: [],
  products: [],
  templates: [],
  templateParams: [],
  quotes: [],
  quoteItems: [],
  cutlist: [],
  loading: false
}

export const loadClients = createAsyncThunk('entities/loadClients', api.listClients)
export const createClient = createAsyncThunk('entities/createClient', api.createClient)
export const updateClient = createAsyncThunk('entities/updateClient', ({id, body}:{id:number, body:any}) => api.updateClient(id, body))
export const deleteClient = createAsyncThunk('entities/deleteClient', (id:number) => api.deleteClient(id))

export const loadProjects = createAsyncThunk('entities/loadProjects', (clientId?:number) => api.listProjects(clientId))
export const createProject = createAsyncThunk('entities/createProject', ({clientId, body}:{clientId:number, body:any}) => api.createProject(clientId, body))
export const updateProject = createAsyncThunk('entities/updateProject', ({id, body}:{id:number, body:any}) => api.updateProject(id, body))

export const loadAreas = createAsyncThunk('entities/loadAreas', (projectId:number) => api.listAreas(projectId))
export const createArea = createAsyncThunk('entities/createArea', ({projectId, body}:{projectId:number, body:any}) => api.createArea(projectId, body))
export const updateArea = createAsyncThunk('entities/updateArea', ({id, body}:{id:number, body:any}) => api.updateArea(id, body))
export const deleteArea = createAsyncThunk('entities/deleteArea', (id:number) => api.deleteArea(id))

export const loadProducts = createAsyncThunk('entities/loadProducts', api.listProducts)
export const createProduct = createAsyncThunk('entities/createProduct', api.createProduct)

export const loadTemplates = createAsyncThunk('entities/loadTemplates', api.getTemplates)
export const loadTemplateParams = createAsyncThunk('entities/loadTemplateParams', (templateId:number) => api.getTemplateParams(templateId))
export const loadProductTemplateParams = createAsyncThunk('entities/loadProductTemplateParams', (productId:number) => api.getProductTemplateParams(productId))

export const loadDraftQuote = createAsyncThunk('entities/loadDraftQuote', (projectId:number) => api.loadDraft(projectId))
export const loadQuotes = createAsyncThunk('entities/loadQuotes', (projectId:number) => api.listQuotes(projectId))
export const loadQuoteItems = createAsyncThunk('entities/loadQuoteItems', (quoteId:number) => api.listQuoteItems(quoteId))

export const addQuoteItem = createAsyncThunk('entities/addQuoteItem',
  ({quoteId, areaId, productId, body}:{quoteId:number, areaId:number, productId:number, body:any}) =>
    api.addQuoteItem(quoteId, areaId, productId, body)
)

export const updateQuoteItem = createAsyncThunk('entities/updateQuoteItem',
  ({itemId, body}:{itemId:number, body:any}) => api.updateQuoteItem(itemId, body)
)

export const deleteQuoteItem = createAsyncThunk('entities/deleteQuoteItem', (itemId:number) => api.deleteQuoteItem(itemId))
export const recalcQuote = createAsyncThunk('entities/recalcQuote', (quoteId:number) => api.recalcQuote(quoteId))
export const submitQuote = createAsyncThunk('entities/submitQuote', (quoteId:number) => api.submitQuote(quoteId))

export const generateCutlist = createAsyncThunk('entities/generateCutlist', (quoteId:number) => api.generateCutlist(quoteId))
export const loadCutlist = createAsyncThunk('entities/loadCutlist', (quoteId:number) => api.listCutlist(quoteId))
export const loadMaterial = createAsyncThunk('entities/loadMaterial', (quoteId:number) => api.materialSummary(quoteId))

const slice = createSlice({
  name: 'entities',
  initialState: initial,
  reducers: {
    clearError(state) { state.error = undefined }
  },
  extraReducers: (b) => {
    const setLoading = (state: EntitiesState, loading: boolean) => { state.loading = loading }
    const setError = (state: EntitiesState, err: any) => { state.error = String(err?.message ?? err ?? 'Unknown error') }


    b.addCase(loadClients.fulfilled, (state, action) => { state.clients = action.payload as any })
    b.addCase(loadProjects.fulfilled, (state, action) => { state.projects = action.payload as any })
    b.addCase(loadAreas.fulfilled, (state, action) => { state.areas = action.payload as any })
    b.addCase(loadProducts.fulfilled, (state, action) => { state.products = action.payload as any })
    b.addCase(loadTemplates.fulfilled, (state, action) => { state.templates = action.payload as any })
    b.addCase(loadTemplateParams.fulfilled, (state, action) => { state.templateParams = action.payload as any })
    b.addCase(loadProductTemplateParams.fulfilled, (state, action) => { state.templateParams = action.payload as any })

    b.addCase(createClient.fulfilled, (state, action) => { state.clients = [action.payload as any, ...state.clients] })
    b.addCase(createProject.fulfilled, (state, action) => { state.projects = [action.payload as any, ...state.projects] })
    b.addCase(createArea.fulfilled, (state, action) => { state.areas = [action.payload as any, ...state.areas] })
    b.addCase(createProduct.fulfilled, (state, action) => { state.products = [action.payload as any, ...state.products] })

    b.addCase(updateClient.fulfilled, (state, action) => {
      const idx = state.clients.findIndex(c => c.id === (action.payload as any).id)
      if (idx >= 0) state.clients[idx] = action.payload as any
    })
    b.addCase(deleteClient.fulfilled, (state, action) => {
      const id = (action.meta.arg as number)
      state.clients = state.clients.filter(c => c.id !== id)
    })
    b.addCase(updateProject.fulfilled, (state, action) => {
      const idx = state.projects.findIndex(p => p.id === (action.payload as any).id)
      if (idx >= 0) state.projects[idx] = action.payload as any
    })
    b.addCase(updateArea.fulfilled, (state, action) => {
      const idx = state.areas.findIndex(a => a.id === (action.payload as any).id)
      if (idx >= 0) state.areas[idx] = action.payload as any
    })
    b.addCase(deleteArea.fulfilled, (state, action) => {
      // action payload might be empty; rely on optimistic filtering from meta arg
      const id = (action.meta.arg as number)
      state.areas = state.areas.filter(a => a.id !== id)
    })

    b.addCase(loadDraftQuote.fulfilled, (state, action) => {
      const q = action.payload as any as Quotation
      // ensure quote list includes it
      const idx = state.quotes.findIndex(x => x.id === q.id)
      if (idx >= 0) state.quotes[idx] = q; else state.quotes = [q, ...state.quotes]
    })
    b.addCase(loadQuotes.fulfilled, (state, action) => { state.quotes = action.payload as any })
    b.addCase(loadQuoteItems.fulfilled, (state, action) => { state.quoteItems = action.payload as any })

    b.addCase(addQuoteItem.fulfilled, (state, action) => { state.quoteItems = [action.payload as any, ...state.quoteItems] })
    b.addCase(updateQuoteItem.fulfilled, (state, action) => {
      const idx = state.quoteItems.findIndex(i => i.id === (action.payload as any).id)
      if (idx >= 0) state.quoteItems[idx] = action.payload as any
    })
    b.addCase(deleteQuoteItem.fulfilled, (state, action) => {
      const id = (action.meta.arg as number)
      state.quoteItems = state.quoteItems.filter(i => i.id !== id)
    })

    b.addCase(recalcQuote.fulfilled, (state, action) => {
      // Update quote total if present
      const { quoteId, totalPrice } = action.payload as any
      const idx = state.quotes.findIndex(q => q.id === quoteId)
      if (idx >= 0) state.quotes[idx] = { ...(state.quotes[idx] as any), totalPrice }
    })
    b.addCase(submitQuote.fulfilled, (state, action) => {
      const q = action.payload as any as Quotation
      const idx = state.quotes.findIndex(x => x.id === q.id)
      if (idx >= 0) state.quotes[idx] = q
    })

    b.addCase(generateCutlist.fulfilled, (state, action) => { state.cutlist = action.payload as any })
    b.addCase(loadCutlist.fulfilled, (state, action) => { state.cutlist = action.payload as any })
    b.addCase(loadMaterial.fulfilled, (state, action) => { state.material = action.payload as any })

    // All addMatcher calls must come AFTER all addCase calls
    b.addMatcher((a) => a.type.startsWith('entities/') && a.type.endsWith('/pending'),
      (state) => { setLoading(state, true); state.error = undefined })

    b.addMatcher((a) => a.type.startsWith('entities/') && a.type.endsWith('/rejected'),
      (state, action: any) => { setLoading(state, false); setError(state, action.error) })

    b.addMatcher((a) => a.type.startsWith('entities/') && a.type.endsWith('/fulfilled'),
      (state) => { setLoading(state, false) })
  }
})

export const { clearError } = slice.actions
export default slice.reducer
