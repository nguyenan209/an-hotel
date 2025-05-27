import crypto from "crypto";
import { generateBookingNumber } from "./utils";

/**
 * Tạo hash từ một object hoặc chuỗi
 * @param data - Dữ liệu cần hash (object hoặc string)
 * @param length - Độ dài của hash (mặc định là 10 ký tự)
 * @returns Hash string
 */
export function generateHash(
  data: object | string,
  length: number = 10
): string {
  const stringData = typeof data === "string" ? data : JSON.stringify(data);
  return crypto
    .createHash("sha256")
    .update(stringData)
    .digest("hex")
    .slice(0, length);
}

export function compareHashes(
  cartPayload: { cartItemIds: { id: string }[] },
  hash: string
): boolean {
  const generatedHash = generateBookingNumber(cartPayload);
  return generatedHash === hash;
}
