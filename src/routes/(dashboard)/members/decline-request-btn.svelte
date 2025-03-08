<script lang="ts">
  import { displayErrorMessage } from "$lib";
  import { createFaceRequestDeleteMutation } from "$lib/mutations/face-requests";
  import type { Tables } from "$lib/supabase/types";

  const {
    faceRequest,
    onSuccess,
  }: { faceRequest: Tables<"face_requests">; onSuccess?: () => void } =
    $props();

  const declineMutation = createFaceRequestDeleteMutation({
    onSuccess,
    onError: (_, err) => displayErrorMessage(err),
  });
</script>

<button
  class="btn btn-warning"
  disabled={$declineMutation.isLoading}
  onclick={() => declineMutation.call(faceRequest)}
>
  {#if $declineMutation.isLoading}
    <span class="loading loading-spinner"></span>
  {/if}
  Decline
</button>
