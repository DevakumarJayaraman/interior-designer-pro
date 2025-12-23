package com.interior.controller;

import com.interior.dto.MaterialSummary;
import com.interior.dto.QuoteTotal;
import com.interior.model.CutlistItem;
import com.interior.model.QuoteItem;
import com.interior.model.Quotation;
import com.interior.service.QuotationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quotes")
public class QuotationController {

  private final QuotationService service;
  public QuotationController(QuotationService service) { this.service = service; }

  // Step 4 start: load/create draft for project
  @PostMapping("/draft")
  public Quotation loadOrCreateDraft(@RequestParam Long projectId) {
    return service.loadOrCreateDraft(projectId);
  }

  @GetMapping public List<Quotation> listByProject(@RequestParam Long projectId) {
    return service.listByProject(projectId);
  }

  @GetMapping("/{quoteId}") public Quotation get(@PathVariable Long quoteId) { return service.get(quoteId); }

  // Items (Step 2/3)
  @GetMapping("/{quoteId}/items")
  public List<QuoteItem> listItems(@PathVariable Long quoteId) { return service.listItems(quoteId); }

  @PostMapping("/{quoteId}/items")
  public QuoteItem addItem(@PathVariable Long quoteId,
                           @RequestParam Long areaId,
                           @RequestParam Long productId,
                           @RequestBody QuoteItem payload) {
    return service.addItem(quoteId, areaId, productId, payload);
  }

  @PutMapping("/items/{itemId}")
  public QuoteItem updateItem(@PathVariable Long itemId, @RequestBody QuoteItem payload) {
    return service.updateItem(itemId, payload);
  }

  @DeleteMapping("/items/{itemId}") public void deleteItem(@PathVariable Long itemId) { service.deleteItem(itemId); }

  // Totals
  @PostMapping("/{quoteId}/recalc") public QuoteTotal recalc(@PathVariable Long quoteId) { return service.recalcTotal(quoteId); }
  @PostMapping("/{quoteId}/submit") public Quotation submit(@PathVariable Long quoteId) { return service.submit(quoteId); }
  @PostMapping("/duplicateLatest") public Quotation duplicateLatest(@RequestParam Long projectId) { return service.duplicateLatest(projectId); }

  // Step 5: cutlist
  @PostMapping("/{quoteId}/cutlist/generate")
  public List<CutlistItem> generateCutlist(@PathVariable Long quoteId) { return service.generateCutlist(quoteId); }

  @GetMapping("/{quoteId}/cutlist")
  public List<CutlistItem> listCutlist(@PathVariable Long quoteId) { return service.listCutlist(quoteId); }

  // Step 6: material usage summary
  @GetMapping("/{quoteId}/material-summary")
  public MaterialSummary materialSummary(@PathVariable Long quoteId) { return service.materialSummary(quoteId); }
}
