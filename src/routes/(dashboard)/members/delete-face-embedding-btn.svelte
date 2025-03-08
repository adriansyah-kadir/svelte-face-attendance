<script lang="ts">
  import { callapi, displayErrorMessage } from "$lib";
  import supabase from "$lib/supabase";
  import type { Tables } from "$lib/supabase/types";

  const {
    faceEmbedding,
    onSuccess,
  }: { faceEmbedding: Tables<"face_embeddings">; onSuccess?: () => void } =
    $props();

  const deleteMutation = callapi({
    onSuccess,
    onError: (_, err) => displayErrorMessage(err),
    async fn() {
      const result = await supabase
        .from("face_embeddings")
        .delete()
        .eq("id", faceEmbedding.id);
      if (result.error) throw result.error;
    },
  });
</script>

<button
  disabled={$deleteMutation.isLoading}
  onclick={deleteMutation.call}
  class="btn btn-warning"
>
  {#if $deleteMutation.isLoading}
    <span class="loading loading-spinner"></span>
  {/if}
  Delete
</button>
