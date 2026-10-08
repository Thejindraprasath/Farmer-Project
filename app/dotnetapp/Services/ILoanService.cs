using dotnetapp.Models;

namespace dotnetapp.Services;

public interface ILoanService
{
    Task<IEnumerable<Loan>> GetAllLoans();
    Task<Loan?> GetLoanById(int loanId);
    Task<bool> AddLoan(Loan loan);
    Task<bool> UpdateLoan(int loanId, Loan loan);
    Task<bool> DeleteLoan(int loanId);
}