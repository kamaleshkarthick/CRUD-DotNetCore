using Microsoft.EntityFrameworkCore;
using ProductApi.Models;

namespace ProductApi.Data;

// The DbContext is EF Core's "session" with the database.
// Each DbSet<T> represents a table you can query and save to.
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // A little seed data so the table isn't empty on first run.
        modelBuilder.Entity<Product>().HasData(
            new Product { Id = 1, Name = "Wireless Mouse", Description = "Ergonomic 2.4GHz mouse", Price = 24.99m, Quantity = 50, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 2, Name = "Mechanical Keyboard", Description = "Tenkeyless, brown switches", Price = 89.00m, Quantity = 20, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
        );
    }
}
