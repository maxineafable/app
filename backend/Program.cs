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
    .WithMethods("GET", "POST", "PUT", "DELETE")
    .AllowCredentials()
));

builder.Services
    .AddIdentityApiEndpoints<IdentityUser>(o =>
    {
        o.User.RequireUniqueEmail = true;
        o.Password.RequiredLength = 8;
    })
    .AddEntityFrameworkStores<ProjectDb>();

builder.Services.ConfigureApplicationCookie(o =>
{
    o.Cookie.Name = "project_auth";
    o.Cookie.HttpOnly = true;
    o.Cookie.SameSite = SameSiteMode.Lax;
    o.Cookie.SecurePolicy = builder.Environment.IsDevelopment()
        ? CookieSecurePolicy.SameAsRequest
        : CookieSecurePolicy.Always;
    o.ExpireTimeSpan = TimeSpan.FromDays(14);

    o.Events.OnRedirectToLogin = ctx =>
    {
        ctx.Response.StatusCode = StatusCodes.Status401Unauthorized;
        return Task.CompletedTask;
    };
});

builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

// app.UseHttpsRedirection();
app.UseCors("frontend");

app.UseAuthentication();
app.UseAuthorization();

using (var scope = app.Services.CreateScope())
{
    await scope.ServiceProvider.GetRequiredService<ProjectDb>().Database.MigrateAsync();
}

var api = app.MapGroup("/api");

api.MapIdentityApi<IdentityUser>();
api.MapPost("/logout", async (SignInManager<IdentityUser> mgr) =>
{
    await mgr.SignOutAsync();
    return Results.NoContent();
}).RequireAuthorization();

var workoutGroup = api.MapGroup("/workouts").RequireAuthorization();
var exerciseGroup = api.MapGroup("/exercises").RequireAuthorization();

workoutGroup.MapGet("/", GetAllWorkouts);
workoutGroup.MapGet("/{id}", GetWorkout);
workoutGroup.MapPost("/", CreateWorkout);
workoutGroup.MapPut("/{id}", UpdateWorkout);
workoutGroup.MapDelete("/{id}", DeleteWorkout);

exerciseGroup.MapGet("/", GetAllExercises);

api.Map("/{**rest}", () => Results.NotFound());

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

    var workout = await db.Workouts
        .Include(w => w.Exercises)
        .FirstOrDefaultAsync(w => w.Id == id && w.UserId == userId);

    if (workout is null)
        return TypedResults.NotFound();

    workout.Title = request.Title;
    workout.Note = request.Note;
    workout.Date = request.Date;

    var existing = workout.Exercises.ToDictionary(e => e.Id);

    if (request.Exercises.Any(e => e.Id is int exId && !existing.ContainsKey(exId)))
        return TypedResults.BadRequest("Unknown exercise id.");

    var keepIds = request.Exercises
        .Where(e => e.Id.HasValue)
        .Select(e => e.Id!.Value)
        .ToHashSet();

    db.Exercises.RemoveRange(workout.Exercises.Where(e => !keepIds.Contains(e.Id)));

    foreach (var dto in request.Exercises)
    {
        if (dto.Id is int exId)
        {
            var exercise = existing[exId];
            exercise.Name = dto.Name;
            exercise.Note = dto.Note;
            exercise.Sets = dto.Sets;
            exercise.Reps = dto.Reps;
            exercise.Weight = dto.Weight;
            exercise.WeightUnit = dto.WeightUnit;
        }
        else
        {
            // added
            workout.Exercises.Add(new Exercise
            {
                Name = dto.Name,
                Note = dto.Note,
                Sets = dto.Sets,
                Reps = dto.Reps,
                Weight = dto.Weight,
                WeightUnit = dto.WeightUnit,
            });
        }
    }

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
