package com.interior.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class TemplateValidationRule extends BaseEntity {

  @ManyToOne(optional = false)
  private ProductTemplate template;

  @NotBlank
  @Column(columnDefinition = "TEXT")
  private String conditionExpr;  // "DOOR_COUNT >= 1 && DOOR_COUNT <= 2", "W > 0", etc.

  @NotBlank
  private String errorMessage;  // "Door count must be between 1 and 2"
}

