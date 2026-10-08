using dotnetapp.Data;
using dotnetapp.Models;
using Microsoft.EntityFrameworkCore;

namespace dotnetapp.Services;

public class FeedbackService : IFeedbackService
{
    private readonly ApplicationDbContext _context;

    public FeedbackService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Feedback>> GetAllFeedbacks()
    {
        return await _context.Feedbacks
            .Include(x => x.User)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<IEnumerable<Feedback>> GetFeedbacksByUserId(int userId)
    {
        return await _context.Feedbacks
            .Where(x => x.UserId == userId)
            .Include(x => x.User)
            .AsNoTracking()
            .ToListAsync();
    }

    public Task<bool> FeedbackBelongsToUser(int feedbackId, int userId)
    {
        return _context.Feedbacks
            .AsNoTracking()
            .AnyAsync(x => x.FeedbackId == feedbackId && x.UserId == userId);
    }

    public async Task<bool> AddFeedback(Feedback feedback)
    {
        feedback.FeedbackText = feedback.FeedbackText.Trim();

        if (!await _context.Users.AsNoTracking().AnyAsync(x => x.UserId == feedback.UserId))
        {
            return false;
        }

        if (feedback.Date == default)
        {
            feedback.Date = DateTime.UtcNow;
        }

        feedback.User = null;
        _context.Feedbacks.Add(feedback);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteFeedback(int feedbackId)
    {
        var existing = await _context.Feedbacks.FirstOrDefaultAsync(x => x.FeedbackId == feedbackId);
        if (existing is null)
        {
            return false;
        }

        _context.Feedbacks.Remove(existing);
        await _context.SaveChangesAsync();
        return true;
    }
}