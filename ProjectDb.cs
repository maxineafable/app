using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Project.Models;

public class ProjectDb(DbContextOptions<ProjectDb> options) 
    : IdentityDbContext<IdentityUser>(options)
{
    public DbSet<Workout> Workouts => Set<Workout>();

    public DbSet<Exercise> Exercises => Set<Exercise>();
}