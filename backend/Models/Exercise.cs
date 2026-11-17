namespace Project.Models;

public enum WeightUnit
{
    Kg,
    Lb,
}

public class Exercise
{
    public int Id { get; set; }
    
    public int WorkoutId { get; set; }

    public string Name { get; set; } = string.Empty;

    public int Sets { get; set; }

    public int Reps { get; set; }

    public decimal Weight { get; set; }

    public WeightUnit WeightUnit { get; set; } = WeightUnit.Kg;

    public string? Note { get; set; }

    public Workout workout { get; set; } = null!;
}