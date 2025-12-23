package com.interior.dto;

import lombok.Data;

@Data
public class MaterialSummary {
  private Long quoteId;
  private double totalPartAreaMm2;
  private double sheetAreaMm2;
  private int sheetCount;
  private double wastagePercent;
}
