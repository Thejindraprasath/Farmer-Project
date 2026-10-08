using dotnetapp.Models;
using dotnetapp.Services;
using Microsoft.AspNetCore.Mvc;

namespace dotnetapp.Controllers;

[ApiController]
[Route("api")]
public class AuthenticationController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IErrorLogService _errorLogService;

    public AuthenticationController(IAuthService authService, IErrorLogService errorLogService)
    {
        _authService = authService;
        _errorLogService = errorLogService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginModel model)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Invalid login details" });
            }

            var (status, message) = await _authService.Login(model);
            if (status == 0)
            {
                return BadRequest(new { message });
            }

            return Ok(new { token = message });
        }
        catch (Exception ex)
        {
            await _errorLogService.LogAsync(ex, HttpContext.Request.Path);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Something went wrong. Please try again later." });
        }
    }
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] User model)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Invalid registration details" });
            }

            var (status, message) = await _authService.Registration(model, model.UserRole);
            if (status == 0)
            {
                return BadRequest(new { message });
            }

            return Ok(new { message });
        }
        catch (Exception ex)
        {
            await _errorLogService.LogAsync(ex, HttpContext.Request.Path);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Something went wrong. Please try again later." });
        }
    }
}
