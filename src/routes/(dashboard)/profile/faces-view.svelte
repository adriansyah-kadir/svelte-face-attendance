<script lang="ts">
  import { pickFiles } from "$lib";
  import session from "$lib/stores/session";
  import { getMemberFaces } from "$lib/supabase/query";
  import { PlusCircleIcon } from "lucide-svelte";
  import FaceUpload from "./face-upload.svelte";

  let files: File[] = $state([]);
</script>

<div class="p-5">
  <h4 class="text-lg mb-5 text-base-200">Data Wajah Absensi</h4>
  <div class="flex flex-wrap overflow-y-visible gap-3">
    <button
      class="cursor-pointer active:scale-95 transition-all card bg-base-300 image-full w-80 aspect-video shadow-md ring ring-black/10 before:opacity-[0_!important] relative flex items-center justify-center"
      onclick={async () => {
        files = await pickFiles({ multiple: true, accept: "image/*" });
      }}
    >
      <div class="flex flex-col items-center justify-center">
        <PlusCircleIcon />
        Tambah Wajah
      </div>
    </button>
    {#each files as file}
      <FaceUpload {file} />
    {/each}
    {#if $session}
      {#await getMemberFaces($session.user.id)}
        <div
          class="skeleton cursor-pointer active:scale-95 transition-all card bg-base-300 image-full w-80 aspect-video shadow-md ring ring-black/10 before:opacity-[0_!important] relative flex items-center justify-center"
        >
          <span class="loading loading-spinner"></span>
        </div>
      {:then faces}
        {#each faces.data ?? [] as face}
          <FaceUpload {face} />
        {/each}
      {/await}
    {/if}
  </div>
</div>
