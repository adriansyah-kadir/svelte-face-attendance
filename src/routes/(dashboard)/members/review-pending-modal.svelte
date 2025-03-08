<script lang="ts">
  import { getMemberFaceRequests } from "$lib/supabase/query";
  import { getPublicURLFormFullPath } from "$lib/supabase/storage";
  import type { Tables } from "$lib/supabase/types";
  import { UserCogIcon } from "lucide-svelte";
  import Image from "$lib/ui/widgets/Image.svelte";
  import { fly } from "svelte/transition";
  import { flip } from "svelte/animate";
  import { toast } from "$lib/ui/widgets/Toaster.svelte";
  import AcceptRequestBtn from "./accept-request-btn.svelte";
  import DeclineRequestBtn from "./decline-request-btn.svelte";

  let open = $state(false);
  let faces: Tables<"face_requests">[] | undefined = $state(undefined);
  const { member }: { member: Tables<"members"> } = $props();
  const modalId = `${member.id}-review-pending-modal`;

  $effect(() => {
    if (open) {
      getMemberFaceRequests(member.id!).then(
        (d) => (faces = d.data ?? []),
        (err) => {
          console.error(err)
          faces = [];
          toast("Error", {
            description: "failed getting face requests",
          });
        },
      );
    }
  });

  function remove(id: number) {
    return () => {
      faces = faces?.filter((e) => e.id !== id);
    };
  }
</script>

<label for={modalId} class="btn btn-sm btn-soft btn-circle btn-warning"
  ><UserCogIcon size={18} />
</label>
<input bind:checked={open} type="checkbox" id={modalId} class="modal-toggle" />
<div class="modal" role="dialog">
  <div class="modal-box overflow-hidden">
    <h3 class="text-lg font-bold mb-4">Pending {member.name}</h3>
    {#if faces === undefined}
      <span class="loading-spinner loading"></span>
    {:else}
      <div class="stack w-full aspect-video">
        {#each faces as face (face.id)}
          <div
            animate:flip
            out:fly={{ x: 50, duration: 1000 }}
            class="card bg-base-300 image-full w-96 shadow-md ring before:opacity-[0_!important]"
          >
            <figure>
              <Image src={getPublicURLFormFullPath(face.image)} />
            </figure>
            <div class="card-body justify-end m-0 p-1">
              <div class="card-actions p-2">
                <AcceptRequestBtn
                  faceRequest={face}
                  onSuccess={remove(face.id)}
                />
                <DeclineRequestBtn
                  faceRequest={face}
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
