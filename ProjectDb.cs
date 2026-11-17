using Microsoft.EntityFrameworkCore;
using Project.Models;

class ProjectDb : DbContext
{
    public ProjectDb(DbContextOptions<ProjectDb> options)
        : base(options) {}

    public DbSet<Workout> Workouts => Set<Workout>();

    public DbSet<Exercise> Exercises => Set<Exercise>();
}