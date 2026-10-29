using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductApi.Data;
using ProductApi.Dtos;
using ProductApi.Models;

namespace ProductApi.Controllers;

// [ApiController] turns on automatic model validation (400 on bad input)
// and binds JSON request bodies to parameters.
// [Route] makes every action live under /api/products.
[ApiController]
[Route("api/[controller]")]
public class ProductsController(AppDbContext db) : ControllerBase
{
    // READ ALL: GET /api/products
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetAll()
    {
        var products = await db.Products
            .AsNoTracking()               // read-only query, a bit faster
            .OrderBy(p => p.Id)
            .ToListAsync();
        return Ok(products);              // 200 + JSON array
    }

    // READ ONE: GET /api/products/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Product>> GetById(int id)
    {
        var product = await db.Products.FindAsync(id);
        if (product is null) return NotFound(new { message = $"Product {id} not found." });
        return Ok(product);
    }

    // CREATE: POST /api/products
    [HttpPost]
    public async Task<ActionResult<Product>> Create(ProductRequest request)
    {
        var product = new Product
        {
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            Price = request.Price,
            Quantity = request.Quantity
        };

        db.Products.Add(product);
        await db.SaveChangesAsync();      // INSERT runs here; product.Id is filled in

        // 201 Created + a Location header pointing to GET /api/products/{id}
        return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
    }

    // UPDATE: PUT /api/products/5
    [HttpPut("{id:int}")]
    public async Task<ActionResult<Product>> Update(int id, ProductRequest request)
    {
        var product = await db.Products.FindAsync(id);
        if (product is null) return NotFound(new { message = $"Product {id} not found." });

        product.Name = request.Name.Trim();
        product.Description = request.Description?.Trim();
        product.Price = request.Price;
        product.Quantity = request.Quantity;
        product.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();      // EF tracks changes and issues an UPDATE
        return Ok(product);
    }

    // DELETE: DELETE /api/products/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var product = await db.Products.FindAsync(id);
        if (product is null) return NotFound(new { message = $"Product {id} not found." });

        db.Products.Remove(product);
        await db.SaveChangesAsync();
        return NoContent();               // 204, nothing to return
    }
}
