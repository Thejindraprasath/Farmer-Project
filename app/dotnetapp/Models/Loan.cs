using System.ComponentModel.DataAnnotations;

namespace dotnetapp.Models;

public class Loan
{
    public int LoanId { get; set; }

    [Required(ErrorMessage = "Loan Type is required")]
    [RegularExpression(@"(?s)^.*\S.*$", ErrorMessage = "Loan Type is required")]
    [MaxLength(100)]
    public string LoanType { get; set; } = string.Empty;

    [Required(ErrorMessage = "Description is required")]
    [RegularExpression(@"(?s)^.*\S.*$", ErrorMessage = "Description is required")]
    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    [Range(0.01, double.MaxValue, ErrorMessage = "Interest Rate must be greater than 0")]
    public decimal InterestRate { get; set; }

    [Range(0.01, double.MaxValue, ErrorMessage = "Maximum Amount must be greater than 0")]
    public decimal MaximumAmount { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Repayment Tenure must be at least 1 month")]
    public int RepaymentTenure { get; set; }

    [Required(ErrorMessage = "Eligibility is required")]
    [RegularExpression(@"(?s)^.*\S.*$", ErrorMessage = "Eligibility is required")]
    [MaxLength(500)]
    public string Eligibility { get; set; } = string.Empty;

    [Required(ErrorMessage = "Documents Required is required")]
    [RegularExpression(@"(?s)^.*\S.*$", ErrorMessage = "Documents Required is required")]
    [MaxLength(500)]
    public string DocumentsRequired { get; set; } = string.Empty;
}
