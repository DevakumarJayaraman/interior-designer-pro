package com.interior.repository;

import com.interior.model.TemplatePartRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TemplatePartRuleRepository extends JpaRepository<TemplatePartRule, Long> {
  List<TemplatePartRule> findByTemplate_IdOrderByExecutionOrder(Long templateId);
}

