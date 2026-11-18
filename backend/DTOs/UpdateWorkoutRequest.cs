using System.ComponentModel.DataAnnotations;
using Project.Models;

public record UpdateWorkoutRequest
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
    public required List<UpdateExerciseRequest> Exercises { get; init; }
}

public record UpdateExerciseRequest
{
    public int? Id { get; init; }

    [Required, MaxLength(100)]
    public required string Name { get; init; }

    [MaxLength(100)]
    public string? Note { get; init; }

    [Range(1, 20)]
    public int Sets { get; init; }

    [Range(1, 100)]
    public int Reps { get; init; }

    [Range(1, 1000)]
    public decimal Weight { get; init; }

    public WeightUnit WeightUnit { get; init; }
}