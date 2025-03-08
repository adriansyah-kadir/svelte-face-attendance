<script lang="ts">
  import { afterNavigate } from "$app/navigation";
  import { page } from "$app/state";
  import { FileIcon, ScanFaceIcon, UsersIcon } from "lucide-svelte";
  import { onMount } from "svelte";

  let dock: HTMLDivElement;
  let current_path = $state(
    page.url.pathname.split("/").filter(Boolean).pop() || "/",
  );

  afterNavigate(() => {
    current_path = page.url.pathname.split("/").filter(Boolean).pop() || "/";
  });

  onMount(() => {
    document.body.style.paddingBottom = dock.clientHeight + "px";
  });
</script>

<div class="dock sm:hidden" bind:this={dock}>
  <a href="/live" class:dock-active={current_path.startsWith("live")}>
    <ScanFaceIcon />
    <span class="dock-label">Live</span>
  </a>

  <a
    class:dock-active={current_path.startsWith("attendances")}
    href="/attendances"
  >
    <FileIcon />
    <span class="dock-label">Attendances</span>
  </a>

  <a class:dock-active={current_path.startsWith("members")} href="/members">
    <UsersIcon />
    <span class="dock-label">Members</span>
  </a>
</div>
