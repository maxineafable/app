using Microsoft.AspNetCore.Identity;

namespace Project.Models;

public class Workout
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Note { get; set; }

    public DateOnly Date { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Exercise> Exercises { get; set; } = new List<Exercise>();

    public required string UserId { get; set; }

    public IdentityUser? User { get; set; }
}