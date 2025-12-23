package com.interior.repository;

import com.interior.model.Quotation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface QuotationRepository extends JpaRepository<Quotation, Long> {
  List<Quotation> findByProject_IdOrderByVersionNoDesc(Long projectId);
  Optional<Quotation> findFirstByProject_IdAndStatus(Long projectId, String status);
}
