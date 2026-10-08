namespace dotnetapp.Models;

public class ErrorLog
{
    public int ErrorLogId { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? StackTrace { get; set; }
    public string? Source { get; set; }
    public string? RequestPath { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
