using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProductApi.Models;

// The entity: EF Core maps this class to the "Products" table in SQL Server.
// Each property becomes a column.
public class Product
{
    public int Id { get; set; }                       // Primary key (IDENTITY by convention)

    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;  // NVARCHAR(100) NOT NULL

    [MaxLength(500)]
    public string? Description { get; set; }          // NVARCHAR(500) NULL

    [Column(TypeName = "decimal(18,2)")]
    public decimal Price { get; set; }                // DECIMAL(18,2)

    public int Quantity { get; set; }                 // INT

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
