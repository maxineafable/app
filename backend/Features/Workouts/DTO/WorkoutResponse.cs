using Project.Features.Exercises.DTO;
using Project.Models;

namespace Project.Features.Workouts.DTO;

public class WorkoutResponse
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Note { get; set; }
    public DateOnly Date { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<ExerciseResponse> Exercises { get; set; } = [];

    public WorkoutResponse() { }

    public WorkoutResponse(Workout workout) =>
        (Id, Title, Note, Date, CreatedAt, Exercises) = (
            workout.Id,
            workout.Title,
            workout.Note,
            workout.Date,
            workout.CreatedAt,
            workout.Exercises.Select(e => new ExerciseResponse(e)).ToList()
        );
}