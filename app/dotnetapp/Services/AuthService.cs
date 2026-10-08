using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using dotnetapp.Data;
using dotnetapp.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace dotnetapp.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly IConfiguration _configuration;
    private readonly ApplicationDbContext _context;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        IConfiguration configuration,
        ApplicationDbContext context)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _configuration = configuration;
        _context = context;
    }

    public async Task<(int, string)> Registration(User model, string role)
    {
        model.Email = model.Email.Trim().ToLowerInvariant();
        model.Username = model.Username.Trim();
        model.MobileNumber = model.MobileNumber.Trim();
        model.UserRole = model.UserRole.Trim();

        var existing = await _userManager.FindByEmailAsync(model.Email);
        if (existing is not null || await _context.Users.AsNoTracking().AnyAsync(x => x.Email == model.Email))
        {
            return (0, "User already exists");
        }

        await using var transaction = await _context.Database.BeginTransactionAsync();

        var appUser = new ApplicationUser
        {
            Email = model.Email,
            UserName = model.Email,
            Name = model.Username,
            PhoneNumber = model.MobileNumber,
            SecurityStamp = Guid.NewGuid().ToString()
        };

        var result = await _userManager.CreateAsync(appUser, model.Password);
        if (!result.Succeeded)
        {
            return (0, "User creation failed! Please check user details and try again.");
        }

        var selectedRole = string.Equals(model.UserRole, UserRoles.Admin, StringComparison.OrdinalIgnoreCase)
            ? UserRoles.Admin
            : UserRoles.User;

        if (!await _roleManager.RoleExistsAsync(selectedRole))
        {
            var roleResult = await _roleManager.CreateAsync(new IdentityRole(selectedRole));
            if (!roleResult.Succeeded)
            {
                return (0, "User creation failed! Please check user details and try again.");
            }
        }

        var roleAssignment = await _userManager.AddToRoleAsync(appUser, selectedRole);
        if (!roleAssignment.Succeeded)
        {
            return (0, "User creation failed! Please check user details and try again.");
        }

        model.UserRole = selectedRole;
        // Authentication is handled by ASP.NET Identity; never duplicate the raw password in the domain table.
        model.Password = string.Empty;
        _context.Users.Add(model);
        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        return (1, "User created successfully!");
    }

    public async Task<(int, string)> Login(LoginModel model)
    {
        model.Email = model.Email.Trim().ToLowerInvariant();
        var user = await _userManager.FindByEmailAsync(model.Email);
        if (user is null)
        {
            return (0, "Invalid email");
        }

        if (!await _userManager.CheckPasswordAsync(user, model.Password))
        {
            return (0, "Invalid password");
        }

        var roles = await _userManager.GetRolesAsync(user);
        var domainUser = await _context.Users.FirstOrDefaultAsync(x => x.Email == model.Email);
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Name, user.UserName ?? user.Email ?? string.Empty),
            new(ClaimTypes.Email, user.Email ?? string.Empty),
            new("username", user.Name ?? domainUser?.Username ?? user.Email ?? string.Empty),
            new("userId", domainUser?.UserId.ToString() ?? "0"),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };
        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        var token = GenerateToken(claims);
        return (1, token);
    }

    private string GenerateToken(IEnumerable<Claim> claims)
    {
        var key = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key is not configured.");
        var issuer = _configuration["Jwt:Issuer"];
        var audience = _configuration["Jwt:Audience"];

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(4),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
