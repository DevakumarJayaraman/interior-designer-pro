package com.interior.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Quotation extends BaseEntity {

  @ManyToOne(optional = false, fetch = FetchType.EAGER)
  @JsonIgnoreProperties({"client", "areas"})
  private Project project;

  private Long versionNo = 1L;          // 1..n
  private String status = "DRAFT";      // DRAFT / SUBMITTED

  private String currency = "INR";
  private Double totalPrice = 0.0;
  private String notes;
}
