import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { usePortalData } from '../store/portalData'

const statCards = [
  { label: 'Active Matters', key: 'activeMatters' },
  { label: 'Hearings This Week', key: 'hearingsThisWeek' },
  { label: 'Filings Pending', key: 'filingsPending' },
  { label: 'Team Utilisation', key: 'teamUtilisation', suffix: '%' },
]

const defaultStatForm = {
  activeMatters: '',
  hearingsThisWeek: '',
  filingsPending: '',
  teamUtilisation: '',
}

const defaultTaskForm = {
  title: '',
  owner: '',
  due: '',
}

const defaultTeamForm = {
  name: '',
  role: '',
  phone: '',
  email: '',
}

export default function DashboardPage() {
  const stats = usePortalData((state) => state.data.stats)
  const cases = usePortalData((state) => state.data.cases)
  const tasks = usePortalData((state) => state.data.tasks)
  const team = usePortalData((state) => state.data.team)
  const updateStats = usePortalData((state) => state.updateStats)
  const addTask = usePortalData((state) => state.addTask)
  const removeTask = usePortalData((state) => state.removeTask)
  const addTeamMember = usePortalData((state) => state.addTeamMember)
  const removeTeamMember = usePortalData((state) => state.removeTeamMember)

  const [statForm, setStatForm] = useState(defaultStatForm)
  const [taskForm, setTaskForm] = useState(defaultTaskForm)
  const [teamForm, setTeamForm] = useState(defaultTeamForm)
  const [isSavingStats, setIsSavingStats] = useState(false)
  const [isSavingTask, setIsSavingTask] = useState(false)
  const [isSavingTeam, setIsSavingTeam] = useState(false)
  const [removingTaskId, setRemovingTaskId] = useState(null)
  const [removingTeamId, setRemovingTeamId] = useState(null)

  useEffect(() => {
    setStatForm({
      activeMatters: stats.activeMatters ?? '',
      hearingsThisWeek: stats.hearingsThisWeek ?? '',
      filingsPending: stats.filingsPending ?? '',
      teamUtilisation: stats.teamUtilisation ?? '',
    })
  }, [stats])

  const upcomingCases = useMemo(() => {
    return cases
      .filter((item) => item.nextDate)
      .slice()
      .sort((a, b) => new Date(a.nextDate) - new Date(b.nextDate))
      .slice(0, 5)
  }, [cases])

  const handleStatChange = (event) => {
    const { name, value } = event.target
    setStatForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleStatsSubmit = async (event) => {
    event.preventDefault()
    setIsSavingStats(true)
    try {
      await updateStats({
        activeMatters: Number(statForm.activeMatters) || 0,
        hearingsThisWeek: Number(statForm.hearingsThisWeek) || 0,
        filingsPending: Number(statForm.filingsPending) || 0,
        teamUtilisation: Number(statForm.teamUtilisation) || 0,
      })
    } catch (error) {
      console.error('Failed to update metrics', error)
    } finally {
      setIsSavingStats(false)
    }
  }

  const handleTaskChange = (event) => {
    const { name, value } = event.target
    setTaskForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleTaskSubmit = async (event) => {
    event.preventDefault()
    if (!taskForm.title || !taskForm.owner || !taskForm.due) return
    setIsSavingTask(true)
    try {
      await addTask(taskForm)
      setTaskForm(defaultTaskForm)
    } catch (error) {
      console.error('Failed to add task', error)
    } finally {
      setIsSavingTask(false)
    }
  }

  const handleTeamChange = (event) => {
    const { name, value } = event.target
    setTeamForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleTeamSubmit = async (event) => {
    event.preventDefault()
    if (!teamForm.name || !teamForm.role) return
    setIsSavingTeam(true)
    try {
      await addTeamMember(teamForm)
      setTeamForm(defaultTeamForm)
    } catch (error) {
      console.error('Failed to add team member', error)
    } finally {
      setIsSavingTeam(false)
    }
  }

  const handleTaskRemove = async (id) => {
    setRemovingTaskId(id)
    try {
      await removeTask(id)
    } catch (error) {
      console.error('Failed to remove task', error)
    } finally {
      setRemovingTaskId(null)
    }
  }

  const handleTeamRemove = async (id) => {
    setRemovingTeamId(id)
    try {
      await removeTeamMember(id)
    } catch (error) {
      console.error('Failed to remove team member', error)
    } finally {
      setRemovingTeamId(null)
    }
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <article key={card.key} className="card p-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
              {stats[card.key] ?? 0}
              {card.suffix ?? ''}
            </p>
          </article>
        ))}
      </section>

      <section className="card p-6 space-y-4">
        <header className="space-y-1">
          <h2 className="text-lg font-semibold">Update dashboard metrics</h2>
          <p className="text-sm text-slate-500">
            Keep your core KPIs current so that everyone sees the latest workload snapshot.
          </p>
        </header>
        <form className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" onSubmit={handleStatsSubmit}>
          {statCards.map((card) => (
            <label key={card.key} className="space-y-2 text-sm">
              <span className="block font-medium text-slate-600 dark:text-slate-300">{card.label}</span>
              <input
                type="number"
                name={card.key}
                className="input"
                value={statForm[card.key]}
                onChange={handleStatChange}
                min="0"
              />
            </label>
          ))}
          <div className="md:col-span-2 lg:col-span-4 flex justify-end">
            <button type="submit" className="btn btn-primary" disabled={isSavingStats}>
              {isSavingStats ? 'Saving…' : 'Save metrics'}
            </button>
          </div>
        </form>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className="card p-5 lg:col-span-2 space-y-4">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Priority hearings</h2>
              <p className="text-sm text-slate-500">Add case files with upcoming dates to see them here automatically.</p>
            </div>
          </header>
          <div className="space-y-4">
            {upcomingCases.length === 0 ? (
              <p className="text-sm text-slate-500">No hearings tracked yet. Add matters from the Cases page to populate this list.</p>
            ) : (
              upcomingCases.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-brand-600">{item.caseNumber}</p>
                      <p className="text-base font-medium">{item.client} vs {item.opponent}</p>
                    </div>
                    {item.practiceArea && <span className="badge">{item.practiceArea}</span>}
                  </div>
                  <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-3 text-sm text-slate-600 dark:text-slate-300">
                    <div>
                      <dt className="font-medium text-slate-500">Next hearing</dt>
                      <dd>{dayjs(item.nextDate).format('DD MMM YYYY')}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-slate-500">Courtroom</dt>
                      <dd>{item.courtroom || '—'}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-slate-500">Status</dt>
                      <dd>{item.status || '—'}</dd>
                    </div>
                  </dl>
                  {item.notes && <p className="mt-3 text-sm text-slate-500">{item.notes}</p>}
                </div>
              ))
            )}
          </div>
        </article>

        <aside className="space-y-6">
          <article className="card p-5 space-y-4">
            <h2 className="text-lg font-semibold">Action items</h2>
            <form className="space-y-3" onSubmit={handleTaskSubmit}>
              <div className="space-y-2 text-sm">
                <label className="block font-medium text-slate-600 dark:text-slate-300" htmlFor="task-title">Task</label>
                <input
                  id="task-title"
                  name="title"
                  className="input"
                  value={taskForm.title}
                  onChange={handleTaskChange}
                  placeholder="Draft written submissions"
                  required
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 text-sm">
                <label className="space-y-2">
                  <span className="block font-medium text-slate-600 dark:text-slate-300">Owner</span>
                  <input
                    name="owner"
                    className="input"
                    value={taskForm.owner}
                    onChange={handleTaskChange}
                    placeholder="Responsible team member"
                    required
                  />
                </label>
                <label className="space-y-2">
                  <span className="block font-medium text-slate-600 dark:text-slate-300">Due date</span>
                  <input
                    type="date"
                    name="due"
                    className="input"
                    value={taskForm.due}
                    onChange={handleTaskChange}
                    required
                  />
                </label>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="btn btn-primary" disabled={isSavingTask}>
                  {isSavingTask ? 'Adding…' : 'Add task'}
                </button>
              </div>
            </form>
            <ul className="space-y-3 text-sm">
              {tasks.length === 0 ? (
                <li className="text-slate-500">No action items yet.</li>
              ) : (
                tasks.map((task) => (
                  <li key={task.id} className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{task.title}</p>
                      <p className="text-xs text-slate-500">
                        Owner: {task.owner} • Due {dayjs(task.due).format('DD MMM')}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTaskRemove(task.id)}
                      className="text-xs text-red-500 hover:text-red-600"
                      disabled={removingTaskId === task.id}
                    >
                      {removingTaskId === task.id ? 'Removing…' : 'Remove'}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </article>

          <article className="card p-5 space-y-4">
            <h2 className="text-lg font-semibold">Key contacts</h2>
            <form className="space-y-3" onSubmit={handleTeamSubmit}>
              <div className="grid gap-3 sm:grid-cols-2 text-sm">
                <label className="space-y-2">
                  <span className="block font-medium text-slate-600 dark:text-slate-300">Name</span>
                  <input
                    name="name"
                    className="input"
                    value={teamForm.name}
                    onChange={handleTeamChange}
                    placeholder="Team member"
                    required
                  />
                </label>
                <label className="space-y-2">
                  <span className="block font-medium text-slate-600 dark:text-slate-300">Role</span>
                  <input
                    name="role"
                    className="input"
                    value={teamForm.role}
                    onChange={handleTeamChange}
                    placeholder="Designation"
                    required
                  />
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 text-sm">
                <label className="space-y-2">
                  <span className="block font-medium text-slate-600 dark:text-slate-300">Phone</span>
                  <input
                    name="phone"
                    className="input"
                    value={teamForm.phone}
                    onChange={handleTeamChange}
                    placeholder="Contact number"
                  />
                </label>
                <label className="space-y-2">
                  <span className="block font-medium text-slate-600 dark:text-slate-300">Email</span>
                  <input
                    type="email"
                    name="email"
                    className="input"
                    value={teamForm.email}
                    onChange={handleTeamChange}
                    placeholder="name@firm.com"
                  />
                </label>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="btn btn-primary" disabled={isSavingTeam}>
                  {isSavingTeam ? 'Adding…' : 'Add contact'}
                </button>
              </div>
            </form>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              {team.length === 0 ? (
                <li className="text-slate-500">Add contacts to display them here.</li>
              ) : (
                team.map((member) => (
                  <li
                    key={member.id}
                    className="rounded-xl border border-slate-200/70 dark:border-slate-800/70 p-3 flex justify-between gap-3"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{member.name}</p>
                      <p>{member.role}</p>
                      {member.phone && <p className="text-xs mt-1">{member.phone}</p>}
                      {member.email && <p className="text-xs">{member.email}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTeamRemove(member.id)}
                      className="text-xs text-red-500 hover:text-red-600"
                      disabled={removingTeamId === member.id}
                    >
                      {removingTeamId === member.id ? 'Removing…' : 'Remove'}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </article>
        </aside>
      </section>
    </div>
  )
}
