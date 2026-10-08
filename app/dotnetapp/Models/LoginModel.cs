using System.ComponentModel.DataAnnotations;

namespace dotnetapp.Models;

public class LoginModel
{
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Please enter a valid email address")]
    [RegularExpression(@"^[^\s@]+@[^\s@]+\.[^\s@]{2,}$", ErrorMessage = "Please enter a valid email address")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password is required")]
    public string Password { get; set; } = string.Empty;
}
