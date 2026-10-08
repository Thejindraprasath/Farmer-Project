using dotnetapp.Exceptions;
using dotnetapp.Models;
using dotnetapp.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace dotnetapp.Controllers;

[ApiController]
[Route("api/loan-application")]
[Authorize]
public class LoanApplicationController : ControllerBase
{
    private readonly ILoanApplicationService _loanApplicationService;
    private readonly IErrorLogService _errorLogService;

    public LoanApplicationController(ILoanApplicationService loanApplicationService, IErrorLogService errorLogService)
    {
        _loanApplicationService = loanApplicationService;
        _errorLogService = errorLogService;
    }

    // GET: /api/loan-application - Access for only Admin
    [Authorize(Roles = UserRoles.Admin)]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<LoanApplication>>> GetAllLoanApplications()
    {
        try
        {
            return Ok(await _loanApplicationService.GetAllLoanApplications());
        }
        catch (Exception ex)
        {
            await _errorLogService.LogAsync(ex, HttpContext.Request.Path);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Something went wrong. Please try again later." });
        }
    }

    // GET: /api/loan-application/user/{userId} - Access for only User
    [Authorize(Roles = UserRoles.User)]
    [HttpGet("user/{userId:int}")]
    public async Task<ActionResult<IEnumerable<LoanApplication>>> GetLoanApplicationByUserId(int userId)
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

            var applications = (await _loanApplicationService.GetLoanApplicationsByUserId(userId)).ToList();
            return Ok(applications);
        }
        catch (Exception ex)
        {
            await _errorLogService.LogAsync(ex, HttpContext.Request.Path);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Something went wrong. Please try again later." });
        }
    }

    // POST: /api/loan-application - Access for only User
    [Authorize(Roles = UserRoles.User)]
    [HttpPost]
    public async Task<IActionResult> AddLoanApplication([FromBody] LoanApplication loanApplication)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Invalid loan application details" });
            }

            var currentUserId = GetCurrentUserId();
            if (currentUserId is null)
            {
                return Unauthorized();
            }
            if (loanApplication.UserId != currentUserId.Value)
            {
                return Forbid();
            }

            // New applications always begin in Pending state.
            loanApplication.LoanStatus = 0;
            var added = await _loanApplicationService.AddLoanApplication(loanApplication);
            return added
                ? Ok(new { message = "Loan application added successfully" })
                : StatusCode(StatusCodes.Status500InternalServerError, new { message = "Failed to add loan application" });
        }
        catch (LoanException ex)
        {
            await _errorLogService.LogAsync(ex, HttpContext.Request.Path);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            await _errorLogService.LogAsync(ex, HttpContext.Request.Path);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Something went wrong. Please try again later." });
        }
    }

    // PUT: /api/loan-application/{loanApplicationId} - Access for both Admin and User
    [Authorize(Roles = UserRoles.Admin + "," + UserRoles.User)]
    [HttpPut("{loanApplicationId:int}")]
    public async Task<IActionResult> UpdateLoanApplication(int loanApplicationId, [FromBody] LoanApplication loanApplication)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Invalid loan application details" });
            }

            if (User.IsInRole(UserRoles.User))
            {
                var currentUserId = GetCurrentUserId();
                if (currentUserId is null)
                {
                    return Unauthorized();
                }

                var existing = await _loanApplicationService.GetLoanApplicationById(loanApplicationId);
                if (existing is null)
                {
                    return NotFound(new { message = "Cannot find any loan application" });
                }
                if (existing.UserId != currentUserId.Value || loanApplication.UserId != currentUserId.Value)
                {
                    return Forbid();
                }

                // A regular user must never be able to approve/reject their own request.
                loanApplication.LoanStatus = existing.LoanStatus;
            }

            var updated = await _loanApplicationService.UpdateLoanApplication(loanApplicationId, loanApplication);
            if (!updated)
            {
                return NotFound(new { message = "Cannot find any loan application" });
            }

            return Ok(new { message = "Loan application updated successfully" });
        }
        catch (LoanException ex)
        {
            await _errorLogService.LogAsync(ex, HttpContext.Request.Path);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            await _errorLogService.LogAsync(ex, HttpContext.Request.Path);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Something went wrong. Please try again later." });
        }
    }

    // DELETE: /api/loan-application/{loanApplicationId} - Access for only User
    [Authorize(Roles = UserRoles.User)]
    [HttpDelete("{loanApplicationId:int}")]
    public async Task<IActionResult> DeleteLoanApplication(int loanApplicationId)
    {
        try
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId is null)
            {
                return Unauthorized();
            }
            if (!await _loanApplicationService.LoanApplicationBelongsToUser(loanApplicationId, currentUserId.Value))
            {
                return NotFound(new { message = "Cannot find any loan application" });
            }

            var deleted = await _loanApplicationService.DeleteLoanApplication(loanApplicationId);
            if (!deleted)
            {
                return NotFound(new { message = "Cannot find any loan application" });
            }

            return Ok(new { message = "Loan application deleted successfully" });
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