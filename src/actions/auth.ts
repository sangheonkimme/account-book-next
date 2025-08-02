"use server";

import { createSupabaseServerClient } from "@/lib/supabase";
import { redirect } from "next/navigation";

export async function logout() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
