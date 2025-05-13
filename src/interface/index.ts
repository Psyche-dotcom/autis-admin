import { ForkOptions } from "child_process";
import { ReactNode } from "react";

export interface ChildProps {
  children: ReactNode;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  dateCreated: string;
}
export interface Category {
  id: string;
  name: string;
  symbolCount: number;
}
export interface ISymbol {
  id: string;
  name: string;
  svg: string;
  categoryId: string;
  dateCreated: string;
  file?: File;
}
export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
};
