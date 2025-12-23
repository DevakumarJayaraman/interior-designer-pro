package com.interior.repository;

import com.interior.model.ProductTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductTemplateRepository extends JpaRepository<ProductTemplate, Long> {
  Optional<ProductTemplate> findByCode(String code);
  List<ProductTemplate> findByCategory(String category);
}

