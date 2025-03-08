<script lang="ts">
  import { backend_server } from "$lib/supabase/realtimes/settings";
  import type { Tables } from "$lib/supabase/types";
  import session from "$lib/stores/session";
  import { createFaceRequestAcceptMutation } from "$lib/mutations/face-requests";
  import { displayErrorMessage } from "$lib";

  const {
    faceRequest,
    onSuccess,
  }: { faceRequest: Tables<"face_requests">; onSuccess?: () => void } =
    $props();

  const acceptMutation = $derived.by(() => {
    if (!$backend_server || !$session?.access_token) return;
    return createFaceRequestAcceptMutation(
      $backend_server,
      $session.access_token,
      {
        onSuccess,
        onError: (_, err) => displayErrorMessage(err, "Accept Error"),
      },
    );
  });
</script>

<button
  class="btn btn-primary"
  disabled={$acceptMutation?.isLoading || !acceptMutation}
  onclick={() => {
    acceptMutation?.call(faceRequest.id);
  }}
>
  {#if $acceptMutation?.isLoading}
    <span class="loading loading-spinner"></span>
  {/if}
  Accept
</button>
