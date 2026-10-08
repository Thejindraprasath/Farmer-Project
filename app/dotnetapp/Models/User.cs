using System.ComponentModel.DataAnnotations;

namespace dotnetapp.Models;

public class User
{
    public int UserId { get; set; }

    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Please enter a valid email address")]
    [RegularExpression(@"^[^\s@]+@[^\s@]+\.[^\s@]{2,}$", ErrorMessage = "Please enter a valid email address")]
    [MaxLength(254)]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password is required")]
    [MinLength(6, ErrorMessage = "Password must be at least 6 characters")]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$",
        ErrorMessage = "Password must include at least one uppercase letter, one lowercase letter, one digit, and one special character")]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "Username is required")]
    [RegularExpression(@"(?s)^.*\S.*$", ErrorMessage = "Username is required")]
    [MaxLength(30, ErrorMessage = "Username cannot exceed 30 characters")]
    public string Username { get; set; } = string.Empty;

    [Required(ErrorMessage = "Mobile number is required")]
    [RegularExpression(@"^\d{10}$", ErrorMessage = "Mobile number must be 10 digits")]
    public string MobileNumber { get; set; } = string.Empty;

    [Required(ErrorMessage = "Role is required")]
    [RegularExpression(@"^(Admin|User)$", ErrorMessage = "Role must be Admin or User")]
    public string UserRole { get; set; } = string.Empty;
}
