"use client";
import { useFcm } from "@/hooks/use-fcm";

export function FcmRegister() {
  useFcm();
  return null;
}
