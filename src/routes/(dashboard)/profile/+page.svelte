<script lang="ts">
  import session from "$lib/stores/session";
  import { getProfile } from "$lib/supabase/query";
  import { getPublicURLFormFullPath } from "$lib/supabase/storage";
  import type { Tables } from "$lib/supabase/types";
  import Avatar from "$lib/ui/widgets/Avatar.svelte";
  import { toast } from "$lib/ui/widgets/Toaster.svelte";
  import { CalendarIcon, IdCardIcon, UserIcon } from "lucide-svelte";
  import FacesView from "./faces-view.svelte";
  import { goto } from "$app/navigation";
  import supabase from "$lib/supabase";

  let profile: Tables<"profiles"> | undefined | null = $state(undefined);

  $effect(() => {
    if ($session === null) goto("/signin");
    else if ($session) {
      getProfile($session.user.id).then(
        (data) => {
          profile = data.data;
        },
        (err) => {
          toast(String(err), {
            description: "failed to load profile",
            type: "error",
          });
        },
      );
    }
  });
</script>

<div class="max-w-[1024px] w-full mx-auto space-y-5 pb-10">
  <div
    class="h-60 bg-blue-500 bg-no-repeat bg-cover bg-center rounded-b-xl"
    style="background-image: url({getPublicURLFormFullPath(profile?.banner)});"
  ></div>
  <div class="max-w-6xl flex-col flex items-center m-auto w-full">
    <div class="flex flex-col gap-5 px-5 w-full">
      {@render ProfileHeader()}
      {@render ProfileDescription()}
    </div>
  </div>
  <FacesView />
</div>

{#snippet ProfileDescription()}
  <div class="text-base-200">
    <span class="flex items-center gap-2 mb-2">
      <UserIcon size={18} />
      <h2 class="text-xl leading-none">{profile?.name}</h2>
    </span>
    <span class="flex items-center gap-2">
      <IdCardIcon size={18} />
      <small class="leading-none">{profile?.uid}</small>
    </span>
    <span class="flex items-center gap-2">
      <CalendarIcon size={18} />
      <small>{new Date(profile?.created_at ?? 0).toLocaleDateString()}</small>
    </span>
  </div>
{/snippet}

{#snippet ProfileHeader()}
  <div
    class="min-h-[40px] max-h-[100px] h-[6vw] flex items-start gap-5 justify-between mt-2"
  >
    <div
      class="min-w-[80px] max-w-[200px] w-[12vw] h-full overflow-visible flex-shrink-0 flex flex-col-reverse"
    >
      <Avatar
        class="w-full h-auto aspect-square flex-shrink-0 ring-2 ring-black/20"
        src={getPublicURLFormFullPath(profile?.picture)}
      />
    </div>
    <div class="h-full overflow-visible flex gap-2 justify-end">
      <button
        class="btn btn-warning btn-outline"
        onclick={() => supabase.auth.signOut()}>Logout</button
      >
      <button class="btn btn-info btn-outline">Edit</button>
    </div>
  </div>
{/snippet}
