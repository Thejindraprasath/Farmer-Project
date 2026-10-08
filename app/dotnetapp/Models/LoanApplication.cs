using System.ComponentModel.DataAnnotations;

namespace dotnetapp.Models;

public class LoanApplication
{
    public int LoanApplicationId { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "A valid user is required")]
    public int UserId { get; set; }
    public User? User { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "A valid loan is required")]
    public int LoanId { get; set; }
    public Loan? Loan { get; set; }

    public DateTime SubmissionDate { get; set; }

    [Range(0, 2, ErrorMessage = "Loan Status must be Pending, Approved, or Rejected")]
    public int LoanStatus { get; set; }

    [Required(ErrorMessage = "Farm Location is required")]
    [RegularExpression(@"(?s)^.*\S.*$", ErrorMessage = "Farm Location is required")]
    [MaxLength(200)]
    public string FarmLocation { get; set; } = string.Empty;

    [Required(ErrorMessage = "Farmer's Address is required")]
    [RegularExpression(@"(?s)^.*\S.*$", ErrorMessage = "Farmer's Address is required")]
    [MaxLength(500)]
    public string FarmerAddress { get; set; } = string.Empty;

    [Range(0.01, double.MaxValue, ErrorMessage = "Farm Size must be greater than 0")]
    public decimal FarmSizeInAcres { get; set; }

    [Required(ErrorMessage = "Farm Purpose is required")]
    [RegularExpression(@"(?s)^.*\S.*$", ErrorMessage = "Farm Purpose is required")]
    [MaxLength(500)]
    public string FarmPurpose { get; set; } = string.Empty;

    [Required(ErrorMessage = "Proof is required")]
    [RegularExpression(@"(?s)^.*\S.*$", ErrorMessage = "Proof is required")]
    public string File { get; set; } = string.Empty;
}
