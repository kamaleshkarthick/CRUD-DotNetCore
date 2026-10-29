using Microsoft.EntityFrameworkCore;
using ProductApi.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. Register services (dependency injection container)
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// EF Core + SQL Server. The connection string lives in appsettings.json.
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// CORS: the React dev server runs on a different origin (port 3000),
// so the browser blocks calls unless the API explicitly allows that origin.
const string ReactPolicy = "ReactApp";
builder.Services.AddCors(options =>
    options.AddPolicy(ReactPolicy, policy => policy
        .WithOrigins("http://localhost:3000")
        .AllowAnyHeader()
        .AllowAnyMethod()));

var app = builder.Build();

// 2. Configure the HTTP pipeline (middleware runs in this order)
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();   // OpenAPI document at /openapi/v1.json
}

// Return JSON (ProblemDetails) instead of an HTML error page for unhandled exceptions,
// e.g. when the database is unreachable.
app.UseExceptionHandler(errorApp => errorApp.Run(async context =>
{
    context.Response.StatusCode = StatusCodes.Status500InternalServerError;
    await Results.Problem(
        title: "An unexpected error occurred.",
        statusCode: StatusCodes.Status500InternalServerError).ExecuteAsync(context);
}));

app.UseCors(ReactPolicy);
app.UseAuthorization();
app.MapControllers();

app.Run();
