package com.interior.service;

import com.interior.model.Product;
import org.springframework.stereotype.Service;

@Service
public class PricingService {

  /**
   * Simple starter pricing:
   * - VOLUME: rate * H*W*D
   * - AREA:   rate * H*W
   * - RUNNING_FT: rate * W
   * - PER_UNIT: rate * qty
   *
   * Dimensions assumed in mm. This is intentionally naive and will be refined later.
   */
  public double compute(Product product, Integer qty, Double h, Double w, Double d) {
    double rate = product.getUnitRate() == null ? 0.0 : product.getUnitRate();
    String model = product.getPricingModel() == null ? "PER_UNIT" : product.getPricingModel();

    double q = qty == null ? 1 : qty;
    double hh = h == null ? 0 : h;
    double ww = w == null ? 0 : w;
    double dd = d == null ? 0 : d;

    return switch (model.toUpperCase()) {
      case "VOLUME" -> rate * hh * ww * dd * q;
      case "AREA" -> rate * hh * ww * q;
      case "RUNNING_FT" -> rate * ww * q;
      default -> rate * q; // PER_UNIT
    };
  }
}
