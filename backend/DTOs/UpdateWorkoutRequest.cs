using System.ComponentModel.DataAnnotations;

public record UpdateWorkoutRequest
{
    [Required]
    [MaxLength(100)]
    public required string Title { get; init; }

    [MaxLength(100)]
    public string? Note { get; init; }

    [Required]
    public DateOnly Date { get; init; }
}