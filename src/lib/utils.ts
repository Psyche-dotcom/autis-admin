import { Admin, Category, ISymbol } from "@/interface";
import { routes } from "@/service/api-routes";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const mapApiToAdmin = (apiData: any): Admin => {
  return {
    id: apiData.id,
    name: apiData.firstName + " " + apiData.lastName,
    email: apiData.email,
    role: apiData.userRole,
    dateCreated: formatDateTime(apiData.created),
  };
};
export const mapApiToCatCount = (apiData: any): Category => {
  return {
    id: apiData.id,
    name: apiData.categoryName,
    symbolCount: apiData.symbolCount,
  };
};
export const mapApiToCatSymbol = (apiData: any): ISymbol => {
  return {
    id: apiData.symbolId,
    name: apiData.description,
    categoryId: apiData.catid,
    dateCreated: formatDateTime(apiData.created),
    svg:
      (process.env.NEXT_PUBLIC_API_URL || "") +
      routes.symbolUrl(apiData.symbolId),
  };
};
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long", // "Monday"
    year: "numeric", // "2025"
    month: "long", // "August"
    day: "numeric", // "31"
    hour: "2-digit", // "01"
    minute: "2-digit", // "45"
    second: "2-digit", // "30"
    hour12: true, // AM/PM format
  }).format(date);
};
