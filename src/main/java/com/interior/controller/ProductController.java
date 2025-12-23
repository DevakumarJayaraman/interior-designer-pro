package com.interior.controller;

import com.interior.model.Product;
import com.interior.repository.ProductRepository;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {
  private final ProductRepository repo;
  public ProductController(ProductRepository repo) { this.repo = repo; }

  @GetMapping public List<Product> list(@RequestParam(required = false) String category) {
    if (category != null && !category.isBlank()) return repo.findByCategory(category);
    return repo.findAll();
  }

  @GetMapping("/{id}") public Product get(@PathVariable Long id) { return repo.findById(id).orElseThrow(); }

  @PostMapping public Product create(@Valid @RequestBody Product p) { p.setId(null); return repo.save(p); }

  @PutMapping("/{id}")
  public Product update(@PathVariable Long id, @Valid @RequestBody Product p) {
    Product db = repo.findById(id).orElseThrow();
    db.setName(p.getName());
    db.setCategory(p.getCategory());
    db.setPricingModel(p.getPricingModel());
    db.setUnitRate(p.getUnitRate());
    db.setDescription(p.getDescription());
    return repo.save(db);
  }

  @DeleteMapping("/{id}") public void delete(@PathVariable Long id) { repo.deleteById(id); }
}
