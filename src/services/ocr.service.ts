import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export interface BillItem {
  itemName: string;
  quantity: number;
  price: number;
  amount: number;
  productCategory: string;
}

export interface BillData {
  success: boolean;
  clientName: string;
  vatNo: string;
  vatBillNo: string;
  category: string;
  items: BillItem[];
  totalAmount: number;
  rawText: string;
  source: "llm" | "regex";
  imageUrl?: string;
  error?: string;
}

/**
 * Convert a File to a base64 data URI string.
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

/**
 * Upload a bill image to the backend OCR endpoint.
 * The image is sent as a base64 data URI string.
 * Backend uploads to Cloudinary → sends URL to Python OCR service → returns structured JSON.
 */
export const extractBillData = async (imageFile: File): Promise<BillData> => {
  const base64Image = await fileToBase64(imageFile);

  const token = localStorage.getItem("token");

  const response = await axios.post<BillData>(
    `${API_URL}/api/ocr/extract`,
    { image: base64Image },
    {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      withCredentials: true,
      timeout: 120000, // 120s — Cloudinary upload + OCR + LLM can take time
    }
  );

  return response.data;
};
