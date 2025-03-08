<script lang="ts">
  import "../app.css";
  import Toaster, { dismiss, toast } from "$lib/ui/widgets/Toaster.svelte";
  import { WifiOffIcon } from "lucide-svelte";
  import attendances from "$lib/supabase/realtimes/attendances";
  import profiles from "$lib/supabase/realtimes/profiles";
  import settings from "$lib/supabase/realtimes/settings";

  const { children } = $props();
  console.log($attendances, $profiles, $settings, "initializing realtime");
</script>

<svelte:window
  onoffline={() => {
    toast("Offline", {
      duration: null,
      description: "please check your internet connection",
      id: "internet-connection",
      type: "error",
      icon: NetworkError,
    });
  }}
  ononline={() => {
    dismiss("internet-connection");
  }}
/>

{#snippet NetworkError()}
  <WifiOffIcon />
{/snippet}

<Toaster />
{@render children()}
