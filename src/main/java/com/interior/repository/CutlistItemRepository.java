package com.interior.repository;

import com.interior.model.CutlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CutlistItemRepository extends JpaRepository<CutlistItem, Long> {
  List<CutlistItem> findByQuotation_Id(Long quoteId);
  void deleteByQuotation_Id(Long quoteId);
}
