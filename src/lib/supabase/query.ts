import supabase from ".";

export function getProfile(id: string) {
  return supabase.from("profiles").select("*").eq("id", id).single();
}

export function getSettings() {
  return supabase.from("settings").select("*")
}

export async function getMemberFaceRequests(userId: string) {
  return await supabase.from("face_requests").select("*").eq("profile_id", userId)
}

export async function getMemberFaceEmbeddings(userId: string) {
  return await supabase.from("face_embeddings").select("*").eq("profile_id", userId)
}

export async function getMemberFaces(userId: string) {
  return await supabase.from("faces").select().eq("profile_id", userId)
}

export function getAttendances() {
  return supabase.from("attendances").select()
}

export function getProfiles() {
  return supabase.from("profiles").select()
}
