const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: string
  ) {
    super(`API Error ${status}: ${body}`);
    this.name = "ApiError";
  }

  get isNotFound() {
    return this.status === 404;
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isForbidden() {
    return this.status === 403;
  }

  get isValidationError() {
    return this.status === 422;
  }
}

class ApiClient {
  private token?: string;

  /** Create a new client instance with a specific auth token (for server-side use) */
  withToken(token: string): ApiClient {
    const client = new ApiClient();
    client.token = token;
    return client;
  }

  private async getHeaders(
    contentType?: string
  ): Promise<Record<string, string>> {
    const headers: Record<string, string> = {};

    if (contentType) {
      headers["Content-Type"] = contentType;
    }

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    } else if (typeof window !== "undefined") {
      // Client-side: dynamically import to avoid SSR issues
      try {
        const { getSession } = await import("next-auth/react");
        const session = await getSession();
        if (session?.accessToken) {
          headers["Authorization"] = `Bearer ${session.accessToken}`;
        }
      } catch {
        // Session not available
      }
    }

    return headers;
  }

  private async handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
      const body = await res.text();
      throw new ApiError(res.status, body);
    }

    // Handle 204 No Content
    if (res.status === 204) {
      return undefined as T;
    }

    return res.json();
  }

  async get<T>(path: string): Promise<T> {
    const headers = await this.getHeaders();
    const res = await fetch(`${API_BASE}${path}`, {
      headers,
      cache: "no-store",
    });
    return this.handleResponse<T>(res);
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    const headers = await this.getHeaders("application/json");
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse<T>(res);
  }

  async put<T>(path: string, body: unknown): Promise<T> {
    const headers = await this.getHeaders("application/json");
    const res = await fetch(`${API_BASE}${path}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });
    return this.handleResponse<T>(res);
  }

  async patch<T>(path: string, body: unknown): Promise<T> {
    const headers = await this.getHeaders("application/json");
    const res = await fetch(`${API_BASE}${path}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(body),
    });
    return this.handleResponse<T>(res);
  }

  async delete(path: string): Promise<void> {
    const headers = await this.getHeaders();
    const res = await fetch(`${API_BASE}${path}`, {
      method: "DELETE",
      headers,
    });
    if (!res.ok) {
      const body = await res.text();
      throw new ApiError(res.status, body);
    }
  }

  async upload<T>(path: string, formData: FormData): Promise<T> {
    // Don't set Content-Type — browser sets multipart boundary automatically
    const headers = await this.getHeaders();
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers,
      body: formData,
    });
    return this.handleResponse<T>(res);
  }
}

export const api = new ApiClient();
