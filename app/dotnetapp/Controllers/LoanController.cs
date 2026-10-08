using dotnetapp.Exceptions;
using dotnetapp.Models;
using dotnetapp.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace dotnetapp.Controllers;

[ApiController]
[Route("api/loan")]
[Authorize]
public class LoanController : ControllerBase
{
    private readonly ILoanService _loanService;
    private readonly IErrorLogService _errorLogService;

    public LoanController(ILoanService loanService, IErrorLogService errorLogService)
    {
        _loanService = loanService;
        _errorLogService = errorLogService;
    }

    // GET: /api/loan - Access for both Admin and User
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Loan>>> GetAllLoans()
    {
        try
        {
            return Ok(await _loanService.GetAllLoans());
        }
        catch (Exception ex)
        {
            await _errorLogService.LogAsync(ex, HttpContext.Request.Path);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Something went wrong. Please try again later." });
        }
    }

    // GET: /api/loan/{loanId} - Access for only Admin
    [Authorize(Roles = UserRoles.Admin)]
    [HttpGet("{loanId:int}")]
    public async Task<ActionResult<Loan>> GetLoanById(int loanId)
    {
        try
        {
            var loan = await _loanService.GetLoanById(loanId);
            if (loan is null)
            {
                return NotFound(new { message = "Cannot find any loan" });
            }

            return Ok(loan);
        }
        catch (Exception ex)
        {
            await _errorLogService.LogAsync(ex, HttpContext.Request.Path);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Something went wrong. Please try again later." });
        }
    }

    // POST: /api/loan - Access for only Admin
    [Authorize(Roles = UserRoles.Admin)]
    [HttpPost]
    public async Task<IActionResult> AddLoan([FromBody] Loan loan)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Invalid loan details" });
            }

            var added = await _loanService.AddLoan(loan);
            return added
                ? Ok(new { message = "Loan added successfully" })
                : StatusCode(StatusCodes.Status500InternalServerError, new { message = "Failed to add loan" });
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

    // PUT: /api/loan/{loanId} - Access for only Admin
    [Authorize(Roles = UserRoles.Admin)]
    [HttpPut("{loanId:int}")]
    public async Task<IActionResult> UpdateLoan(int loanId, [FromBody] Loan loan)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Invalid loan details" });
            }

            var updated = await _loanService.UpdateLoan(loanId, loan);
            if (!updated)
            {
                return NotFound(new { message = "Cannot find any loan" });
            }

            return Ok(new { message = "Loan updated successfully" });
        }
        catch (LoanException ex)
        {
            await _errorLogService.LogAsync(ex, HttpContext.Request.Path);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
        }
        catch (Exception ex)
        {
            await _errorLogService.LogAsync(ex, HttpContext.Request.Path);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
        }
    }

    // DELETE: /api/loan/{loanId} - Access for only Admin
    [Authorize(Roles = UserRoles.Admin)]
    [HttpDelete("{loanId:int}")]
    public async Task<IActionResult> DeleteLoan(int loanId)
    {
        try
        {
            var deleted = await _loanService.DeleteLoan(loanId);
            if (!deleted)
            {
                return NotFound(new { message = "Cannot find any loan" });
            }

            return Ok(new { message = "Loan deleted successfully" });
        }
        catch (LoanException ex)
        {
            await _errorLogService.LogAsync(ex, HttpContext.Request.Path);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
        }
        catch (Exception ex)
        {
            await _errorLogService.LogAsync(ex, HttpContext.Request.Path);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
        }
    }
}
