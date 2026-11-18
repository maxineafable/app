import { meQuery } from '@/lib/query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link, Navigate, useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';

import {
  ArrowLeft,
  Calendar,
  ListPlus,
  Dumbbell,
  PlusCircle,
  Check,
  Trash2,
} from "lucide-react";

export const Route = createFileRoute('/workouts/$workoutId/edit')({
  component: RouteComponent,
});

const WeightUnit = {
  Kg: 0,
  Lb: 1,
} as const;
type WeightUnit = (typeof WeightUnit)[keyof typeof WeightUnit];

const weightUnitLabels: Record<WeightUnit, string> = {
  [WeightUnit.Kg]: "kg",
  [WeightUnit.Lb]: "lb",
};

type Exercise = {
  id: number;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  weightUnit: WeightUnit;
  note: string | null;
};

type Workout = {
  title: string;
  date: string;
  note: string | null;
  exercises: Exercise[];
};

function RouteComponent() {
  const { workoutId } = Route.useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const me = useQuery(meQuery);

  const [workout, setWorkout] = useState<Workout>({
    title: '',
    date: '',
    note: null,
    exercises: [],
  });

  // Fetch existing workout
  const workoutQuery = useQuery({
    queryKey: ['workout', workoutId],
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const res = await fetch(`http://localhost:5044/workouts/${workoutId}`, {
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Error fetching workout');
      }

      return res.json() as Promise<Workout>;
    },
  });

  // Populate form after workout is fetched
  useEffect(() => {
    if (workoutQuery.data) {
      setWorkout(workoutQuery.data);
    }
  }, [workoutQuery.data]);

  // Update workout
  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: workout.title,
        note: workout.note,
        date: workout.date,
        exercises: workout.exercises.map(e => ({
          ...e,
          id: e.id > 0 ? e.id : undefined, // new ones get no id
        })),
      };

      console.log('payload', payload)

      const res = await fetch(`http://localhost:5044/workouts/${workoutId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Error updating workout');
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['workouts'] });
      await queryClient.invalidateQueries({ queryKey: ['workout', workoutId] });

      navigate({ to: '/' });
    },
  });

  const updateWorkout = (
    field: keyof Omit<Workout, 'exercises'>,
    value: string
  ) => {
    setWorkout((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateExercise = (
    id: number,
    field: keyof Exercise,
    value: string | number
  ) => {
    setWorkout((prev) => ({
      ...prev,
      exercises: prev.exercises.map((exercise) =>
        exercise.id === id
          ? { ...exercise, [field]: value }
          : exercise
      ),
    }));
  };

  const nextTempId = useRef(-1);

  const addExercise = () => {
    setWorkout((prev) => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        {
          id: nextTempId.current--,
          name: '',
          sets: 0,
          reps: 0,
          weight: 0,
          weightUnit: WeightUnit.Kg,
          note: null,
        },
      ],
    }));
  };

  const removeExercise = (id: number) => {
    setWorkout((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((exercise) => exercise.id !== id),
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate();
    navigate({ to: '/' })
  };

  if (me.isPending || workoutQuery.isPending) {
    return <div>Loading...</div>;
  }

  if (!me.data) {
    return <Navigate to="/login" />;
  }

  if (workoutQuery.isError) {
    return <div>Unable to load workout.</div>;
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-md flex-col">

        {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-slate-600">
              <ArrowLeft size={21} />
            </Link>
            <h1 className="font-bold">Log Workout</h1>
          </div>

          <Link
            to="/"
            className="text-xs font-medium text-slate-600"
          >
            Cancel
          </Link>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col">

          {/* Form Content */}
          <main className="flex-1 space-y-6 p-5 pb-8">

            {/* Workout Information */}
            <section className="rounded-2xl border border-slate-200 p-4">
              <div className="mb-4 flex items-center gap-2 border-b border-slate-200 pb-3">
                <div className="flex size-7 items-center justify-center rounded-lg bg-pink-50 text-pink-700">
                  <ListPlus size={17} />
                </div>
                <h2 className="text-sm font-bold">Workout Info</h2>
              </div>

              <div className="space-y-4">

                {/* Title */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium">
                    Workout Title <span className="text-rose-600">*</span>
                  </label>

                  <input
                    type="text"
                    value={workout.title}
                    onChange={(e) => updateWorkout("title", e.target.value)}
                    placeholder="e.g. Chest & Triceps Focus"
                    required
                    className="w-full border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-pink-400"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium">
                    Date <span className="text-rose-600">*</span>
                  </label>

                  <div className="flex items-center gap-3 border border-slate-200 bg-slate-50 px-3 py-2.5">
                    <Calendar size={18} className="text-slate-600" />

                    <input
                      type="date"
                      value={workout.date}
                      onChange={(e) => updateWorkout("date", e.target.value)}
                      required
                      className="w-full bg-transparent text-sm outline-none"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <div className="mb-1.5 flex justify-between">
                    <label className="text-xs font-medium">
                      Workout Notes
                    </label>
                    <span className="text-xs text-slate-500">Optional</span>
                  </div>

                  <textarea
                    value={workout.note ?? ''}
                    onChange={(e) => updateWorkout("note", e.target.value)}
                    placeholder="Add some notes about your workout..."
                    rows={2}
                    className="w-full resize-none border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-pink-400"
                  />
                </div>

              </div>
            </section>

            {/* Exercises */}
            <section>
              <div className="mb-3">
                <h2 className="text-sm font-bold">Exercises</h2>
                <p className="text-xs text-slate-500">
                  {workout.exercises.length}{" "}
                  {workout.exercises.length === 1 ? "exercise" : "exercises"} added
                </p>
              </div>

              <div className="space-y-3">

                {workout.exercises.map((exercise, index) => (
                  <div
                    key={exercise.id}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    {/* Exercise Header */}
                    <div className="mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">
                      <span className="flex size-6 items-center justify-center rounded-full bg-pink-50 text-xs font-semibold text-pink-800">
                        {index + 1}
                      </span>

                      <h3 className="text-sm font-semibold">
                        Exercise details
                      </h3>

                      <button
                        type="button"
                        onClick={() => removeExercise(exercise.id)}
                        className="ml-auto text-slate-400 hover:text-red-600"
                        title="Remove exercise"
                        disabled={workout.exercises.length === 1}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>

                    <div className="space-y-4">

                      {/* Exercise Name */}
                      <div>
                        <label className="mb-1.5 block text-xs font-medium">
                          Exercise Name <span className="text-rose-600">*</span>
                        </label>

                        <div className="flex items-center gap-2 border border-slate-200 bg-slate-50 px-3 py-2.5">
                          <Dumbbell size={18} className="text-slate-600" />

                          <input
                            type="text"
                            value={exercise.name}
                            onChange={(e) =>
                              updateExercise(exercise.id, "name", e.target.value)
                            }
                            placeholder="e.g. Barbell Bench Press"
                            required
                            className="w-full bg-transparent text-sm outline-none"
                          />
                        </div>
                      </div>

                      {/* Sets, Reps, Weight */}
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="mb-1.5 block text-xs font-medium">
                            Sets
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={exercise.sets || ""}
                            onChange={(e) =>
                              updateExercise(
                                exercise.id,
                                "sets",
                                e.target.valueAsNumber
                              )
                            }
                            placeholder="0"
                            required
                            className="w-full border border-slate-200 bg-slate-50 px-2 py-2.5 text-center text-sm font-semibold outline-none"
                          />
                        </div>

                        <div>
                          <label className="mb-1.5 block text-xs font-medium">
                            Reps
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={exercise.reps || ""}
                            onChange={(e) =>
                              updateExercise(
                                exercise.id,
                                "reps",
                                e.target.valueAsNumber
                              )
                            }
                            placeholder="0"
                            required
                            className="w-full border border-slate-200 bg-slate-50 px-2 py-2.5 text-center text-sm font-semibold outline-none"
                          />
                        </div>

                        <div>
                          <label className="mb-1.5 block text-xs font-medium">
                            Weight
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={exercise.weight || ""}
                            onChange={(e) =>
                              updateExercise(
                                exercise.id,
                                "weight",
                                e.target.valueAsNumber
                              )
                            }
                            placeholder="0"
                            required
                            className="w-full border border-slate-200 bg-slate-50 px-2 py-2.5 text-center text-sm font-semibold outline-none"
                          />
                        </div>
                      </div>

                      {/* Weight Unit */}
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium">
                          Weight Unit
                        </label>

                        <div className="flex rounded-full border border-slate-200 bg-slate-50 p-0.5">
                          {([WeightUnit.Kg, WeightUnit.Lb] as const).map((unit) => (
                            <button
                              key={unit}
                              type="button"
                              onClick={() => updateExercise(exercise.id, "weightUnit", unit)}
                              className={`rounded-full px-4 py-1 text-xs font-semibold ${exercise.weightUnit === unit
                                ? "bg-pink-400 text-pink-950"
                                : "text-slate-600"
                                }`}
                            >
                              {weightUnitLabels[unit]}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Exercise Notes */}
                      <div>
                        <div className="mb-1.5 flex justify-between">
                          <label className="text-xs font-medium">
                            Exercise Note
                          </label>
                          <span className="text-xs text-slate-500">
                            Optional
                          </span>
                        </div>

                        <input
                          type="text"
                          value={exercise.note ?? ''}
                          onChange={(e) =>
                            updateExercise(exercise.id, "note", e.target.value)
                          }
                          placeholder="e.g. Pause on chest 1s, RPE 8.5"
                          className="w-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-pink-400"
                        />
                      </div>

                    </div>
                  </div>
                ))}

                {/* Add Exercise */}
                <button
                  type="button"
                  onClick={addExercise}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-pink-300 py-4 text-sm font-semibold text-pink-800 hover:bg-pink-50"
                >
                  <PlusCircle size={18} />
                  Add Another Exercise
                </button>

              </div>
            </section>
          </main>

          {/* Save Workout */}
          <footer className="sticky bottom-0 border-t border-slate-200 bg-white p-4">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-pink-400 py-3.5 text-sm font-bold text-pink-950 hover:bg-pink-500"
            >
              <Check size={18} />
              Save Workout
            </button>
          </footer>

        </form>
      </div>
    </div>
  );
}