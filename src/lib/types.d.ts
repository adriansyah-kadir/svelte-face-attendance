import type { Tables } from "./supabase/types.js"

export type Profile = Tables<"profiles">
export type Attendance = Tables<"attendances">
export type RecursiveKeyOf<T> = T extends object
  ? { [K in keyof T]: K | RecursiveKeyOf<T[K]> }[keyof T]
  : never;
