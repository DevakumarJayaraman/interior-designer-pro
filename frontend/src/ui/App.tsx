import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './Layout'
import Dashboard from './Dashboard'
import Wizard from './Wizard'
import ProductCatalog from './ProductCatalog'
import ManageProject from './ManageProject'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setTheme } from '../store/wizardSlice'

export default function App() {
  const theme = useAppSelector(s => s.wizard.theme)
  const dispatch = useAppDispatch()

  // apply theme to <html class="dark">
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
  }, [theme])

  // ensure theme is set once (for persistence)
  useEffect(() => { dispatch(setTheme(theme)) }, [])

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/workflow" element={<Wizard />} />
        <Route path="/products" element={<ProductCatalog />} />
        <Route path="/manage-project" element={<ManageProject />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
