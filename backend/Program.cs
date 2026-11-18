using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Project.DTOs;
using Project.Models;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<ProjectDb>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddOpenApi();

builder.Services.AddCors(o => o.AddPolicy("frontend", p => p
    .WithOrigins("http://localhost:5173")
    .AllowAnyHeader()
    .AllowAnyMethod()
));

builder.Services
    .AddIdentityApiEndpoints<IdentityUser>()
    .AddEntityFrameworkStores<ProjectDb>();

builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();
app.UseCors("frontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapIdentityApi<IdentityUser>();

var workoutGroup = app.MapGroup("/workouts").RequireAuthorization();
var exerciseGroup = app.MapGroup("/exercises").RequireAuthorization();

workoutGroup.MapGet("/", GetAllWorkouts);
workoutGroup.MapGet("/{id}", GetWorkout);
workoutGroup.MapPost("/", CreateWorkout);
workoutGroup.MapPut("/{id}", UpdateWorkout);
workoutGroup.MapDelete("/{id}", DeleteWorkout);

exerciseGroup.MapGet("/", GetAllExercises);

app.Run();

static string? GetUserId(ClaimsPrincipal p) => p.FindFirstValue(ClaimTypes.NameIdentifier);

static async Task<IResult> GetAllExercises(ProjectDb db)
{
    return TypedResults.Ok(await db.Exercises.ToListAsync());
}

static async Task<IResult> GetAllWorkouts(ClaimsPrincipal principal, ProjectDb db)
{
    var userId = GetUserId(principal);

    return TypedResults.Ok(await db.Workouts
        .AsNoTracking()
        .Where(w => w.UserId == userId)
        .Include(w => w.Exercises)
        .Select(w => new WorkoutResponse(w))
        .ToArrayAsync());
}

static async Task<IResult> GetWorkout(int id, ClaimsPrincipal principal, ProjectDb db)
{
    var userId = GetUserId(principal);

    var workout = await db.Workouts
        .AsNoTracking()
        .Include(w => w.Exercises)
        .FirstOrDefaultAsync(w => w.Id == id && w.UserId == userId);

    return workout is not null
        ? TypedResults.Ok(new WorkoutResponse(workout))
        : TypedResults.NotFound();
}

static async Task<IResult> CreateWorkout(ClaimsPrincipal principal, CreateWorkoutRequest request, ProjectDb db)
{
    var userId = GetUserId(principal);

    if (userId is null)
        return TypedResults.Unauthorized();

    var workout = new Workout
    {
        Title = request.Title,
        Note = request.Note,
        Date = request.Date,
        UserId = userId,
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

static async Task<IResult> UpdateWorkout(int id, ClaimsPrincipal principal, UpdateWorkoutRequest request, ProjectDb db)
{
    var userId = GetUserId(principal);

    var workout = await db.Workouts.FirstOrDefaultAsync(w => w.Id == id && w.UserId == userId);

    if (workout is null)
        return TypedResults.NotFound();

    workout.Title = request.Title;
    workout.Note = request.Note;
    workout.Date = request.Date;

    await db.SaveChangesAsync();

    return TypedResults.NoContent();
}

static async Task<IResult> DeleteWorkout(int id, ClaimsPrincipal principal, ProjectDb db)
{
    var userId = GetUserId(principal);

    var workout = await db.Workouts.FirstOrDefaultAsync(w => w.Id == id && w.UserId == userId);

    if (workout is null)
        return TypedResults.NotFound();

    db.Workouts.Remove(workout);
    await db.SaveChangesAsync();
    return TypedResults.NoContent();
}
