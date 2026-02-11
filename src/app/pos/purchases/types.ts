export type PhoneCondition = "GOOD" | "USED" | "BROKEN";
export type PhoneStatus = "READY_FOR_SALE" | "IN_REPAIR" | "IN_STOCK";

export type PaymentMethod = "CASH" | "CARD" | "OTHER";
export type PaymentType = "PAID_NOW" | "PAY_LATER";

export type PhoneItemDraft = {
  brand: string;
  model: string;
  storage: string;
  color?: string;
  imei?: string;
  condition: PhoneCondition;
  issues?: string;
  initialStatus: PhoneStatus;
  purchasePrice: number; // per item
};

export type PurchaseRow = {
  id: string;
  dateTime: string; // "2026-02-07 14:10"
  sellerName?: string;
  sellerPhone?: string;
  itemsCount: number;
  totalPrice: number;
  paidNow: number;
  remaining: number; // credit
  paymentType: PaymentType;
  paymentMethod: PaymentMethod;
  notes?: string;
  items?: { name: string; imei?: string; condition?: string }[];
};
