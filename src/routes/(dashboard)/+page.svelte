<script lang="ts">
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
  import { onMount } from "svelte";

  onMount(() => {
    goto(base + "/live");
  });
</script>

<div>redirecting...</div>
