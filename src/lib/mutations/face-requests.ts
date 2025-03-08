import { callapi } from "$lib";
import supabase from "$lib/supabase";
import type { Tables } from "$lib/supabase/types";
import ky from "ky";

export function createFaceRequestDeleteMutation(
  config: Partial<Parameters<typeof callapi>[0]>
) {
  return callapi({
    ...config,
    async fn(i: Tables<"face_requests">) {
      if (!i.id || !i.image) throw Error("invalid face registration data");
      const [bucket, ...path] = i.image.split("/");
      const remove = await supabase.storage
        .from(bucket)
        .remove([path.join("/")]);
      if (remove.error) throw remove.error;
      const result = await supabase
        .from("face_requests")
        .delete()
        .eq("id", i.id)
        .select()
        .single();
      if (result.error) throw result.error;
      return result.data;
    },
  });
}

export function createFaceRequestInsertMutation() {
  return callapi({
    async fn({ file, userId }: { file: File; userId: string }) {
      const upload = await supabase.storage
        .from("media")
        .upload(`${userId}/faces/${crypto.randomUUID()}`, file);
      if (upload.error) throw upload.error;
      const result = await supabase
        .from("face_requests")
        .insert({ image: upload.data.fullPath })
        .select()
        .single();
      if (result.error) throw result.error;
      return result.data;
    },
  });
}

export function createFaceRequestAcceptMutation(
  backend_server: string,
  access_token: string,
  config: Partial<Parameters<typeof callapi>[0]>
) {
  return callapi({
    ...config,
    fn: async function (requestId: number) {
      const response = await ky
        .post(`${backend_server}/faces`, {
          json: {
            request_id: requestId,
            token: access_token,
          },
          credentials: "include",
          keepalive: true,
          timeout: false,
        })
        .json<Tables<"face_embeddings">>();
      await supabase.from("face_requests").delete().eq("id", requestId);
      return response;
    },
  });
}
