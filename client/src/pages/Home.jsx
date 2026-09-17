import { ArrowRight, BookOpenText, CheckSquare, Sparkles, Timer, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'

const QUICK_LINKS = [
  { title: 'Tasks', description: 'Manage your today list and priorities.', to: '/tasks', icon: CheckSquare },
  { title: 'Planner', description: 'Build your next exam-focused study plan.', to: '/planner', icon: Sparkles },
  { title: 'Focus', description: 'Start a timed deep work sprint.', to: '/focus', icon: Timer },
  { title: 'Notes', description: 'Capture ideas and revision summaries.', to: '/notes', icon: BookOpenText },
  { title: 'Study Rooms', description: 'Collaborate with classmates in real time.', to: '/study-room', icon: UsersRound },
]

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <section className="rounded-3xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 p-6 text-white shadow-lg shadow-brand-500/20 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/75">Your focus dashboard</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">FocusRoom</h1>
              <p className="mt-3 text-base text-white/80 sm:text-lg">
                Everything you need to plan, focus, study, and keep momentum in one calm workspace.
              </p>
            </div>
            <Link
              to="/planner"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-brand-700 transition hover:bg-brand-50"
            >
              Build my plan
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {QUICK_LINKS.map(({ title, description, to, icon: Icon }) => (
            <Link key={title} to={to} className="block h-full">
              <Card className="h-full transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md dark:hover:border-brand-500/40">
                <div className="flex h-full flex-col justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">{title}</h2>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{description}</p>
                  </div>
                  <div className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 dark:text-brand-300">
                    Open section
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </section>
      </div>
    </main>
  )
}
