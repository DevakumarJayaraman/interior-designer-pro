package com.interior.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
@Entity
public class CutlistItem extends BaseEntity {

  @ManyToOne(optional = false)
  private Quotation quotation;

  @ManyToOne(optional = false)
  private QuoteItem quoteItem;

  private String partName;

  // Cutting size (mm)
  private Double cutHeight;
  private Double cutWidth;
  private Double thickness;     // mm

  private Integer quantity = 1;

  // Future: edge band sides, grain direction, material, etc.
}
