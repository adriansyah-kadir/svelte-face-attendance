<script lang="ts">
  import { getMemberFaceEmbeddings } from "$lib/supabase/query";
  import { getPublicURLFormFullPath } from "$lib/supabase/storage";
  import type { Tables } from "$lib/supabase/types";
  import Image from "$lib/ui/widgets/Image.svelte";
  import { toast } from "$lib/ui/widgets/Toaster.svelte";
  import { UserCheckIcon } from "lucide-svelte";
  import DeleteFaceEmbeddingBtn from "./delete-face-embedding-btn.svelte";

  const { member }: { member: Tables<"members"> } = $props();
  const modalId = `${member.id}-review-accepted-modal`;
  let faces: Tables<"face_embeddings">[] | undefined = $state();
  let open = $state(false);

  $effect(() => {
    if (open) {
      getMemberFaceEmbeddings(member.id!).then(
        (d) => (faces = d.data ?? []),
        (err) => {
          console.error(err);
          toast(String(err), {
            description: "failed getting faces",
          });
        }
      );
    }
  });

  function remove(id: number) {
    return () => {
      faces = faces?.filter((e) => e.id !== id);
    };
  }
</script>

<label for={modalId} class="btn btn-sm btn-soft btn-circle btn-success"
  ><UserCheckIcon size={18} />
</label>
<input bind:checked={open} type="checkbox" id={modalId} class="modal-toggle" />
<div class="modal" role="dialog">
  <div class="modal-box">
    <h3 class="text-lg font-bold mb-4">Accepted {member.name}</h3>
    {#if faces === undefined}
      <span class="loading-spinner loading"></span>
    {:else}
      <div class="stack w-full aspect-video">
        {#each faces as face}
          <div
            class="card bg-base-300 image-full w-96 shadow-md ring before:opacity-[0_!important]"
          >
            <figure>
              <Image src={getPublicURLFormFullPath(face.image)} />
            </figure>
            <div class="card-body justify-end m-0 p-1">
              <div class="card-actions p-2">
                <DeleteFaceEmbeddingBtn
                  faceEmbedding={face}
                  onSuccess={remove(face.id)}
                />
              </div>
            </div>
          </div>
        {:else}
          Empty
        {/each}
      </div>
    {/if}
    <div class="modal-action">
      <label for={modalId} class="btn">Close!</label>
    </div>
  </div>
</div>
