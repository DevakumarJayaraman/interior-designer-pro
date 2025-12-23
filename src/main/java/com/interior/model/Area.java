package com.interior.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
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

  @ManyToOne(optional = false, fetch = FetchType.EAGER)
  @JsonIgnoreProperties({"client", "areas"})
  private Project project;
}
