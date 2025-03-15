<script lang="ts">
  import ThemeChanger from "./theme-changer.svelte";
  import { PUBLIC_APP_NAME } from "$env/static/public";
  import { getProfile } from "$lib/supabase/query";
  import { getPublicURLFormFullPath } from "$lib/supabase/storage";
  import Avatar from "./Avatar.svelte";
  import session, { type SessionValue } from "$lib/stores/session";
  import { page } from "$app/state";
  import { base } from "$app/paths";

  const current_path = $derived(page.url.pathname);
  const props: { class?: string } = $props();
</script>

<div class={["navbar bg-base-100 shadow-sm px-5", props.class]}>
  <div class="navbar-start">
    <!-- {@render mobile_navigation()} -->
    <a href="{base}/" class="btn btn-ghost text-xl">{PUBLIC_APP_NAME}</a>
  </div>
  {@render desktop_navigation()}
  <div class="navbar-end gap-2">
    <div>
      <ThemeChanger />
    </div>
    {@render SessionMenu($session)}
  </div>
</div>

{#snippet desktop_navigation()}
  <div class="navbar-center sm:flex hidden">
    <ul class="menu menu-horizontal px-1 gap-2">
      <li>
        <a
          href="{base}/live"
          class:menu-active={current_path.startsWith(base + "/live")}
          >Live Attendance</a
        >
      </li>
      <li>
        <a
          href="{base}/attendances"
          class:menu-active={current_path.startsWith(base + "/attendances")}
          >Attendances</a
        >
      </li>
      <li>
        <a
          href="{base}/members"
          class:menu-active={current_path.startsWith(base + "/members")}
          >Members</a
        >
      </li>
    </ul>
  </div>
{/snippet}

<!-- {#snippet mobile_navigation()} -->
<!--   <div class="dropdown sm:hidden"> -->
<!--     <button class="btn btn-ghost btn-circle"><AlignLeftIcon size={18} /></button -->
<!--     > -->
<!--     <ul -->
<!--       class="menu dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow" -->
<!--     > -->
<!--       <li><a href="/live"><ScanFaceIcon size={18} /> Live Attendance</a></li> -->
<!--       <li><a href="/attendances"><FileIcon size={18} /> Attendances</a></li> -->
<!--       <li><a href="/members"><UsersIcon size={18} /> Members</a></li> -->
<!--     </ul> -->
<!--   </div> -->
<!-- {/snippet} -->

{#snippet SessionMenu(session: SessionValue)}
  {#if session}
    {#await getProfile(session.user.id)}
      <button aria-label="loading profile" class="btn btn-ghost btn-circle">
        <span class="loading loading-spinner"></span>
      </button>
    {:then profile}
      <a href="{base}/profile">
        <Avatar src={getPublicURLFormFullPath(profile?.data?.picture)} />
      </a>
    {/await}
  {:else}
    <a class="btn btn-primary font-normal" href="{base}/signin">Login</a>
  {/if}
{/snippet}
