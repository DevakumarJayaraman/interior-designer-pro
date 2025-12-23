export type Client = { id: number; name: string; phone: string; email?: string; address?: string }
export type Project = {
  id: number; name: string; siteAddress?: string; propertyType?: string; scope?: string; timeline?: string; notes?: string; client: Client
}
export type Area = { id: number; name: string; type: string; notes?: string; length?: number; width?: number; height?: number; project: Project }

export type ProductTemplate = {
  id: number; code: string; name: string; category?: string; description?: string;
  version: number; baseThickness?: number; backPanelThickness?: number; plinthHeight?: number
}

export type TemplateParam = {
  id: number; paramName: string; paramType: string; defaultValue?: number;
  minValue?: number; maxValue?: number; required: boolean; displayLabel: string; helpText?: string
}

export type Product = {
  id: number; name: string; category?: string; pricingModel?: string; unitRate?: number; description?: string;
  template?: ProductTemplate
}

export type Quotation = { id: number; versionNo: number; status: string; currency: string; totalPrice: number; notes?: string; project: Project }

export type QuoteItem = {
  id: number; quotation: Quotation; area: Area; product: Product; quantity: number;
  height?: number; width?: number; depth?: number; computedPrice: number; notes?: string;
  templateParamsJson?: string; templateParams?: Record<string, number>
}

export type CutlistItem = {
  id: number; quotation: Quotation; quoteItem: QuoteItem; partName: string; partType?: string;
  cutHeight?: number; cutWidth?: number; thickness?: number; quantity: number;
  materialType?: string; edgeBanding?: string; grainDirection?: string
}

export type MaterialSummary = { quoteId: number; totalPartAreaMm2: number; sheetAreaMm2: number; sheetCount: number; wastagePercent: number }
