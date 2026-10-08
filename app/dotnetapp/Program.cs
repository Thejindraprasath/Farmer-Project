using System.Text;
using dotnetapp.Data;
using dotnetapp.Models;
using dotnetapp.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// SRS platform prerequisite: backend must listen on port 8080.
builder.WebHost.UseUrls("http://0.0.0.0:8080");

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.PropertyNamingPolicy = null;
        options.JsonSerializerOptions.DictionaryKeyPolicy = null;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });

builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var message = context.ModelState.Values
            .SelectMany(value => value.Errors)
            .Select(error => error.ErrorMessage)
            .FirstOrDefault(text => !string.IsNullOrWhiteSpace(text))
            ?? "Invalid request data";

        return new BadRequestObjectResult(new { message });
    };
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services
    .AddIdentity<ApplicationUser, IdentityRole>(options =>
    {
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireNonAlphanumeric = true;
        options.Password.RequiredLength = 6;
        options.User.RequireUniqueEmail = true;
    })
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

var jwtKey = builder.Configuration["Jwt:Key"] ?? "FarmFinancer_Development_Key_Change_In_Production_2026";
var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = signingKey,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();
builder.Services.AddScoped<ILoanService, LoanService>();
builder.Services.AddScoped<ILoanApplicationService, LoanApplicationService>();
builder.Services.AddScoped<IFeedbackService, FeedbackService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IErrorLogService, ErrorLogService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAngular");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
