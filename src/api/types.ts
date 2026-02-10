// 🔹 Backend'dan keladigan user tipi
export type ApiUser = {
  id: number | string;
  role: "OWNER_ADMIN" | "ADMIN" | "MANAGER" | "CASHIER" | "TECHNICIAN";
  name?: string;
  fullName?: string;
  username?: string;
  email?: string;
  phone?: string;
};