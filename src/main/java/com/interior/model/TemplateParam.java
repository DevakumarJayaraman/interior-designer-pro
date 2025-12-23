package com.interior.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class TemplateParam extends BaseEntity {

  @ManyToOne(optional = false)
  private ProductTemplate template;

  @NotBlank
  private String paramName;  // SHELF_COUNT, DOOR_COUNT, DRAWER_COUNT, etc.

  private String paramType = "NUMBER";  // NUMBER, BOOLEAN (future: SELECT, etc.)

  private Double defaultValue;  // Default value for this parameter

  private Double minValue;  // Minimum allowed value
  private Double maxValue;  // Maximum allowed value

  private Boolean required = false;

  private String displayLabel;  // "Number of Shelves", "Door Count", etc.

  @Column(columnDefinition = "TEXT")
  private String helpText;  // User guidance text
}

