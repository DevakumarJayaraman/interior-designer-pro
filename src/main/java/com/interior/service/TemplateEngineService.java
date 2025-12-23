package com.interior.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.interior.model.*;
import com.interior.repository.*;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Template Engine Service - Generates cutlist items from product templates.
 * Implements 8-step flow from TEMPLATE_ENGINE.md.
 */
@Service
public class TemplateEngineService {

  private final ExpressionEvaluatorService expressionEvaluator;
  private final TemplateParamRepository templateParamRepository;
  private final TemplateDerivedVarRepository templateDerivedVarRepository;
  private final TemplatePartRuleRepository templatePartRuleRepository;
  private final TemplateValidationRuleRepository templateValidationRuleRepository;
  private final ObjectMapper objectMapper;

  public TemplateEngineService(
      ExpressionEvaluatorService expressionEvaluator,
      TemplateParamRepository templateParamRepository,
      TemplateDerivedVarRepository templateDerivedVarRepository,
      TemplatePartRuleRepository templatePartRuleRepository,
      TemplateValidationRuleRepository templateValidationRuleRepository,
      ObjectMapper objectMapper) {
    this.expressionEvaluator = expressionEvaluator;
    this.templateParamRepository = templateParamRepository;
    this.templateDerivedVarRepository = templateDerivedVarRepository;
    this.templatePartRuleRepository = templatePartRuleRepository;
    this.templateValidationRuleRepository = templateValidationRuleRepository;
    this.objectMapper = objectMapper;
  }

  /**
   * Generate cutlist items for a quote item using its product template.
   * Returns empty list if no template is assigned.
   */
  public List<CutlistItem> generateCutlistForQuoteItem(QuoteItem item) {
    Product product = item.getProduct();
    if (product == null || product.getTemplate() == null) {
      return Collections.emptyList(); // No template - fallback to legacy logic
    }

    ProductTemplate template = product.getTemplate();

    try {
      // Step 1: Resolve ProductTemplate (already done above)

      // Step 2: Build base vars (W, H, D, T, BACK_T, PLINTH)
      Map<String, Double> vars = buildBaseVars(item, template);

      // Step 3: Load template params with defaults
      List<TemplateParam> params = templateParamRepository.findByTemplate_IdOrderByParamName(template.getId());
      for (TemplateParam param : params) {
        if (param.getDefaultValue() != null) {
          vars.put(param.getParamName(), param.getDefaultValue());
        }
      }

      // Step 4: Apply user overrides from templateParamsJson
      applyUserOverrides(item, vars);

      // Step 5: Compute derived variables in order
      applyDerivedVars(vars, template.getId());

      // Step 6: Run validations
      validateRules(vars, template.getId());

      // Step 7: Generate parts
      List<CutlistItem> cutlistItems = generateParts(item, vars, template.getId());

      // Step 8: Return (caller will persist)
      return cutlistItems;

    } catch (ExpressionEvaluatorService.ExpressionException e) {
      throw new TemplateEngineException("Template evaluation error for product '" + product.getName() + "': " + e.getMessage(), e);
    } catch (Exception e) {
      throw new TemplateEngineException("Unexpected error generating cutlist for product '" + product.getName() + "': " + e.getMessage(), e);
    }
  }

  /**
   * Build base variable context from quote item dimensions and template settings.
   */
  private Map<String, Double> buildBaseVars(QuoteItem item, ProductTemplate template) {
    Map<String, Double> vars = new HashMap<>();

    // Base dimensions from quote item
    vars.put("W", item.getWidth() != null ? item.getWidth() : 0.0);
    vars.put("H", item.getHeight() != null ? item.getHeight() : 0.0);
    vars.put("D", item.getDepth() != null ? item.getDepth() : 0.0);

    // Material specifications from template
    vars.put("T", template.getBaseThickness() != null ? template.getBaseThickness() : 18.0);
    vars.put("BACK_T", template.getBackPanelThickness() != null ? template.getBackPanelThickness() : 6.0);
    vars.put("PLINTH", template.getPlinthHeight() != null ? template.getPlinthHeight() : 100.0);

    return vars;
  }

  /**
   * Apply user parameter overrides from QuoteItem.templateParamsJson.
   */
  private void applyUserOverrides(QuoteItem item, Map<String, Double> vars) {
    String json = item.getTemplateParamsJson();
    if (json != null && !json.trim().isEmpty()) {
      try {
        Map<String, Object> overrides = objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        for (Map.Entry<String, Object> entry : overrides.entrySet()) {
          Object value = entry.getValue();
          if (value instanceof Number) {
            vars.put(entry.getKey(), ((Number) value).doubleValue());
          }
        }
      } catch (Exception e) {
        throw new TemplateEngineException("Failed to parse templateParamsJson: " + e.getMessage(), e);
      }
    }
  }

  /**
   * Compute derived variables in execution order.
   */
  private void applyDerivedVars(Map<String, Double> vars, Long templateId) {
    List<TemplateDerivedVar> derivedVars = templateDerivedVarRepository.findByTemplate_IdOrderByExecutionOrder(templateId);
    for (TemplateDerivedVar derivedVar : derivedVars) {
      try {
        Double value = expressionEvaluator.evaluateNumeric(derivedVar.getExpression(), vars);
        vars.put(derivedVar.getVarName(), value);
      } catch (Exception e) {
        throw new TemplateEngineException("Error evaluating derived var '" + derivedVar.getVarName() + "': " + e.getMessage(), e);
      }
    }
  }

  /**
   * Validate rules - throw exception if any validation fails.
   */
  private void validateRules(Map<String, Double> vars, Long templateId) {
    List<TemplateValidationRule> rules = templateValidationRuleRepository.findByTemplate_Id(templateId);
    for (TemplateValidationRule rule : rules) {
      try {
        Boolean isValid = expressionEvaluator.evaluateBoolean(rule.getConditionExpr(), vars);
        if (!isValid) {
          throw new TemplateEngineException("Validation failed: " + rule.getErrorMessage());
        }
      } catch (ExpressionEvaluatorService.ExpressionException e) {
        throw new TemplateEngineException("Error in validation rule: " + e.getMessage(), e);
      }
    }
  }

  /**
   * Generate cutlist items from part rules.
   */
  private List<CutlistItem> generateParts(QuoteItem quoteItem, Map<String, Double> vars, Long templateId) {
    List<TemplatePartRule> partRules = templatePartRuleRepository.findByTemplate_IdOrderByExecutionOrder(templateId);
    List<CutlistItem> cutlistItems = new ArrayList<>();

    for (TemplatePartRule rule : partRules) {
      try {
        Double width = expressionEvaluator.evaluateNumeric(rule.getWidthExpr(), vars);
        Double height = expressionEvaluator.evaluateNumeric(rule.getHeightExpr(), vars);
        Double thickness = rule.getThicknessExpr() != null
            ? expressionEvaluator.evaluateNumeric(rule.getThicknessExpr(), vars)
            : vars.get("T");
        Double qtyDouble = expressionEvaluator.evaluateNumeric(rule.getQtyExpr(), vars);
        int qty = qtyDouble.intValue();

        if (qty <= 0) continue; // Skip parts with zero or negative quantity

        CutlistItem item = new CutlistItem();
        item.setQuoteItem(quoteItem);
        item.setPartName(rule.getPartName());
        item.setPartType(rule.getPartType());
        item.setCutWidth(width);
        item.setCutHeight(height);
        item.setThickness(thickness);
        item.setQuantity(qty);
        item.setMaterialType(rule.getMaterialType());
        item.setEdgeBanding(rule.getEdgeBanding());
        item.setGrainDirection(rule.getGrainDirection());

        cutlistItems.add(item);

      } catch (Exception e) {
        throw new TemplateEngineException("Error generating part '" + rule.getPartName() + "': " + e.getMessage(), e);
      }
    }

    return cutlistItems;
  }

  public static class TemplateEngineException extends RuntimeException {
    public TemplateEngineException(String message) {
      super(message);
    }
    public TemplateEngineException(String message, Throwable cause) {
      super(message, cause);
    }
  }
}

