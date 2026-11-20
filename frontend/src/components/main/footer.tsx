import { Link } from '@tanstack/react-router'
import { Dumbbell, Plus } from 'lucide-react'

export default function Footer() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-md px-5 pb-5">
      <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white p-2 shadow-lg">
        <Link
          to="/"
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-pink-50 py-2.5 text-sm font-medium hover:bg-pink-100 text-pink-800"
        >
          <Dumbbell />
          Workouts
        </Link>

        <Link
          to="/workouts/new"
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-pink-400 py-2.5 text-sm font-medium text-pink-50 hover:bg-pink-500"
        >
          <Plus />
          Log
        </Link>
      </div>
    </nav>
  )
}
