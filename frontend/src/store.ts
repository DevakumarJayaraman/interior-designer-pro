import { configureStore } from '@reduxjs/toolkit'
import wizardReducer from './store/wizardSlice'
import entitiesReducer from './store/entitiesSlice'

export const store = configureStore({
  reducer: {
    wizard: wizardReducer,
    entities: entitiesReducer,
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
