package com.interior.config;

import com.interior.model.Product;
import com.interior.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeeder {
  @Bean
  CommandLineRunner seedProducts(ProductRepository products) {
    return args -> {
      if (products.count() > 0) return;

      products.save(make("Wardrobe 2-Door", "Wardrobe", "AREA", 0.002));      // rate per mm² (example)
      products.save(make("Kitchen Base Cabinet", "Kitchen", "RUNNING_FT", 50)); // per mm width (example)
      products.save(make("Kitchen Wall Cabinet", "Kitchen", "RUNNING_FT", 40));
      products.save(make("TV Unit Base", "Living", "PER_UNIT", 15000));
      products.save(make("Vanity", "Bathroom", "PER_UNIT", 8000));
    };
  }

  private Product make(String name, String cat, String model, double rate) {
    Product p = new Product();
    p.setName(name);
    p.setCategory(cat);
    p.setPricingModel(model);
    p.setUnitRate(rate);
    p.setDescription("Seeded product");
    return p;
  }
}
