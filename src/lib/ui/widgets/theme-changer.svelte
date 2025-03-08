<script lang="ts">
  import { PaletteIcon } from "lucide-svelte";

  const props: { class?: string } = $props();
</script>

<div class={["dropdown dropdown-end dropdown-bottom", props.class]}>
  <button class="btn btn-ghost btn-circle font-normal"
    ><PaletteIcon size={18} />
  </button>
  <ul
    class="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
  >
    <li>
      <button data-set-theme="light" data-act-class="ACTIVECLASS"
        >Default</button
      >
    </li>
    <li>
      <button data-set-theme="dark" data-act-class="ACTIVECLASS">Dark</button>
    </li>
    <li>
      <button data-set-theme="cupcake" data-act-class="ACTIVECLASS"
        >Cupcake</button
      >
    </li>
  </ul>
</div>
