package com.interior.repository;

import com.interior.model.TemplateValidationRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TemplateValidationRuleRepository extends JpaRepository<TemplateValidationRule, Long> {
  List<TemplateValidationRule> findByTemplate_Id(Long templateId);
}

