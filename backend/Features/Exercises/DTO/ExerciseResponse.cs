using Project.Models;

namespace Project.Features.Exercises.DTO;

public class ExerciseResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Sets { get; set; }
    public int Reps { get; set; }
    public decimal Weight { get; set; }
    public WeightUnit WeightUnit { get; set; }
    public string? Note { get; set; }

    public ExerciseResponse() { }

    public ExerciseResponse(Exercise exercise) =>
        (Id, Name, Sets, Reps, Weight, WeightUnit, Note) = (
            exercise.Id,
            exercise.Name,
            exercise.Sets,
            exercise.Reps,
            exercise.Weight,
            exercise.WeightUnit,
            exercise.Note
        );
}