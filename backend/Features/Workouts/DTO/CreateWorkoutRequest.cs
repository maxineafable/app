using System.ComponentModel.DataAnnotations;
using Project.Features.Exercises.DTO;

namespace Project.Features.Workouts.DTO;

public record CreateWorkoutRequest
{
    [Required]
    [MaxLength(100)]
    public required string Title { get; init; }

    [MaxLength(100)]
    public string? Note { get; init; }

    [Required]
    public DateOnly Date { get; init; }

    [Required]
    [MinLength(1, ErrorMessage = "A workout must have at least one exercise")]
    public required List<CreateExerciseRequest> Exercises { get; init; }
}
