package com.interior.config;

import com.interior.model.*;
import com.interior.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeeder {

  @Bean
  CommandLineRunner seedData(
      ProductRepository products,
      ProductTemplateRepository templates,
      TemplateParamRepository params,
      TemplateDerivedVarRepository derivedVars,
      TemplatePartRuleRepository partRules,
      TemplateValidationRuleRepository validationRules) {
    return args -> {
      if (products.count() > 0) return;

      // Create KITCHEN_BASE template
      ProductTemplate kitchenBase = new ProductTemplate();
      kitchenBase.setCode("KITCHEN_BASE");
      kitchenBase.setName("Kitchen Base Cabinet");
      kitchenBase.setCategory("Kitchen");
      kitchenBase.setDescription("Standard kitchen base cabinet with configurable shelves and doors");
      kitchenBase.setBaseThickness(18.0);
      kitchenBase.setBackPanelThickness(6.0);
      kitchenBase.setPlinthHeight(100.0);
      kitchenBase.setVersion(1);
      kitchenBase = templates.save(kitchenBase);

      // Kitchen Base Params
      params.save(makeParam(kitchenBase, "SHELF_COUNT", 1.0, 0.0, 5.0, false, "Number of Shelves", "Internal shelves (0-5)"));
      params.save(makeParam(kitchenBase, "DOOR_COUNT", 1.0, 1.0, 2.0, true, "Number of Doors", "1 or 2 doors"));

      // Kitchen Base Derived Vars
      derivedVars.save(makeDerivedVar(kitchenBase, "INTERNAL_W", "W - 2*T", 1));
      derivedVars.save(makeDerivedVar(kitchenBase, "INTERNAL_D", "D - T", 2));
      derivedVars.save(makeDerivedVar(kitchenBase, "OPEN_H", "H - PLINTH - T", 3));

      // Kitchen Base Validation
      validationRules.save(makeValidation(kitchenBase, "DOOR_COUNT >= 1 && DOOR_COUNT <= 2", "Door count must be 1 or 2"));
      validationRules.save(makeValidation(kitchenBase, "W > 0 && H > 0 && D > 0", "Dimensions must be positive"));

      // Kitchen Base Part Rules
      partRules.save(makePartRule(kitchenBase, "Side Panel", "CARCASS", "D", "H", "T", "2", "18mm Plywood", "FRONT_ONLY", "VERTICAL", 1));
      partRules.save(makePartRule(kitchenBase, "Bottom Panel", "CARCASS", "INTERNAL_W", "INTERNAL_D", "T", "1", "18mm Plywood", "FRONT_ONLY", "HORIZONTAL", 2));
      partRules.save(makePartRule(kitchenBase, "Top Panel", "CARCASS", "INTERNAL_W", "INTERNAL_D", "T", "1", "18mm Plywood", "FRONT_ONLY", "HORIZONTAL", 3));
      partRules.save(makePartRule(kitchenBase, "Shelf", "CARCASS", "INTERNAL_W", "INTERNAL_D", "T", "SHELF_COUNT", "18mm Plywood", "FRONT_ONLY", "HORIZONTAL", 4));
      partRules.save(makePartRule(kitchenBase, "Back Panel", "BACK", "W", "H", "BACK_T", "1", "6mm Back Panel", "NONE", "VERTICAL", 5));
      partRules.save(makePartRule(kitchenBase, "Shutter", "SHUTTER", "W/DOOR_COUNT", "OPEN_H", "T", "DOOR_COUNT", "18mm Plywood", "ALL", "VERTICAL", 6));

      // Create WARDROBE_2_SPLIT template
      ProductTemplate wardrobe2Split = new ProductTemplate();
      wardrobe2Split.setCode("WARDROBE_2_SPLIT");
      wardrobe2Split.setName("2-Split Wardrobe");
      wardrobe2Split.setCategory("Wardrobe");
      wardrobe2Split.setDescription("Wardrobe with 2 vertical splits, configurable shelves");
      wardrobe2Split.setBaseThickness(18.0);
      wardrobe2Split.setBackPanelThickness(6.0);
      wardrobe2Split.setPlinthHeight(100.0);
      wardrobe2Split.setVersion(1);
      wardrobe2Split = templates.save(wardrobe2Split);

      // Wardrobe Params
      params.save(makeParam(wardrobe2Split, "SPLIT_COUNT", 2.0, 2.0, 2.0, true, "Number of Splits", "Vertical splits"));
      params.save(makeParam(wardrobe2Split, "SHELF_COUNT", 4.0, 0.0, 10.0, false, "Shelves per Split", "Number of shelves"));
      params.save(makeParam(wardrobe2Split, "DRAWER_COUNT", 0.0, 0.0, 5.0, false, "Number of Drawers", "Drawers in bottom"));

      // Wardrobe Derived Vars
      derivedVars.save(makeDerivedVar(wardrobe2Split, "INTERNAL_W", "W - 2*T", 1));
      derivedVars.save(makeDerivedVar(wardrobe2Split, "INTERNAL_D", "D - T", 2));
      derivedVars.save(makeDerivedVar(wardrobe2Split, "INTERNAL_H", "H - 2*T", 3));
      derivedVars.save(makeDerivedVar(wardrobe2Split, "PARTITION_COUNT", "SPLIT_COUNT - 1", 4));
      derivedVars.save(makeDerivedVar(wardrobe2Split, "BAY_W", "(INTERNAL_W - PARTITION_COUNT*T) / SPLIT_COUNT", 5));

      // Wardrobe Validation
      validationRules.save(makeValidation(wardrobe2Split, "SPLIT_COUNT == 2", "This template supports 2 splits only"));
      validationRules.save(makeValidation(wardrobe2Split, "W > 0 && H > 0 && D > 0", "Dimensions must be positive"));

      // Wardrobe Part Rules
      partRules.save(makePartRule(wardrobe2Split, "Side Panel", "CARCASS", "D", "H", "T", "2", "18mm Plywood", "FRONT_ONLY", "VERTICAL", 1));
      partRules.save(makePartRule(wardrobe2Split, "Top Panel", "CARCASS", "INTERNAL_W", "INTERNAL_D", "T", "1", "18mm Plywood", "FRONT_ONLY", "HORIZONTAL", 2));
      partRules.save(makePartRule(wardrobe2Split, "Bottom Panel", "CARCASS", "INTERNAL_W", "INTERNAL_D", "T", "1", "18mm Plywood", "FRONT_ONLY", "HORIZONTAL", 3));
      partRules.save(makePartRule(wardrobe2Split, "Partition", "CARCASS", "INTERNAL_D", "INTERNAL_H", "T", "PARTITION_COUNT", "18mm Plywood", "FRONT_ONLY", "VERTICAL", 4));
      partRules.save(makePartRule(wardrobe2Split, "Shelf", "CARCASS", "BAY_W", "INTERNAL_D", "T", "SHELF_COUNT*SPLIT_COUNT", "18mm Plywood", "FRONT_ONLY", "HORIZONTAL", 5));
      partRules.save(makePartRule(wardrobe2Split, "Back Panel", "BACK", "W", "H", "BACK_T", "1", "6mm Back Panel", "NONE", "VERTICAL", 6));
      partRules.save(makePartRule(wardrobe2Split, "Shutter", "SHUTTER", "W/SPLIT_COUNT", "INTERNAL_H", "T", "SPLIT_COUNT", "18mm Plywood", "ALL", "VERTICAL", 7));

      // Create Products linked to templates
      Product p1 = make("Kitchen Base Cabinet", "Kitchen", "RUNNING_FT", 50);
      p1.setTemplate(kitchenBase);
      products.save(p1);

      Product p2 = make("2-Door Wardrobe", "Wardrobe", "AREA", 0.002);
      p2.setTemplate(wardrobe2Split);
      products.save(p2);

      // Products without templates (fallback)
      products.save(make("Kitchen Wall Cabinet", "Kitchen", "RUNNING_FT", 40));
      products.save(make("TV Unit Base", "Living", "PER_UNIT", 15000));
      products.save(make("Vanity", "Bathroom", "PER_UNIT", 8000));
    };
  }

  private Product make(String name, String cat, String model, double rate) {
    Product p = new Product();
    p.setName(name);
    p.setCategory(cat);
    p.setPricingModel(model);
    p.setUnitRate(rate);
    p.setDescription("Seeded product");
    return p;
  }

  private TemplateParam makeParam(ProductTemplate template, String name, Double defaultVal,
                                   Double min, Double max, Boolean required, String label, String help) {
    TemplateParam p = new TemplateParam();
    p.setTemplate(template);
    p.setParamName(name);
    p.setDefaultValue(defaultVal);
    p.setMinValue(min);
    p.setMaxValue(max);
    p.setRequired(required);
    p.setDisplayLabel(label);
    p.setHelpText(help);
    return p;
  }

  private TemplateDerivedVar makeDerivedVar(ProductTemplate template, String varName, String expr, int order) {
    TemplateDerivedVar v = new TemplateDerivedVar();
    v.setTemplate(template);
    v.setVarName(varName);
    v.setExpression(expr);
    v.setExecutionOrder(order);
    return v;
  }

  private TemplateValidationRule makeValidation(ProductTemplate template, String condition, String message) {
    TemplateValidationRule r = new TemplateValidationRule();
    r.setTemplate(template);
    r.setConditionExpr(condition);
    r.setErrorMessage(message);
    return r;
  }

  private TemplatePartRule makePartRule(ProductTemplate template, String partName, String partType,
                                        String widthExpr, String heightExpr, String thicknessExpr,
                                        String qtyExpr, String materialType, String edgeBanding,
                                        String grainDirection, int order) {
    TemplatePartRule r = new TemplatePartRule();
    r.setTemplate(template);
    r.setPartName(partName);
    r.setPartType(partType);
    r.setWidthExpr(widthExpr);
    r.setHeightExpr(heightExpr);
    r.setThicknessExpr(thicknessExpr);
    r.setQtyExpr(qtyExpr);
    r.setMaterialType(materialType);
    r.setEdgeBanding(edgeBanding);
    r.setGrainDirection(grainDirection);
    r.setExecutionOrder(order);
    return r;
  }
}
