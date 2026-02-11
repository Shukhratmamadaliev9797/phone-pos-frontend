import type { PhoneItemDraft } from "./types";

export function emptyPhone(): PhoneItemDraft {
  return {
    brand: "",
    model: "",
    storage: "",
    color: "",
    imei: "",
    condition: "USED",
    issues: "",
    initialStatus: "READY_FOR_SALE",
    purchasePrice: 0,
  };
}
