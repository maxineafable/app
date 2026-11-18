import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router'

import {
  Plus,
  Search,
  ChevronRight,
  ArrowUpDown,
  Dumbbell,
} from "lucide-react";

export const Route = createFileRoute('/')({
  component: Index,
})

export interface Exercise {
  id: number;
  name: string;
  note: string | null;
  sets: number;
  reps: number;
  weight: number;
  weightUnit: number;
}

export interface Workout {
  id: number;
  title: string;
  note: string | null;
  date: string;
  createdAt: string;
  exercises: Exercise[];
}

function Index() {
  const { data, isPending, error } = useQuery<Workout[]>({
    queryKey: ['workouts'],
    queryFn: async () => {
      const res = await fetch('http://localhost:5044/workouts', {
        credentials: 'include',
      })
      
      if (!res.ok)
        throw new Error("failed to fetch workouts");

      return res.json() as Promise<Workout[]>
    }
  })

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-md flex-col">
        {/* Header */}
        <header className="border-b border-slate-100 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-full bg-pink-400 font-semibold text-pink-950">
                P
              </div>

              <div>
                <h1 className="text-xl font-bold leading-tight">Workouts</h1>
                <p className="text-xs text-slate-600">
                  18 sessions logged this month
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <Search size={19} className="shrink-0 text-slate-600" />
            <input
              type="text"
              placeholder="Search workout title (e.g. Chest, Legs)..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
            />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 space-y-6 p-5 pb-28">
          {/* Start Workout */}
          <Link
            to="/"
            className="flex items-center gap-3 rounded-2xl bg-pink-400 p-4 transition hover:bg-pink-500"
          >
            <div className="flex size-10 shrink-0 items-center justify-center bg-white rounded-full">
              <Plus className='stroke-pink-500' />
            </div>

            <div className="flex-1">
              <h2 className="font-semibold text-white">Start New Workout</h2>
              <p className="text-xs text-pink-200">
                Choose routine or log an empty session
              </p>
            </div>

            <ChevronRight className='stroke-white' />
          </Link>

          {/* Previous Workouts */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="font-bold">Previous Workouts</h2>
                <p className="text-xs text-slate-600">
                  Showing 2 sessions sorted by latest
                </p>
              </div>

              <button className="flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
                <ArrowUpDown size={14} />
                Latest
              </button>
            </div>

            <div className="space-y-3">
              {data?.map((workout) => (
                <article
                  key={workout.id}
                  className="rounded-2xl border border-slate-200 p-4 shadow-sm"
                >
                  <div className="mb-3">
                    <h3 className="text-[15px] font-bold">
                      {workout.title}
                    </h3>
                    <p className="text-xs text-slate-600">
                      {workout.date}
                    </p>
                  </div>

                  {/* Exercises */}
                  <div className="border border-slate-200 bg-slate-50/50 px-3">
                    {workout.exercises.map((exercise, index) => (
                      <div
                        key={exercise.name}
                        className={`flex items-center justify-between gap-2 py-2.5 text-sm ${index !== workout.exercises.length - 1
                          ? "border-b border-slate-200"
                          : ""
                          }`}
                      >
                        <span className="min-w-0 truncate font-semibold">
                          {exercise.name}
                        </span>

                        <span className="shrink-0 font-mono text-xs text-slate-600">
                          {exercise.sets} sets · {exercise.weight} {exercise.weightUnit === 0 ? "kg" : "lb"}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-slate-600">
                      {workout.exercises.length} exercises
                    </span>

                    <Link
                      to="/"
                      params={{ workoutId: String(workout.id) }}
                      className="font-semibold text-pink-700 hover:text-pink-900"
                    >
                      View details
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-md px-5 pb-5">
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-2 shadow-lg">
            <Link
              to="/"
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-pink-50 py-2.5 text-sm font-medium hover:bg-pink-100 text-pink-800"
            >
              <Dumbbell />
              Workouts
            </Link>

            <Link
              to="/"
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-pink-400 py-2.5 text-sm font-medium text-pink-50 hover:bg-pink-500"
            >
              <Plus />
              Log
            </Link>
          </div>
        </nav>
      </div>
    </div>
  )
}