package com.interior.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class TemplatePartRule extends BaseEntity {

  @ManyToOne(optional = false)
  private ProductTemplate template;

  @NotBlank
  private String partName;  // "Side Panel", "Shelf", "Shutter", etc.

  @NotBlank
  private String partType;  // CARCASS, SHUTTER, DRAWER, BACK, etc.

  @NotBlank
  @Column(columnDefinition = "TEXT")
  private String widthExpr;  // "W", "INTERNAL_W", "W/DOOR_COUNT", etc.

  @NotBlank
  @Column(columnDefinition = "TEXT")
  private String heightExpr;  // "H", "OPEN_H", "D", etc.

  @Column(columnDefinition = "TEXT")
  private String thicknessExpr;  // "T", "BACK_T", "12", etc.

  @NotBlank
  @Column(columnDefinition = "TEXT")
  private String qtyExpr;  // "2", "SHELF_COUNT", "SPLIT_COUNT-1", etc.

  private String materialType;  // "18mm Plywood", "6mm Back Panel", etc.

  private String edgeBanding;  // "ALL", "FRONT_ONLY", "NONE", etc.

  private String grainDirection;  // "VERTICAL", "HORIZONTAL", "ANY"

  private Integer executionOrder = 0;  // Order of part generation
}

