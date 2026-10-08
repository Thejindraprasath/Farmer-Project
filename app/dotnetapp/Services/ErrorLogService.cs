using dotnetapp.Data;
using dotnetapp.Models;

namespace dotnetapp.Services;

public class ErrorLogService : IErrorLogService
{
    private readonly ApplicationDbContext _context;
    public ErrorLogService(ApplicationDbContext context) => _context = context;

    public async Task LogAsync(Exception exception, string? requestPath = null)
    {
        _context.ErrorLogs.Add(new ErrorLog
        {
            Message = exception.Message,
            StackTrace = exception.StackTrace,
            Source = exception.Source,
            RequestPath = requestPath,
            CreatedAt = DateTime.UtcNow
        });
        await _context.SaveChangesAsync();
    }
}
