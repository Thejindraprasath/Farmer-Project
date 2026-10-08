using dotnetapp.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace dotnetapp.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Loan> Loans => Set<Loan>();
    public DbSet<LoanApplication> LoanApplications => Set<LoanApplication>();
    public DbSet<Feedback> Feedbacks => Set<Feedback>();
    public DbSet<ErrorLog> ErrorLogs => Set<ErrorLog>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        builder.Entity<Loan>()
            .HasIndex(l => l.LoanType)
            .IsUnique();

        builder.Entity<LoanApplication>()
            .HasIndex(x => new { x.UserId, x.LoanId })
            .IsUnique();

        builder.Entity<Feedback>()
            .HasIndex(x => x.UserId);

        builder.Entity<LoanApplication>()
            .HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<LoanApplication>()
            .HasOne(x => x.Loan)
            .WithMany()
            .HasForeignKey(x => x.LoanId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Feedback>()
            .HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

 