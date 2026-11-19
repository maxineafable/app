using System.ComponentModel.DataAnnotations;
using Project.Models;

namespace Project.Features.Exercises.DTO;

public record CreateExerciseRequest
{
    [Required]
    [MaxLength(100)]
    public string Name { get; init; } = string.Empty;

    [Range(1, 20)]
    public int Sets { get; init; }

    [Range(1, 100)]
    public int Reps { get; init; }

    [Range(1, 1000)]
    public decimal Weight { get; init; }

    public WeightUnit WeightUnit { get; init; } = WeightUnit.Kg;

    [MaxLength(500)]
    public string? Note { get; init; }
}