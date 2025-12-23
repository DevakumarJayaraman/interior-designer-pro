package com.interior.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class QuoteItem extends BaseEntity {

  @ManyToOne(optional = false, fetch = FetchType.EAGER)
  @JsonIgnoreProperties({"items"})
  private Quotation quotation;

  @ManyToOne(optional = false, fetch = FetchType.EAGER)
  @JsonIgnoreProperties({"project"})
  private Area area;

  @ManyToOne(optional = false, fetch = FetchType.EAGER)
  @JsonIgnoreProperties({"template"})
  private Product product;

  @Positive
  private Integer quantity = 1;

  // Dimensions (mm)
  private Double height;
  private Double width;
  private Double depth;

  // Calculated
  private Double computedPrice = 0.0;

  private String notes;

  // Template parameter overrides (JSON: {"SHELF_COUNT": 3, "DOOR_COUNT": 2})
  @Column(columnDefinition = "TEXT")
  private String templateParamsJson;
}
