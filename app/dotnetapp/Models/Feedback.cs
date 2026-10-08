using System.ComponentModel.DataAnnotations;

namespace dotnetapp.Models;

public class Feedback
{
    public int FeedbackId { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "A valid user is required")]
    public int UserId { get; set; }
    public User? User { get; set; }

    [Required(ErrorMessage = "Feedback is required")]
    [RegularExpression(@"(?s)^.*\S.*$", ErrorMessage = "Feedback is required")]
    [MaxLength(1000, ErrorMessage = "Feedback cannot exceed 1000 characters")]
    public string FeedbackText { get; set; } = string.Empty;

    public DateTime Date { get; set; }
}
