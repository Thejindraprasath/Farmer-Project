using dotnetapp.Data;
using dotnetapp.Exceptions;
using dotnetapp.Models;
using Microsoft.EntityFrameworkCore;

namespace dotnetapp.Services;

public class LoanApplicationService : ILoanApplicationService
{
    private readonly ApplicationDbContext _context;

    public LoanApplicationService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<LoanApplication>> GetAllLoanApplications()
    {
        return await _context.LoanApplications
            .Include(x => x.User)
            .Include(x => x.Loan)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<IEnumerable<LoanApplication>> GetLoanApplicationsByUserId(int userId)
    {
        return await _context.LoanApplications
            .Where(x => x.UserId == userId)
            .Include(x => x.User)
            .Include(x => x.Loan)
            .AsNoTracking()
            .ToListAsync();
    }

    public Task<LoanApplication?> GetLoanApplicationById(int loanApplicationId)
    {
        return _context.LoanApplications
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.LoanApplicationId == loanApplicationId);
    }

    public Task<bool> LoanApplicationBelongsToUser(int loanApplicationId, int userId)
    {
        return _context.LoanApplications
            .AsNoTracking()
            .AnyAsync(x => x.LoanApplicationId == loanApplicationId && x.UserId == userId);
    }

    public async Task<bool> AddLoanApplication(LoanApplication loanApplication)
    {
        NormalizeApplication(loanApplication);

        if (!await _context.Users.AsNoTracking().AnyAsync(x => x.UserId == loanApplication.UserId))
        {
            throw new LoanException("Cannot find user");
        }

        if (!await _context.Loans.AsNoTracking().AnyAsync(x => x.LoanId == loanApplication.LoanId))
        {
            throw new LoanException("Cannot find any loan");
        }

        var alreadyApplied = await _context.LoanApplications.AsNoTracking().AnyAsync(x =>
            x.LoanId == loanApplication.LoanId && x.UserId == loanApplication.UserId);

        if (alreadyApplied)
        {
            throw new LoanException("User already applied for this loan");
        }

        if (loanApplication.SubmissionDate == default)
        {
            loanApplication.SubmissionDate = DateTime.UtcNow;
        }

        loanApplication.User = null;
        loanApplication.Loan = null;
        _context.LoanApplications.Add(loanApplication);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateLoanApplication(int loanApplicationId, LoanApplication loanApplication)
    {
        var existing = await _context.LoanApplications
            .FirstOrDefaultAsync(x => x.LoanApplicationId == loanApplicationId);

        if (existing is null)
        {
            return false;
        }

        NormalizeApplication(loanApplication);

        if (!await _context.Users.AsNoTracking().AnyAsync(x => x.UserId == loanApplication.UserId)
            || !await _context.Loans.AsNoTracking().AnyAsync(x => x.LoanId == loanApplication.LoanId))
        {
            throw new LoanException("Invalid user or loan reference");
        }

        var duplicate = await _context.LoanApplications.AsNoTracking().AnyAsync(x =>
            x.LoanApplicationId != loanApplicationId
            && x.UserId == loanApplication.UserId
            && x.LoanId == loanApplication.LoanId);

        if (duplicate)
        {
            throw new LoanException("User already applied for this loan");
        }

        existing.UserId = loanApplication.UserId;
        existing.LoanId = loanApplication.LoanId;
        existing.SubmissionDate = loanApplication.SubmissionDate == default ? existing.SubmissionDate : loanApplication.SubmissionDate;
        existing.LoanStatus = loanApplication.LoanStatus;
        existing.FarmLocation = loanApplication.FarmLocation;
        existing.FarmerAddress = loanApplication.FarmerAddress;
        existing.FarmSizeInAcres = loanApplication.FarmSizeInAcres;
        existing.FarmPurpose = loanApplication.FarmPurpose;
        existing.File = loanApplication.File;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteLoanApplication(int loanApplicationId)
    {
        var existing = await _context.LoanApplications
            .FirstOrDefaultAsync(x => x.LoanApplicationId == loanApplicationId);

        if (existing is null)
        {
            return false;
        }

        _context.LoanApplications.Remove(existing);
        await _context.SaveChangesAsync();
        return true;
    }

    private static void NormalizeApplication(LoanApplication loanApplication)
    {
        loanApplication.FarmLocation = loanApplication.FarmLocation.Trim();
        loanApplication.FarmerAddress = loanApplication.FarmerAddress.Trim();
        loanApplication.FarmPurpose = loanApplication.FarmPurpose.Trim();
        loanApplication.File = loanApplication.File.Trim();
    }
}
