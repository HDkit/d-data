export type Document = {
  id: string;
  name: string;
  author: string;
  dateCreated: string;
  size: number;
  fileFormat: string;
};

export type DocumentFilters = {
  search?: string;
  name?: string;
  author?: string;
  fileFormat?: string;
  createdFrom?: string;
  createdTo?: string;
  minSize?: string;
  maxSize?: string;
};

export type DocumentInput = Omit<Document, "id">;

export const SUPPORTED_FILE_FORMATS = [
  "txt", "md", "markdown", "csv", "tsv", "json", "xml", "html", "htm", "rtf",
  "pdf", "doc", "docx", "odt", "xls", "xlsx", "ods",
  "jpg", "jpeg", "png", "webp", "bmp", "tif", "tiff", "svg", "avif",
] as const;

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5087").replace(/\/$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    let message = `${response.status} ${response.statusText}`;
    try {
      const body = await response.json();
      if (body?.title || body?.detail) message = body.detail ?? body.title;
    } catch {
      // Keep the HTTP status when the API has no JSON error body.
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

function queryString(filters: DocumentFilters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (!value?.trim()) continue;
    if (key === "createdFrom") {
      params.set(key, `${value.trim()}T00:00:00Z`);
    } else if (key === "createdTo") {
      params.set(key, `${value.trim()}T23:59:59.999Z`);
    } else {
      params.set(key, value.trim());
    }
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function listDocuments(filters: DocumentFilters = {}) {
  return request<Document[]>(`/documents${queryString(filters)}`);
}

export function getDocument(id: string) {
  return request<Document>(`/documents/${id}`);
}

export function createDocument(document: DocumentInput) {
  return request<Document>("/documents", {
    method: "POST",
    body: JSON.stringify(document),
  });
}

export function updateDocument(id: string, document: DocumentInput) {
  return request<void>(`/documents/${id}`, {
    method: "PUT",
    body: JSON.stringify(document),
  });
}

export function deleteDocument(id: string) {
  return request<void>(`/documents/${id}`, { method: "DELETE" });
}
