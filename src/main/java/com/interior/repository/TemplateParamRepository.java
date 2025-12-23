package com.interior.repository;

import com.interior.model.TemplateParam;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TemplateParamRepository extends JpaRepository<TemplateParam, Long> {
  List<TemplateParam> findByTemplate_IdOrderByParamName(Long templateId);
}

