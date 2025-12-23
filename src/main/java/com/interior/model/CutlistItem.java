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

  private String partType;  // CARCASS, SHUTTER, DRAWER, BACK, etc.

  // Cutting size (mm)
  private Double cutHeight;
  private Double cutWidth;
  private Double thickness;     // mm

  private Integer quantity = 1;

  // Manufacturing metadata
  private String materialType;  // "18mm Plywood", "6mm Back Panel", etc.
  private String edgeBanding;   // "ALL", "FRONT_ONLY", "NONE", etc.
  private String grainDirection;  // "VERTICAL", "HORIZONTAL", "ANY"
}
