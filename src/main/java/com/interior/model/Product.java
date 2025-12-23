package com.interior.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Product extends BaseEntity {
  @NotBlank
  private String name;            // "Wardrobe 2-door", "Base Cabinet", etc.
  private String category;        // Wardrobe / Kitchen / TV / Vanity
  private String pricingModel;    // VOLUME, AREA, RUNNING_FT, PER_UNIT
  @PositiveOrZero
  private Double unitRate;        // used by pricing model (simple starter)

  private String description;

  @ManyToOne(fetch = FetchType.EAGER)
  @JsonIgnoreProperties({"params", "derivedVars", "partRules", "validationRules"})
  private ProductTemplate template;  // Link to template for cut-list generation
}
