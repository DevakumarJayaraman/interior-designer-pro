package com.interior.service;

import com.interior.dto.MaterialSummary;
import com.interior.dto.QuoteTotal;
import com.interior.model.*;
import com.interior.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class QuotationService {

  private final QuotationRepository quotationRepository;
  private final QuoteItemRepository quoteItemRepository;
  private final ProductRepository productRepository;
  private final ProjectRepository projectRepository;
  private final AreaRepository areaRepository;
  private final CutlistItemRepository cutlistItemRepository;
  private final PricingService pricingService;
  private final TemplateEngineService templateEngineService;

  public QuotationService(QuotationRepository quotationRepository,
                          QuoteItemRepository quoteItemRepository,
                          ProductRepository productRepository,
                          ProjectRepository projectRepository,
                          AreaRepository areaRepository,
                          CutlistItemRepository cutlistItemRepository,
                          PricingService pricingService,
                          TemplateEngineService templateEngineService) {
    this.quotationRepository = quotationRepository;
    this.quoteItemRepository = quoteItemRepository;
    this.productRepository = productRepository;
    this.projectRepository = projectRepository;
    this.areaRepository = areaRepository;
    this.cutlistItemRepository = cutlistItemRepository;
    this.pricingService = pricingService;
    this.templateEngineService = templateEngineService;
  }

  public Quotation loadOrCreateDraft(Long projectId) {
    return quotationRepository.findFirstByProject_IdAndStatus(projectId, "DRAFT")
      .orElseGet(() -> {
        Project project = projectRepository.findById(projectId).orElseThrow();
        Quotation q = new Quotation();
        q.setProject(project);
        q.setStatus("DRAFT");
        q.setTotalPrice(0.0);
        q.setVersionNo(1L);
        return quotationRepository.save(q);
      });
  }

  public List<Quotation> listByProject(Long projectId) {
    return quotationRepository.findByProject_IdOrderByVersionNoDesc(projectId);
  }

  public Quotation get(Long quoteId) {
    return quotationRepository.findById(quoteId).orElseThrow();
  }

  @Transactional
  public QuoteItem addItem(Long quoteId, Long areaId, Long productId, QuoteItem payload) {
    Quotation quotation = quotationRepository.findById(quoteId).orElseThrow();
    if (!"DRAFT".equalsIgnoreCase(quotation.getStatus())) {
      throw new IllegalStateException("Cannot modify a non-draft quotation");
    }
    Area area = areaRepository.findById(areaId).orElseThrow();
    Product product = productRepository.findById(productId).orElseThrow();

    QuoteItem item = new QuoteItem();
    item.setQuotation(quotation);
    item.setArea(area);
    item.setProduct(product);
    item.setQuantity(payload.getQuantity() == null ? 1 : payload.getQuantity());
    item.setHeight(payload.getHeight());
    item.setWidth(payload.getWidth());
    item.setDepth(payload.getDepth());
    item.setNotes(payload.getNotes());
    item.setTemplateParamsJson(payload.getTemplateParamsJson());  // Store template params

    double price = pricingService.compute(product, item.getQuantity(), item.getHeight(), item.getWidth(), item.getDepth());
    item.setComputedPrice(price);
    item = quoteItemRepository.save(item);

    recalcTotal(quoteId);
    return item;
  }

  @Transactional
  public QuoteItem updateItem(Long itemId, QuoteItem payload) {
    QuoteItem item = quoteItemRepository.findById(itemId).orElseThrow();
    Quotation q = item.getQuotation();
    if (!"DRAFT".equalsIgnoreCase(q.getStatus())) {
      throw new IllegalStateException("Cannot modify a non-draft quotation");
    }
    item.setQuantity(payload.getQuantity() == null ? item.getQuantity() : payload.getQuantity());
    item.setHeight(payload.getHeight());
    item.setWidth(payload.getWidth());
    item.setDepth(payload.getDepth());
    item.setNotes(payload.getNotes());
    if (payload.getTemplateParamsJson() != null) {
      item.setTemplateParamsJson(payload.getTemplateParamsJson());
    }

    double price = pricingService.compute(item.getProduct(), item.getQuantity(), item.getHeight(), item.getWidth(), item.getDepth());
    item.setComputedPrice(price);

    item = quoteItemRepository.save(item);
    recalcTotal(q.getId());
    return item;
  }

  @Transactional
  public void deleteItem(Long itemId) {
    QuoteItem item = quoteItemRepository.findById(itemId).orElseThrow();
    Long quoteId = item.getQuotation().getId();
    if (!"DRAFT".equalsIgnoreCase(item.getQuotation().getStatus())) {
      throw new IllegalStateException("Cannot modify a non-draft quotation");
    }
    quoteItemRepository.deleteById(itemId);
    recalcTotal(quoteId);
  }

  public List<QuoteItem> listItems(Long quoteId) {
    return quoteItemRepository.findByQuotation_Id(quoteId);
  }

  @Transactional
  public QuoteTotal recalcTotal(Long quoteId) {
    List<QuoteItem> items = quoteItemRepository.findByQuotation_Id(quoteId);
    double total = 0.0;
    for (QuoteItem i : items) {
      if (i.getComputedPrice() != null) total += i.getComputedPrice();
    }
    Quotation q = quotationRepository.findById(quoteId).orElseThrow();
    q.setTotalPrice(total);
    quotationRepository.save(q);

    QuoteTotal out = new QuoteTotal();
    out.setQuoteId(quoteId);
    out.setTotalPrice(total);
    return out;
  }

  @Transactional
  public Quotation submit(Long quoteId) {
    Quotation q = quotationRepository.findById(quoteId).orElseThrow();
    q.setStatus("SUBMITTED");
    return quotationRepository.save(q);
  }

  @Transactional
  public Quotation duplicateLatest(Long projectId) {
    List<Quotation> list = quotationRepository.findByProject_IdOrderByVersionNoDesc(projectId);
    Quotation base = list.isEmpty() ? null : list.get(0);
    Quotation draft = loadOrCreateDraft(projectId);
    // If draft already exists, clone latest submitted/draft into new version:
    Project project = projectRepository.findById(projectId).orElseThrow();

    long nextVersion = (base == null || base.getVersionNo() == null) ? 1 : base.getVersionNo() + 1;
    Quotation copy = new Quotation();
    copy.setProject(project);
    copy.setVersionNo(nextVersion);
    copy.setStatus("DRAFT");
    copy.setCurrency("INR");
    copy.setNotes(base == null ? null : base.getNotes());
    copy.setTotalPrice(0.0);
    copy = quotationRepository.save(copy);

    if (base != null) {
      List<QuoteItem> items = quoteItemRepository.findByQuotation_Id(base.getId());
      for (QuoteItem it : items) {
        QuoteItem ni = new QuoteItem();
        ni.setQuotation(copy);
        ni.setArea(it.getArea());
        ni.setProduct(it.getProduct());
        ni.setQuantity(it.getQuantity());
        ni.setHeight(it.getHeight());
        ni.setWidth(it.getWidth());
        ni.setDepth(it.getDepth());
        ni.setNotes(it.getNotes());
        ni.setComputedPrice(it.getComputedPrice());
        ni.setTemplateParamsJson(it.getTemplateParamsJson());  // Copy template params
        quoteItemRepository.save(ni);
      }
      recalcTotal(copy.getId());
    }
    return copy;
  }

  // Step 5: Cutlist generation with template engine support
  @Transactional
  public List<CutlistItem> generateCutlist(Long quoteId) {
    Quotation q = quotationRepository.findById(quoteId).orElseThrow();
    cutlistItemRepository.deleteByQuotation_Id(quoteId);

    List<QuoteItem> items = quoteItemRepository.findByQuotation_Id(quoteId);
    List<CutlistItem> out = new ArrayList<>();

    for (QuoteItem it : items) {
      // Try template engine first
      List<CutlistItem> templateItems = templateEngineService.generateCutlistForQuoteItem(it);

      if (!templateItems.isEmpty()) {
        // Template-based generation successful
        for (CutlistItem ci : templateItems) {
          ci.setQuotation(q);
          out.add(cutlistItemRepository.save(ci));
        }
      } else {
        // Fallback: simple 1:1 mapping (legacy behavior)
        CutlistItem ci = new CutlistItem();
        ci.setQuotation(q);
        ci.setQuoteItem(it);
        ci.setPartName(it.getProduct().getName());
        ci.setPartType("GENERIC");
        ci.setCutHeight(it.getHeight());
        ci.setCutWidth(it.getWidth());
        ci.setThickness(it.getDepth()); // using depth as thickness placeholder
        ci.setQuantity(it.getQuantity() == null ? 1 : it.getQuantity());
        out.add(cutlistItemRepository.save(ci));
      }
    }
    return out;
  }

  public List<CutlistItem> listCutlist(Long quoteId) {
    return cutlistItemRepository.findByQuotation_Id(quoteId);
  }

  // Step 6: Material usage summary (8x4 sheet, mm) - grouped by material type and thickness
  public MaterialSummary materialSummary(Long quoteId) {
    double sheetArea = 2440.0 * 1220.0; // mm²
    List<CutlistItem> items = listCutlist(quoteId);

    double total = 0.0;
    for (CutlistItem i : items) {
      if (i.getCutHeight() != null && i.getCutWidth() != null && i.getQuantity() != null) {
        total += i.getCutHeight() * i.getCutWidth() * i.getQuantity();
      }
    }

    int sheets = (int) Math.ceil(total / sheetArea);
    double wastage = 0.0;
    if (sheets > 0) {
      double usedSheetArea = sheets * sheetArea;
      wastage = ((usedSheetArea - total) / usedSheetArea) * 100.0;
    }

    MaterialSummary ms = new MaterialSummary();
    ms.setQuoteId(quoteId);
    ms.setTotalPartAreaMm2(total);
    ms.setSheetAreaMm2(sheetArea);
    ms.setSheetCount(sheets);
    ms.setWastagePercent(wastage);
    return ms;
  }
}
