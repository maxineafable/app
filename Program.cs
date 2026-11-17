using Microsoft.EntityFrameworkCore;
using Project.DTOs;
using Project.Models;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<ProjectDb>(opt =>
    opt.UseInMemoryDatabase("ProjectDb"));

builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

// app.UseHttpsRedirection();

var workoutGroup = app.MapGroup("/workouts");
var exerciseGroup = app.MapGroup("/exercises");

workoutGroup.MapGet("/", GetAllWorkouts);
workoutGroup.MapGet("/{id}", GetWorkout);
workoutGroup.MapPost("/", CreateWorkout);
workoutGroup.MapPut("/{id}", UpdateWorkout);
workoutGroup.MapDelete("/{id}", DeleteWorkout);

exerciseGroup.MapGet("/", GetAllExercises);

app.Run();

static async Task<IResult> GetAllExercises(ProjectDb db)
{
    return TypedResults.Ok(await db.Exercises.ToListAsync());
}

static async Task<IResult> GetAllWorkouts(ProjectDb db)
{
    return TypedResults.Ok(await db.Workouts
        .AsNoTracking()
        .Include(w => w.Exercises)
        .Select(w => new WorkoutResponse(w))
        .ToArrayAsync());
}

static async Task<IResult> GetWorkout(int id, ProjectDb db)
{
    var workout = await db.Workouts
        .AsNoTracking()
        .Include(w => w.Exercises)
        .FirstOrDefaultAsync(w => w.Id == id);

    return workout is not null
        ? TypedResults.Ok(new WorkoutResponse(workout))
        : TypedResults.NotFound();
}

static async Task<IResult> CreateWorkout(CreateWorkoutRequest request, ProjectDb db)
{
    var workout = new Workout
    {
        Title = request.Title,
        Note = request.Note,
        Date = request.Date,
        Exercises = request.Exercises.Select(e => new Exercise
        {
            Name = e.Name,
            Sets = e.Sets,
            Reps = e.Reps,
            Weight = e.Weight,
            WeightUnit = e.WeightUnit,
            Note = e.Note,
        }).ToList()
    };

    db.Workouts.Add(workout);
    await db.SaveChangesAsync();

    return TypedResults.Created($"/workouts/{workout.Id}", new WorkoutResponse(workout));
}

static async Task<IResult> UpdateWorkout(int id, UpdateWorkoutRequest request, ProjectDb db)
{
    var workout = await db.Workouts.FindAsync(id);

    if (workout is null)
        return TypedResults.NotFound();

    workout.Title = request.Title;
    workout.Note = request.Note;
    workout.Date = request.Date;

    await db.SaveChangesAsync();

    return TypedResults.NoContent();
}

static async Task<IResult> DeleteWorkout(int id, ProjectDb db)
{
    if (await db.Workouts.FindAsync(id) is Workout workout)
    {
        db.Workouts.Remove(workout);
        await db.SaveChangesAsync();

        return TypedResults.NoContent();
    }

    return TypedResults.NotFound();
}
