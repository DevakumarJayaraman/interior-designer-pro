package com.interior.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
@Entity
public class QuoteItem extends BaseEntity {

  @ManyToOne(optional = false)
  private Quotation quotation;

  @ManyToOne(optional = false)
  private Area area;

  @ManyToOne(optional = false)
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
}
