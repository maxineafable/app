import Form, { WeightUnit, type Exercise, type Workout } from '@/components/workouts/form';
import { meQuery } from '@/lib/query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Navigate, useNavigate } from '@tanstack/react-router'

import { useState } from 'react';

export const Route = createFileRoute('/workouts/new')({
	component: RouteComponent,
})

const createExercise = (id: number): Exercise => ({
	id,
	name: "",
	sets: 0,
	reps: 0,
	weight: 0,
	weightUnit: WeightUnit.Kg,
	note: null,
});

function RouteComponent() {
	const queryClient = useQueryClient()
	const navigate = useNavigate()

	const [workout, setWorkout] = useState<Workout>({
		title: "",
		date: new Date().toLocaleDateString("en-CA"),
		note: null,
		exercises: [createExercise(1)],
	});

	const me = useQuery(meQuery)

	const mutation = useMutation({
		mutationFn: async () => {
			const payload = {
				...workout,
				exercises: workout.exercises.map(({ id, ...exercise }) => exercise)
			}

			const res = await fetch("/api/workouts", {
				method: 'POST',
				credentials: 'include',
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			})

			if (!res.ok)
				throw new Error("Error creating a workout");

			return res.json()
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['workouts'] })
			navigate({ to: '/' })
		}
	})


	const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		mutation.mutate()
	};

	if (me.isPending) return <div className="">loading...</div>
	if (!me.data) return <Navigate to='/login' />

	return (
		<Form
			handleSubmit={handleSubmit}
			setWorkout={setWorkout}
			workout={workout}
		/>
	);
}
