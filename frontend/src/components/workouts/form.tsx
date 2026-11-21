import { Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Dumbbell, ListPlus, PlusCircle, Trash2 } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export const WeightUnit = {
  Kg: 0,
  Lb: 1,
} as const
type WeightUnit = (typeof WeightUnit)[keyof typeof WeightUnit]

const weightUnitLabels: Record<WeightUnit, string> = {
  [WeightUnit.Kg]: "kg",
  [WeightUnit.Lb]: "lb",
};

export type Exercise = {
  id: number;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  weightUnit: WeightUnit;
  note: string | null;
};

export type Workout = {
  title: string;
  date: string;
  note: string | null;
  exercises: Exercise[];
};

type Props = {
  handleSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void
  setWorkout: React.Dispatch<React.SetStateAction<Workout>>
  workout: Workout
} & (
    | {
      isEdit: true
      nextTempId: React.RefObject<number>
      removeExercise: (id: number) => void
    }
    | {
      isEdit?: false
      nextTempId?: never
      removeExercise?: never
    }
  )

const createExercise = (id: number): Exercise => ({
  id,
  name: "",
  sets: 0,
  reps: 0,
  weight: 0,
  weightUnit: WeightUnit.Kg,
  note: null,
});

export default function Form({
  handleSubmit,
  setWorkout,
  workout,
  isEdit,
  nextTempId,
  removeExercise,
}: Props) {
  const updateWorkout = (
    field: keyof Omit<Workout, "exercises">,
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

  const addExercise = () => {
    setWorkout((prev) => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        isEdit
          ? {
            id: nextTempId.current--,
            name: '',
            sets: 0,
            reps: 0,
            weight: 0,
            weightUnit: WeightUnit.Kg,
            note: null,
          }
          : createExercise(Date.now()),
      ],
    }));
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900">
      <div className="mx-auto flex min-h-screen max-w-md flex-col">
        <header className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-neutral-600">
              <ArrowLeft size={18} />
            </Link>
            <h1 className="font-bold">Create New Workout</h1>
          </div>

          <Link
            to="/"
            className="text-xs font-medium text-neutral-600"
          >
            Cancel
          </Link>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
          <main className="flex-1 space-y-6 p-5 pb-8">
            <section className="rounded-2xl border border-neutral-200 p-4">
              <div className="mb-4 flex items-center gap-2 border-b border-neutral-200 pb-3">
                <div className="flex size-7 items-center justify-center rounded-lg bg-pink-50 text-pink-800">
                  <ListPlus size={18} />
                </div>
                <h2 className="text-sm font-bold">Workout Info</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium">
                    Workout Title
                  </label>
                  <Input
                    type="text"
                    value={workout.title}
                    onChange={(e) => updateWorkout("title", e.target.value)}
                    placeholder="e.g. Chest & Triceps Focus"
                    required
                    autoFocus
                    className="w-full border border-neutral-200 bg-neutral-50"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium">
                    Date
                  </label>

                  <Input
                    type="date"
                    value={workout.date}
                    onChange={(e) => updateWorkout("date", e.target.value)}
                    required
                    className="w-full border border-neutral-200 bg-neutral-50"
                  />
                </div>

                <div>
                  <div className="mb-1.5 flex justify-between">
                    <label className="text-xs font-medium">
                      Workout Notes
                    </label>
                    <span className="text-xs text-neutral-500">Optional</span>
                  </div>

                  <textarea
                    value={workout.note ?? ''}
                    onChange={(e) => updateWorkout("note", e.target.value)}
                    placeholder="Add some notes about your workout..."
                    rows={5}
                    className="w-full rounded-3xl resize-none border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm"
                  />
                </div>

              </div>
            </section>

            <section>
              <div className="mb-3">
                <h2 className="text-sm font-bold">Exercises</h2>
                <p className="text-xs text-neutral-500">
                  {workout.exercises.length}{" "}
                  {workout.exercises.length === 1 ? "exercise" : "exercises"} added
                </p>
              </div>

              <div className="space-y-3">

                {workout.exercises.map((exercise, index) => (
                  <div
                    key={exercise.id}
                    className="rounded-2xl border border-neutral-200 p-4"
                  >
                    <div className="mb-4 flex items-center gap-2 border-b border-neutral-200 pb-2">
                      <span className="flex size-6 items-center justify-center rounded-full bg-pink-50 text-xs font-semibold text-pink-800">
                        {index + 1}
                      </span>

                      <h3 className="text-sm font-semibold">
                        Exercise details
                      </h3>

                      {isEdit && (
                        <button
                          type="button"
                          onClick={() => removeExercise(exercise.id)}
                          className="ml-auto text-slate-400 hover:text-red-600"
                          title="Remove exercise"
                          disabled={workout.exercises.length === 1}
                        >
                          <Trash2 size={17} />
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium">
                          Exercise Name
                        </label>
                        <div className="flex rounded-3xl items-center gap-3 border border-neutral-200 bg-neutral-50 px-3 py-2">
                          <Dumbbell size={18} className="text-neutral-600" />

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

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="mb-1.5 block text-xs font-medium">
                            Sets
                          </label>
                          <Input
                            type="number"
                            min="1"
                            value={exercise.sets || ""}
                            onChange={(e) =>
                              updateExercise(exercise.id, "sets", e.target.valueAsNumber)
                            }
                            placeholder="0"
                            required
                            className="rounded-3xl border-neutral-200 bg-neutral-50 text-center text-sm font-semibold"
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs font-medium">
                            Reps
                          </label>
                          <Input
                            type="number"
                            min="1"
                            value={exercise.reps || ""}
                            onChange={(e) =>
                              updateExercise(exercise.id, "reps", e.target.valueAsNumber)
                            }
                            placeholder="0"
                            required
                            className="rounded-3xl border-neutral-200 bg-neutral-50 text-center text-sm font-semibold"
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs font-medium">
                            Weight
                          </label>
                          <Input
                            type="number"
                            min="0"
                            step="any"
                            value={exercise.weight || ""}
                            onChange={(e) =>
                              updateExercise(exercise.id, "weight", e.target.valueAsNumber)
                            }
                            placeholder="0"
                            required
                            className="rounded-3xl border-neutral-200 bg-neutral-50 text-center text-sm font-semibold"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium">
                          Weight Unit
                        </label>
                        <div className="flex rounded-full border border-neutral-200 bg-neutral-50 p-0.5">
                          {([WeightUnit.Kg, WeightUnit.Lb] as const).map((unit) => (
                            <button key={unit}
                              type="button"
                              onClick={() => updateExercise(exercise.id, "weightUnit", unit)}
                              className={`rounded-full px-4 py-1 text-xs font-semibold ${exercise.weightUnit === unit
                                ? "bg-pink-400 text-pink-50"
                                : "text-neutral-600"
                                }`}
                            >
                              {weightUnitLabels[unit]}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="mb-1.5 flex justify-between">
                          <label className="text-xs font-medium">
                            Exercise Note
                          </label>
                          <span className="text-xs text-neutral-500">
                            Optional
                          </span>
                        </div>

                        <Input
                          type="text"
                          value={exercise.note ?? ''}
                          onChange={(e) =>
                            updateExercise(exercise.id, "note", e.target.value)
                          }
                          placeholder="e.g. Pause on chest 1s, RPE 8.5"
                          className="w-full border border-neutral-200 bg-neutral-50"
                        />
                      </div>

                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  onClick={addExercise}
                  className="w-full bg-transparent border border-dashed border-pink-300 py-4 text-sm font-semibold text-pink-800 hover:bg-pink-50"
                >
                  <PlusCircle size={18} />
                  Add Another Exercise
                </Button>

              </div>
            </section>
          </main>

          <footer className="sticky bottom-0 border-t border-neutral-200 bg-neutral-100 p-4">
            <Button
              type="submit"
              className="w-full bg-pink-400 hover:bg-pink-500 py-5 text-sm font-bold text-pink-50"
            >
              <Check size={18} />
              Save Workout
            </Button>
          </footer>

        </form>
      </div>
    </div>
  );
}