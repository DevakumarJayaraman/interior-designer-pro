package com.interior.model;

import jakarta.persistence.Entity;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
@Entity
public class Client extends BaseEntity {
  @NotBlank
  private String name;

  @NotBlank
  private String phone;

  @Email
  private String email;

  private String address;
}
