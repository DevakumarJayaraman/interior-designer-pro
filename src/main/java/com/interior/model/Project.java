package com.interior.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
@Entity
public class Project extends BaseEntity {
  @NotBlank
  private String name;

  private String siteAddress;
  private String propertyType;     // Flat / Villa / Independent
  private String scope;            // Full home / Kitchen only...
  private String timeline;         // Text for now
  private String notes;

  @ManyToOne(optional = false)
  private Client client;
}
