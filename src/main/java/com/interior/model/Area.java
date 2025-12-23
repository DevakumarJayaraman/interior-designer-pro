package com.interior.model;

import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
@Entity
public class Area extends BaseEntity {
  @NotBlank
  private String name;        // "Master Bedroom Wardrobe"
  @NotBlank
  private String type;        // Kitchen / Bedroom / Living / Bathroom

  private String notes;

  // Optional rough dimensions (planning)
  private Double length;
  private Double width;
  private Double height;

  @ManyToOne(optional = false)
  private Project project;
}
