package com.interior.model;

import jakarta.persistence.Entity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
@Entity
public class Product extends BaseEntity {
  @NotBlank
  private String name;            // "Wardrobe 2-door", "Base Cabinet", etc.
  private String category;        // Wardrobe / Kitchen / TV / Vanity
  private String pricingModel;    // VOLUME, AREA, RUNNING_FT, PER_UNIT
  @PositiveOrZero
  private Double unitRate;        // used by pricing model (simple starter)

  private String description;
}
