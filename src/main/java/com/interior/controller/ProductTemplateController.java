package com.interior.controller;

import com.interior.model.*;
import com.interior.repository.*;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/templates")
public class ProductTemplateController {

  private final ProductTemplateRepository templateRepository;
  private final TemplateParamRepository paramRepository;
  private final TemplateDerivedVarRepository derivedVarRepository;
  private final TemplatePartRuleRepository partRuleRepository;
  private final TemplateValidationRuleRepository validationRuleRepository;

  public ProductTemplateController(
      ProductTemplateRepository templateRepository,
      TemplateParamRepository paramRepository,
      TemplateDerivedVarRepository derivedVarRepository,
      TemplatePartRuleRepository partRuleRepository,
      TemplateValidationRuleRepository validationRuleRepository) {
    this.templateRepository = templateRepository;
    this.paramRepository = paramRepository;
    this.derivedVarRepository = derivedVarRepository;
    this.partRuleRepository = partRuleRepository;
    this.validationRuleRepository = validationRuleRepository;
  }

  @GetMapping
  public List<ProductTemplate> listTemplates() {
    return templateRepository.findAll();
  }

  @GetMapping("/{id}")
  public Map<String, Object> getTemplate(@PathVariable Long id) {
    ProductTemplate template = templateRepository.findById(id).orElseThrow();
    Map<String, Object> result = new HashMap<>();
    result.put("template", template);
    result.put("params", paramRepository.findByTemplate_IdOrderByParamName(id));
    result.put("derivedVars", derivedVarRepository.findByTemplate_IdOrderByExecutionOrder(id));
    result.put("partRules", partRuleRepository.findByTemplate_IdOrderByExecutionOrder(id));
    result.put("validationRules", validationRuleRepository.findByTemplate_Id(id));
    return result;
  }

  @GetMapping("/{id}/params")
  public List<TemplateParam> getTemplateParams(@PathVariable Long id) {
    return paramRepository.findByTemplate_IdOrderByParamName(id);
  }

  @PostMapping
  public ProductTemplate createTemplate(@RequestBody ProductTemplate template) {
    return templateRepository.save(template);
  }
}

