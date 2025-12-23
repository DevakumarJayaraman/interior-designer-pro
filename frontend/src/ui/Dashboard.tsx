import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { loadClients, loadProjects } from '../store/entitiesSlice'
import { selectClient, selectProject, setStep } from '../store/wizardSlice'

export default function Dashboard() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { clients, projects, quotes, loading } = useAppSelector(s => s.entities)

  useEffect(() => {
    dispatch(loadClients())
    dispatch(loadProjects())
  }, [dispatch])

  // Calculate statistics
  const stats = useMemo(() => {
    const totalClients = clients.length
    const totalProjects = projects.length
    const activeProjects = projects.filter(p => {
      const projectQuotes = quotes.filter(q => q.project.id === p.id)
      return projectQuotes.some(q => q.status === 'DRAFT' || q.status === 'SUBMITTED')
    }).length
    const totalBudget = quotes.reduce((sum, q) => sum + (q.totalPrice || 0), 0)

    return { totalClients, totalProjects, activeProjects, totalBudget }
  }, [clients, projects, quotes])

  // Get recent projects with their quotes
  const projectsWithQuotes = useMemo(() => {
    return projects.map(project => {
      const projectQuotes = quotes.filter(q => q.project.id === project.id)
      const latestQuote = projectQuotes.sort((a, b) => b.versionNo - a.versionNo)[0]
      return { ...project, quote: latestQuote }
    }).sort((a, b) => (b.id || 0) - (a.id || 0))
  }, [projects, quotes])

  const handleProjectClick = (project: any) => {
    dispatch(selectClient(project.client.id))
    dispatch(selectProject(project.id))
    if (project.quote) {
      dispatch(setStep('quotation'))
    } else {
      dispatch(setStep('project'))
    }
    navigate('/workflow')
  }

  const handleClientClick = (clientId: number) => {
    dispatch(selectClient(clientId))
    dispatch(setStep('project'))
    navigate('/workflow')
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'SUBMITTED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'APPROVED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
    }
  }

  const getTimelineStatus = (project: any) => {
    if (!project.timeline) return 'Not Set'
    const today = new Date()
    const timeline = new Date(project.timeline)
    if (timeline < today) return 'Overdue'
    const daysLeft = Math.ceil((timeline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (daysLeft <= 7) return `${daysLeft} days left`
    return project.timeline
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-500">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Overview of your clients, projects, and budgets
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <div className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-1">
            Total Clients
          </div>
          <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.totalClients}</div>
        </div>

        <div className="card p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <div className="text-xs font-semibold uppercase tracking-wide text-green-600 dark:text-green-400 mb-1">
            Total Projects
          </div>
          <div className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.totalProjects}</div>
        </div>

        <div className="card p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <div className="text-xs font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400 mb-1">
            Active Projects
          </div>
          <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">{stats.activeProjects}</div>
        </div>

        <div className="card p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <div className="text-xs font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400 mb-1">
            Total Budget
          </div>
          <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">
            ₹{stats.totalBudget.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects List */}
        <div className="lg:col-span-2">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Projects Overview</h2>
              <button
                className="btn-ghost text-sm"
                onClick={() => navigate('/manage-project')}
              >
                Manage All →
              </button>
            </div>

            {projectsWithQuotes.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <div className="text-4xl mb-2">📋</div>
                <div>No projects yet</div>
                <button
                  className="btn-primary mt-4"
                  onClick={() => {
                    dispatch(setStep('client'))
                    navigate('/workflow')
                  }}
                >
                  Create First Project
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {projectsWithQuotes.slice(0, 6).map(project => (
                  <div
                    key={project.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 hover:border-slate-300 dark:hover:border-slate-700 transition cursor-pointer"
                    onClick={() => handleProjectClick(project)}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <div className="font-semibold">{project.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Client: {project.client.name}
                        </div>
                      </div>
                      {project.quote && (
                        <span className={`chip text-xs ${getStatusColor(project.quote.status)}`}>
                          {project.quote.status || 'No Quote'}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div>
                        <div className="text-slate-500 dark:text-slate-400">Budget</div>
                        <div className="font-semibold">
                          {project.quote
                            ? `₹${(project.quote.totalPrice || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
                            : 'Not Set'
                          }
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500 dark:text-slate-400">Timeline</div>
                        <div className="font-semibold">{getTimelineStatus(project)}</div>
                      </div>
                      <div>
                        <div className="text-slate-500 dark:text-slate-400">Property</div>
                        <div className="font-semibold">{project.propertyType || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-slate-500 dark:text-slate-400">Scope</div>
                        <div className="font-semibold truncate">{project.scope || 'N/A'}</div>
                      </div>
                    </div>

                    {project.siteAddress && (
                      <div className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                        📍 {project.siteAddress}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Clients Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Clients</h2>
              <button
                className="btn-ghost text-sm"
                onClick={() => navigate('/manage-project')}
              >
                View All →
              </button>
            </div>

            {clients.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <div className="text-4xl mb-2">👥</div>
                <div>No clients yet</div>
                <button
                  className="btn-primary mt-4"
                  onClick={() => {
                    dispatch(setStep('client'))
                    navigate('/workflow')
                  }}
                >
                  Add First Client
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {clients.slice(0, 8).map(client => {
                  const clientProjects = projects.filter(p => p.client.id === client.id)
                  return (
                    <div
                      key={client.id}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 hover:bg-slate-50 dark:hover:bg-slate-900 transition cursor-pointer"
                      onClick={() => handleClientClick(client.id)}
                    >
                      <div className="font-semibold text-sm">{client.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        📞 {client.phone}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {clientProjects.length} {clientProjects.length === 1 ? 'project' : 'projects'}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="card p-5 mt-4">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button
                className="btn-primary w-full"
                onClick={() => {
                  dispatch(setStep('client'))
                  navigate('/workflow')
                }}
              >
                + New Client
              </button>
              <button
                className="btn-ghost w-full"
                onClick={() => navigate('/products')}
              >
                📦 Manage Products
              </button>
              <button
                className="btn-ghost w-full"
                onClick={() => navigate('/manage-project')}
              >
                🔍 Search Projects
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

