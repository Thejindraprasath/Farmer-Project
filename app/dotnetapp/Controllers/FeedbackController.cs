using dotnetapp.Models;
using dotnetapp.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace dotnetapp.Controllers;

[ApiController]
[Route("api/feedback")]
[Authorize]
public class FeedbackController : ControllerBase
{
    private readonly IFeedbackService _feedbackService;
    private readonly IErrorLogService _errorLogService;

    public FeedbackController(IFeedbackService feedbackService, IErrorLogService errorLogService)
    {
        _feedbackService = feedbackService;
        _errorLogService = errorLogService;
    }

    // GET: /api/feedback - Access for only Admin
    [Authorize(Roles = UserRoles.Admin)]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Feedback>>> GetAllFeedbacks()
    {
        try
        {
            return Ok(await _feedbackService.GetAllFeedbacks());
        }
        catch (Exception ex)
        {
            await _errorLogService.LogAsync(ex, HttpContext.Request.Path);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Something went wrong. Please try again later." });
        }
    }

    // GET: /api/feedback/user/{userId} - Access for only User
    [Authorize(Roles = UserRoles.User)]
    [HttpGet("user/{userId:int}")]
    public async Task<ActionResult<IEnumerable<Feedback>>> GetFeedbacksByUserId(int userId)
    {
        try
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId is null)
            {
                return Unauthorized();
            }
            if (currentUserId.Value != userId)
            {
                return Forbid();
            }

            var feedbacks = (await _feedbackService.GetFeedbacksByUserId(userId)).ToList();
            return Ok(feedbacks);
        }
        catch (Exception ex)
        {
            await _errorLogService.LogAsync(ex, HttpContext.Request.Path);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Something went wrong. Please try again later." });
        }
    }

    // POST: /api/feedback - Access for only User
    [Authorize(Roles = UserRoles.User)]
    [HttpPost]
    public async Task<IActionResult> AddFeedback([FromBody] Feedback feedback)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Invalid feedback details" });
            }

            var currentUserId = GetCurrentUserId();
            if (currentUserId is null)
            {
                return Unauthorized();
            }
            if (feedback.UserId != currentUserId.Value)
            {
                return Forbid();
            }

            var added = await _feedbackService.AddFeedback(feedback);
            return added
                ? Ok(new { message = "Feedback added successfully" })
                : BadRequest(new { message = "Cannot find user" });
        }
        catch (Exception ex)
        {
            await _errorLogService.LogAsync(ex, HttpContext.Request.Path);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Something went wrong. Please try again later." });
        }
    }

    // DELETE: /api/feedback/{feedbackId} - Access for only User
    [Authorize(Roles = UserRoles.User)]
    [HttpDelete("{feedbackId:int}")]
    public async Task<IActionResult> DeleteFeedback(int feedbackId)
    {
        try
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId is null)
            {
                return Unauthorized();
            }
            if (!await _feedbackService.FeedbackBelongsToUser(feedbackId, currentUserId.Value))
            {
                return NotFound(new { message = "Cannot find any feedback" });
            }

            var deleted = await _feedbackService.DeleteFeedback(feedbackId);
            if (!deleted)
            {
                return NotFound(new { message = "Cannot find any feedback" });
            }

            return Ok(new { message = "Feedback deleted successfully" });
        }
        catch (Exception ex)
        {
            await _errorLogService.LogAsync(ex, HttpContext.Request.Path);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Something went wrong. Please try again later." });
        }
    }

    private int? GetCurrentUserId()
    {
        var raw = User.FindFirst("userId")?.Value;
        return int.TryParse(raw, out var userId) && userId > 0 ? userId : null;
    }
}