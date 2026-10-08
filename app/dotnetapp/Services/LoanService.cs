using dotnetapp.Data;
using dotnetapp.Exceptions;
using dotnetapp.Models;
using Microsoft.EntityFrameworkCore;

namespace dotnetapp.Services;

public class LoanService : ILoanService
{
    private readonly ApplicationDbContext _context;

    public LoanService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Loan>> GetAllLoans()
    {
        return await _context.Loans
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Loan?> GetLoanById(int loanId)
    {
        return await _context.Loans.AsNoTracking().FirstOrDefaultAsync(x => x.LoanId == loanId);
    }

    public async Task<bool> AddLoan(Loan loan)
    {
        NormalizeLoan(loan);
        var normalizedType = loan.LoanType.ToLower();
        var exists = await _context.Loans.AsNoTracking().AnyAsync(x => x.LoanType.ToLower() == normalizedType);
        if (exists)
        {
            throw new LoanException("Loan with the same type already exists");
        }

        _context.Loans.Add(loan);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateLoan(int loanId, Loan loan)
    {
        var existing = await _context.Loans.FirstOrDefaultAsync(x => x.LoanId == loanId);
        if (existing is null)
        {
            return false;
        }

        NormalizeLoan(loan);
        var normalizedType = loan.LoanType.ToLower();
        var duplicate = await _context.Loans.AsNoTracking().AnyAsync(x =>
            x.LoanId != loanId && x.LoanType.ToLower() == normalizedType);

        if (duplicate)
        {
            throw new LoanException("Loan with the same type already exists");
        }

        existing.LoanType = loan.LoanType;
        existing.Description = loan.Description;
        existing.InterestRate = loan.InterestRate;
        existing.MaximumAmount = loan.MaximumAmount;
        existing.RepaymentTenure = loan.RepaymentTenure;
        existing.Eligibility = loan.Eligibility;
        existing.DocumentsRequired = loan.DocumentsRequired;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteLoan(int loanId)
    {
        var existing = await _context.Loans.FirstOrDefaultAsync(x => x.LoanId == loanId);
        if (existing is null)
        {
            return false;
        }

        var referenced = await _context.LoanApplications.AsNoTracking().AnyAsync(x => x.LoanId == loanId);
        if (referenced)
        {
            throw new LoanException("Loan cannot be deleted, it is referenced in loanapplication");
        }

        _context.Loans.Remove(existing);
        await _context.SaveChangesAsync();
        return true;
    }

    private static void NormalizeLoan(Loan loan)
    {
        loan.LoanType = loan.LoanType.Trim();
        loan.Description = loan.Description.Trim();
        loan.Eligibility = loan.Eligibility.Trim();
        loan.DocumentsRequired = loan.DocumentsRequired.Trim();
    }
}