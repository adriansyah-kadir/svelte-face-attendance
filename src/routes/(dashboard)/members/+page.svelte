<script lang="ts">
  import { getPublicURLFormFullPath } from "$lib/supabase/storage";
  import type { Tables } from "$lib/supabase/types";
  import Avatar from "$lib/ui/widgets/Avatar.svelte";
  import { SearchIcon, UserPenIcon } from "lucide-svelte";
  import ReviewPendingModal from "./review-pending-modal.svelte";
  import ReviewAcceptedModal from "./review-accepted-modal.svelte";
  import { onMount } from "svelte";
  import { toast } from "$lib/ui/widgets/Toaster.svelte";

  const { data } = $props();

  let status: string = $state("");
  let search: string = $state("");

  function filter(e: Tables<"members">) {
    const name = e.name!.toLowerCase();
    const uid = e.uid?.toLowerCase() ?? "";
    const search2 = search.toLowerCase();
    const s = status.length < 1 ? true : status === e.status;
    const i =
      search.length < 1
        ? true
        : name.includes(search2) || uid.includes(search2);
    return s && i;
  }

  onMount(() => {
    data.members.then((d) => {
      if (d.error) {
        toast(d.error.message, {
          description: "failed to load members",
          type: "error",
        });
      }
    });
  });
</script>

<div class="overflow-auto w-full h-full">
  <div
    class="h-full flex flex-col max-w-[1024px] w-max sm:w-full m-auto p-3 overflow-hidden"
  >
    <div class="my-4">
      <h2 class="text-white text-2xl font-semibold mb-2">Members</h2>
      <div class="flex items-center gap-2">
        <label class="input">
          <SearchIcon size={18} />
          <input
            bind:value={search}
            type="search"
            class="grow"
            placeholder="Search"
          />
          <kbd class="kbd kbd-sm">⌘</kbd>
          <kbd class="kbd kbd-sm">K</kbd>
        </label>
        <select bind:value={status} class="select btn w-min">
          <option value="">all</option>
          <option>accepted</option>
          <option>idle</option>
          <option>pending</option>
        </select>
      </div>
    </div>
    <div class="h-full w-full overflow-auto rounded-xl no-scrollbar">
      <table class="table table-pin-rows bg-base-300">
        <thead>
          <tr>
            <th>Name</th>
            <th>UID</th>
            <th>Role</th>
            <th>Joined at</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#await data.members}
            <tr>
              <td colspan="4">
                <span class="loading loading-spinner"></span>
              </td>
            </tr>
          {:then members}
            {#each members.data?.filter(filter) ?? [] as member}
              <tr>
                <td>
                  <div class="flex gap-2 items-center">
                    <Avatar src={getPublicURLFormFullPath(member.picture)} />
                    <div>
                      <p>{member.name}</p>
                      <small class="leading-0">{member.email}</small>
                    </div>
                  </div>
                </td>
                <td>{member.uid ?? "-"}</td>
                <td>{member.role}</td>
                <td>{new Date(member.created_at!).toLocaleString()}</td>
                <td class="text-nowrap">
                  <div class="inline-grid *:[grid-area:1/1]">
                    <div
                      class={[
                        "status animate-ping",
                        {
                          "status-warning": member.status === "pending",
                          "status-success": member.status === "accepted",
                        },
                      ]}
                    ></div>
                    <div
                      class={[
                        "status",
                        {
                          "status-warning": member.status === "pending",
                          "status-success": member.status === "accepted",
                        },
                      ]}
                    ></div>
                  </div>
                  {member.status}
                </td>
                <td>
                  <div class="flex gap-1">
                    {@render UpdateModal(member)}
                    <ReviewAcceptedModal {member} />
                    <ReviewPendingModal {member} />
                  </div>
                </td>
              </tr>
            {:else}
              <tr>
                <td colspan="4">Empty</td>
              </tr>
            {/each}
          {/await}
        </tbody>
      </table>
    </div>
  </div>
</div>

{#snippet UpdateModal(member: Tables<"members">)}
  {@const modalId = `${member.id}-update-modal`}
  <label for={modalId} class="btn btn-sm btn-soft btn-circle btn-info"
    ><UserPenIcon size={18} />
  </label>
  <input type="checkbox" id={modalId} class="modal-toggle" />
  <div class="modal" role="dialog">
    <div class="modal-box">
      <h3 class="text-lg font-bold mb-4">Update {member.name}</h3>
      <label class="input">
        <p>UID</p>
        <input type="text" class="grow" placeholder="T3121..." />
      </label>
      <div class="modal-action">
        <button class="btn btn-primary">Save</button>
        <label for={modalId} class="btn">Close!</label>
      </div>
    </div>
  </div>
{/snippet}
