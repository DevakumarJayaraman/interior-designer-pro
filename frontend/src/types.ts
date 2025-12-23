export type Client = { id: number; name: string; phone: string; email?: string; address?: string }
export type Project = {
  id: number; name: string; siteAddress?: string; propertyType?: string; scope?: string; timeline?: string; notes?: string; client: Client
}
export type Area = { id: number; name: string; type: string; notes?: string; length?: number; width?: number; height?: number; project: Project }
export type Product = { id: number; name: string; category?: string; pricingModel?: string; unitRate?: number; description?: string }
export type Quotation = { id: number; versionNo: number; status: string; currency: string; totalPrice: number; notes?: string; project: Project }
export type QuoteItem = {
  id: number; quotation: Quotation; area: Area; product: Product; quantity: number;
  height?: number; width?: number; depth?: number; computedPrice: number; notes?: string
}
export type CutlistItem = {
  id: number; quotation: Quotation; quoteItem: QuoteItem; partName: string; cutHeight?: number; cutWidth?: number; thickness?: number; quantity: number
}
export type MaterialSummary = { quoteId: number; totalPartAreaMm2: number; sheetAreaMm2: number; sheetCount: number; wastagePercent: number }
