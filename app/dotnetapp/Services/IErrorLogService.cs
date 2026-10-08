namespace dotnetapp.Services;

public interface IErrorLogService
{
    Task LogAsync(Exception exception, string? requestPath = null);
}
