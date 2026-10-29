using System.ComponentModel.DataAnnotations;

namespace ProductApi.Dtos;

// What the client is allowed to send for Create and Update.
// Using a DTO (instead of the entity) means clients can't set Id, CreatedAt, etc.
// The [ApiController] attribute validates these rules automatically and returns
// 400 Bad Request with the error messages if any rule fails.
public class ProductRequest
{
    [Required(ErrorMessage = "Name is required.")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Name must be 2-100 characters.")]
    public string Name { get; set; } = string.Empty;

    [StringLength(500, ErrorMessage = "Description can be at most 500 characters.")]
    public string? Description { get; set; }

    [Range(0.01, 1_000_000, ErrorMessage = "Price must be between 0.01 and 1,000,000.")]
    public decimal Price { get; set; }

    [Range(0, 100_000, ErrorMessage = "Quantity must be between 0 and 100,000.")]
    public int Quantity { get; set; }
}
