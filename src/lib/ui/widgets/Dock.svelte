<script lang="ts">
  import { base } from "$app/paths";
  import { page } from "$app/state";
  import { FileIcon, ScanFaceIcon, UsersIcon } from "lucide-svelte";
  import { onMount } from "svelte";

  let dock: HTMLDivElement;
  const current_path = $derived(page.url.pathname);

  onMount(() => {
    document.body.style.paddingBottom = dock.clientHeight + "px";
  });
</script>

<div class="dock sm:hidden" bind:this={dock}>
  <a
    href="{base}/live"
    class:dock-active={current_path.startsWith(base + "/live")}
  >
    <ScanFaceIcon />
    <span class="dock-label">Live</span>
  </a>

  <a
    class:dock-active={current_path.startsWith(base + "/attendances")}
    href="{base}/attendances"
  >
    <FileIcon />
    <span class="dock-label">Attendances</span>
  </a>

  <a
    class:dock-active={current_path.startsWith(base + "members")}
    href="{base}/members"
  >
    <UsersIcon />
    <span class="dock-label">Members</span>
  </a>
</div>
