using dotnetapp.Models;

namespace dotnetapp.Services;

public interface ILoanApplicationService
{
    Task<IEnumerable<LoanApplication>> GetAllLoanApplications();
    Task<IEnumerable<LoanApplication>> GetLoanApplicationsByUserId(int userId);
    Task<LoanApplication?> GetLoanApplicationById(int loanApplicationId);
    Task<bool> LoanApplicationBelongsToUser(int loanApplicationId, int userId);
    Task<bool> AddLoanApplication(LoanApplication loanApplication);
    Task<bool> UpdateLoanApplication(int loanApplicationId, LoanApplication loanApplication);
    Task<bool> DeleteLoanApplication(int loanApplicationId);
}