import type { SendSearchResultsRequest, EmailApiResponse } from "@/types/email";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const emailService = {
  async sendSearchResults(data: SendSearchResultsRequest): Promise<EmailApiResponse> {
    if (!API_URL) {
      throw new Error(
        "API URL tanımlı değil. `.env.local` dosyasında `NEXT_PUBLIC_API_URL` " +
        "değişkenini ayarlayıp `npm run dev` komutunu yeniden çalıştırın."
      );
    }

    let response: Response;
    try {
      response = await fetch(`${API_URL}/api/email/send-search-results`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    } catch {
      throw new Error("Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edin.");
    }

    let result: EmailApiResponse;
    try {
      result = (await response.json()) as EmailApiResponse;
    } catch {
      throw new Error("Sunucudan geçersiz yanıt alındı.");
    }

    if (!response.ok || result.hasError) {
      throw new Error(result.errorMessage || "E-posta gönderilemedi");
    }

    return result;
  },
};
