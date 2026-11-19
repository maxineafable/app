using Microsoft.AspNetCore.Identity;

namespace Project.Features.Auth;

public static class AuthEndpoints
{
	public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
	{
		var group = app.MapGroup("/api/auth");

		group.MapIdentityApi<IdentityUser>();
		group.MapPost("/logout", Logout).RequireAuthorization();;

		return app;
	}

	private static async Task<IResult> Logout(SignInManager<IdentityUser> mgr)
	{
    	await mgr.SignOutAsync();
		return TypedResults.NoContent();
	}
}