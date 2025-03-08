<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import Image from "./Image.svelte";
  import { UserIcon } from "lucide-svelte";

  const { src, ...props }: HTMLAttributes<HTMLDivElement> & { src?: string } =
    $props();
</script>

<div {...props} class={["avatar btn btn-soft btn-circle", props.class]}>
  <div class="rounded-full">
    <Image {src}>
      {#snippet fallbackWidget()}
        <UserIcon />
      {/snippet}
    </Image>
  </div>
</div>
