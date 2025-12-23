package com.interior.repository;

import com.interior.model.QuoteItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuoteItemRepository extends JpaRepository<QuoteItem, Long> {
  List<QuoteItem> findByQuotation_Id(Long quoteId);
  List<QuoteItem> findByQuotation_IdAndArea_Id(Long quoteId, Long areaId);
}
