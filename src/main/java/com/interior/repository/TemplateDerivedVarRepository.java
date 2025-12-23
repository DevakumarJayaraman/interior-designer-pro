package com.interior.repository;

import com.interior.model.TemplateDerivedVar;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TemplateDerivedVarRepository extends JpaRepository<TemplateDerivedVar, Long> {
  List<TemplateDerivedVar> findByTemplate_IdOrderByExecutionOrder(Long templateId);
}

