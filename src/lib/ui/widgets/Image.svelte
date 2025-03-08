<script lang="ts">
  import { BanIcon } from "lucide-svelte";
  import type { Snippet } from "svelte";
  import type { HTMLImgAttributes } from "svelte/elements";
  const {
    showFallback = true,
    fallbackWidget = DefaultFallback,
    ...imgprops
  }: HTMLImgAttributes & {
    showFallback?: boolean;
    fallbackWidget?: Snippet;
  } = $props();

  let error = $state(false);
</script>

{#if error && showFallback && fallbackWidget}
  {@render fallbackWidget()}
{:else}
  <img {...imgprops} onerror={() => (error = true)} />
{/if}

{#snippet DefaultFallback()}
  <BanIcon />
{/snippet}
