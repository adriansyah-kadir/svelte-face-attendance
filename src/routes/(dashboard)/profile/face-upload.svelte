<script lang="ts">
  import {
    createFaceRequestDeleteMutation,
    createFaceRequestInsertMutation,
  } from "$lib/mutations/face-requests";
  import session from "$lib/stores/session";
  import { getPublicURLFormFullPath } from "$lib/supabase/storage";
  import type { Tables } from "$lib/supabase/types";
  import Image from "$lib/ui/widgets/Image.svelte";
  import { toast } from "$lib/ui/widgets/Toaster.svelte";
  import { TrashIcon } from "lucide-svelte";

  const {
    file,
    face,
  }: {
    file?: File;
    face?: Tables<"faces">;
  } = $props();
  const imageUrl = $derived.by(() => {
    if (face) return getPublicURLFormFullPath(face.image);
    if (file) return URL.createObjectURL(file);
  });
  const faceRequestInsertMutation = createFaceRequestInsertMutation();
  const faceRequestDeleteMutation = createFaceRequestDeleteMutation({});
  const status = $derived.by(() => {
    if ($faceRequestDeleteMutation.isSuccess) return "deleted";
    if (face?.status === "accepted") return "accepted";
    if (
      $faceRequestInsertMutation.isError ||
      $faceRequestDeleteMutation.isError
    )
      return "error";
    if ($faceRequestInsertMutation.isSuccess || face?.status === "pending")
      return "pending";
    return "loading";
  });

  $effect(() => {
    if (file) {
      if (!$session) toast("Please Login", { type: "warning" });
      else {
        faceRequestInsertMutation.call({ file, userId: $session.user.id });
      }
    }
  });
</script>

<div
  class="card bg-base-300 image-full w-80 aspect-video shadow-md ring ring-black/10 before:opacity-[0_!important] relative"
>
  <figure>
    <Image class="object-cover w-full h-full skeleton" src={imageUrl} />
  </figure>
  <div class="absolute bottom-0 left-0 p-1 w-full">
    <div
      class="p-1 backdrop-blur-sm w-full rounded-lg shadow-md ring ring-black/5"
      class:btn-circle={$faceRequestInsertMutation.isLoading}
    >
      <button
        class="btn btn-xs rounded-lg"
        class:btn-warning={status === "pending"}
        class:btn-info={status === "loading"}
        class:btn-circle={status === "loading"}
        class:btn-success={status === "accepted"}
        class:btn-error={status === "error" || status === "deleted"}
      >
        {#if status === "pending"}
          pending
        {:else if status === "error"}
          error
        {:else if status === "deleted"}
          deleted
        {:else if status === "accepted"}
          accepted
        {:else if $faceRequestInsertMutation.isLoading}
          <span class="loading loading-spinner loading-xs"></span>
        {/if}
      </button>
      {#if ($faceRequestInsertMutation.isSuccess || face) && !$faceRequestDeleteMutation.isSuccess}
        <button
          class="btn btn-xs rounded-lg btn-error btn-circle"
          disabled={$faceRequestDeleteMutation.isLoading}
          onclick={() => {
            if (face && face.status === "pending")
              faceRequestDeleteMutation.call(face as Tables<"face_requests">);
            else if ($faceRequestInsertMutation.value)
              faceRequestDeleteMutation.call($faceRequestInsertMutation.value);
          }}
        >
          {#if $faceRequestDeleteMutation.isLoading}
            <span class="loading loading-spinner loading-xs"></span>
          {:else}
            <TrashIcon size={16} />
          {/if}
        </button>
      {/if}
    </div>
  </div>
</div>
