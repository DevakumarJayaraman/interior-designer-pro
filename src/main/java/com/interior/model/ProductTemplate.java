package com.interior.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class ProductTemplate extends BaseEntity {

  @NotBlank
  @Column(unique = true)
  private String code;  // KITCHEN_BASE, WARDROBE_2_SPLIT, etc.

  @NotBlank
  private String name;  // "Kitchen Base Cabinet", "2-Split Wardrobe"

  private String category;  // Kitchen, Wardrobe, Living, etc.

  @Column(columnDefinition = "TEXT")
  private String description;

  private Integer version = 1;  // For versioning templates

  // Base material specifications (mm)
  private Double baseThickness = 18.0;  // Default carcass thickness
  private Double backPanelThickness = 6.0;  // Default back panel thickness
  private Double plinthHeight = 100.0;  // Default plinth/kickboard height
}

