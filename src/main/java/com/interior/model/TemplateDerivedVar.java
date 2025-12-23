package com.interior.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class TemplateDerivedVar extends BaseEntity {

  @ManyToOne(optional = false)
  private ProductTemplate template;

  @NotBlank
  private String varName;  // INTERNAL_W, BAY_W, OPEN_H, etc.

  @NotBlank
  @Column(columnDefinition = "TEXT")
  private String expression;  // "W - 2*T", "INTERNAL_W / SPLIT_COUNT", etc.

  private Integer executionOrder = 0;  // Order of evaluation (lower first)
}

