// services/HttpService.ts
import axios, { AxiosInstance } from "axios";
import Cookies from "js-cookie";
import { toast } from "@/hooks/use-toast";

class HttpService {
  private request: AxiosInstance;
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

    // Initialize Axios instances
    this.request = axios.create({
      baseURL: this.baseUrl,
    });

    // Add JWT from cookie to headers for requests that require authorization
    this.request.interceptors.request.use(
      (config) => {
        const token = Cookies.get("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Unified response error handling for both authenticated and unauthenticated requests
    const handleResponseError = (error: any) => {
      if (error.response) {
        const { status, data } = error.response;

        // Global error handling based on status
        let description = "Something went wrong";

        if (data) {
          const errorMessages = data?.errorMessages || [];
          description =
            errorMessages.join("\n") || data?.displayMessage || description;
        }

        // Handle specific HTTP status codes
        if (status === 401) {
          Cookies.remove("token");
          window.location.href = "/"; // Redirect to login on 401
        }

        // Display global error toast with the description
        toast({
          variant: "destructive",
          title: "Error",
          description,
        });

        // You can handle more status codes here if needed, e.g., 403, 500, etc.
      } else {
        // Network or unknown errors
        toast({
          variant: "destructive",
          title: "Network Error",
          description: "Please check your connection or try again later.",
        });
      }

      return Promise.reject(error); // Rethrow error to be caught in the calling function if necessary
    };

    // Response interceptor for authenticated requests
    this.request.interceptors.response.use(
      (response) => response?.data?.result, // Pass the response directly if it's successful
      handleResponseError
    );

    // Response interceptor for unauthenticated requests
    axios.interceptors.response.use(
      (response) => response?.data?.result, // Pass the response directly if it's successful
      handleResponseError
    );
  }

  getServiceUrl(url: string): string {
    return `${this.baseUrl}${url}`;
  }

  // API Calls (with token)
  async postData(payload: any, url: string) {
    return this.request.post(this.getServiceUrl(url), payload);
  }

  async getData(url: string) {
    return this.request.get(this.getServiceUrl(url));
  }

  async putData(payload: any, url: string) {
    return this.request.put(this.getServiceUrl(url), payload);
  }

  async patchData(payload: any, url: string) {
    return this.request.patch(this.getServiceUrl(url), payload);
  }

  async deleteData(url: string) {
    return this.request.delete(this.getServiceUrl(url));
  }

  // API Calls (without token)
  async postDataWithoutToken(payload: any, url: string) {
    return axios.post(this.getServiceUrl(url), payload); // Handles error globally using axios interceptors
  }

  async getDataWithoutToken(url: string) {
    return axios.get(this.getServiceUrl(url)); // Handles error globally using axios interceptors
  }

  async putDataWithoutToken(payload: any, url: string) {
    return axios.put(this.getServiceUrl(url), payload); // Handles error globally using axios interceptors
  }

  async patchDataWithoutToken(payload: any, url: string) {
    return axios.patch(this.getServiceUrl(url), payload); // Handles error globally using axios interceptors
  }

  async deleteDataWithoutToken(url: string) {
    return axios.delete(this.getServiceUrl(url)); // Handles error globally using axios interceptors
  }

  async uploadFile(payload: { file: File; fileName: string }, url: string) {
    const formData = new FormData();
    formData.append("file", payload.file);
    formData.append("fileName", payload.fileName);
    return this.request.post(this.getServiceUrl(url), formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  async uploadProfile(payload: string, url: string) {
    const formData = new FormData();
    formData.append("file", payload);
    return this.request.post(this.getServiceUrl(url), formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }
}

export default new HttpService();
