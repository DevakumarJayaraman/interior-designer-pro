package com.interior.controller;

import com.interior.model.Product;
import com.interior.model.TemplateParam;
import com.interior.repository.ProductRepository;
import com.interior.repository.ProductTemplateRepository;
import com.interior.repository.TemplateParamRepository;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {
  private final ProductRepository repo;
  private final ProductTemplateRepository templateRepository;
  private final TemplateParamRepository templateParamRepository;

  public ProductController(ProductRepository repo,
                          ProductTemplateRepository templateRepository,
                          TemplateParamRepository templateParamRepository) {
    this.repo = repo;
    this.templateRepository = templateRepository;
    this.templateParamRepository = templateParamRepository;
  }

  @GetMapping public List<Product> list(@RequestParam(required = false) String category) {
    if (category != null && !category.isBlank()) return repo.findByCategory(category);
    return repo.findAll();
  }

  @GetMapping("/{id}") public Product get(@PathVariable Long id) { return repo.findById(id).orElseThrow(); }

  @PostMapping public Product create(@Valid @RequestBody Product p) {
    p.setId(null);
    return repo.save(p);
  }

  @PutMapping("/{id}")
  public Product update(@PathVariable Long id, @Valid @RequestBody Product p) {
    Product db = repo.findById(id).orElseThrow();
    db.setName(p.getName());
    db.setCategory(p.getCategory());
    db.setPricingModel(p.getPricingModel());
    db.setUnitRate(p.getUnitRate());
    db.setDescription(p.getDescription());
    db.setTemplate(p.getTemplate());
    return repo.save(db);
  }

  @DeleteMapping("/{id}") public void delete(@PathVariable Long id) { repo.deleteById(id); }

  @GetMapping("/{id}/template-params")
  public List<TemplateParam> getProductTemplateParams(@PathVariable Long id) {
    Product product = repo.findById(id).orElseThrow();
    if (product.getTemplate() == null) {
      return Collections.emptyList();
    }
    return templateParamRepository.findByTemplate_IdOrderByParamName(product.getTemplate().getId());
  }
}
