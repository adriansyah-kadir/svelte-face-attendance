<script context="module" lang="ts">
  import {
    AlertCircleIcon,
    CheckCircleIcon,
    InfoIcon as InfoCircleIcon,
    XIcon,
  } from "lucide-svelte";
  import type { Snippet } from "svelte";
  import { flip } from "svelte/animate";
  import { get, writable } from "svelte/store";
  import { fly } from "svelte/transition";

  type Toast<T = any> = {
    id: string;
    title: string;
    description?: string | ((v: T) => string);
    class?: string;
    promise?: Promise<T>;
    duration?: number | null;
    action?: Snippet<[Toast<T>]> | null;
    icon?: Snippet | null;
    type?: string;
  };

  export const toasts = writable<Record<Toast["id"], Toast>>({});

  export function toast<T>(
    title: string,
    toast: Omit<Toast<T>, "id" | "title"> & { id?: Toast<T>["id"] } = {}
  ) {
    const id = toast?.id ?? crypto.randomUUID();
    const loading = toast.type === "loading";
    const error = toast.type === "error";
    const success = toast.type === "success";
    const info = toast.type === "info";
    toast = { icon: undefined, ...toast };
    toast = { action: DefaultAction, ...get(toasts)[id], ...toast };
    toast.duration =
      toast.duration === undefined && !toast.promise ? 3000 : toast.duration;
    toast.icon = loading && toast.icon === undefined ? LoadingIcon : toast.icon;
    toast.icon = error && toast.icon === undefined ? ErrorIcon : toast.icon;
    toast.icon = success && toast.icon === undefined ? SuccessIcon : toast.icon;
    toast.icon = info && toast.icon === undefined ? InfoIcon : toast.icon;

    if (toast.duration) {
      setTimeout(() => {
        dismiss(id);
      }, toast.duration);
    }

    toasts.update((prev) => {
      return {
        ...prev,
        [id]: {
          ...toast,
          id,
          title,
        },
      };
    });

    return id;
  }

  export function dismiss(id: Toast["id"]) {
    toasts.update((prev) => {
      delete prev[id];
      return prev;
    });
  }
</script>

{#snippet LoadingIcon()}
  <span class="loading loading-spinner"></span>
{/snippet}

{#snippet ErrorIcon()}
  <AlertCircleIcon />
{/snippet}

{#snippet SuccessIcon()}
  <CheckCircleIcon />
{/snippet}

{#snippet InfoIcon()}
  <InfoCircleIcon />
{/snippet}

{#snippet DefaultAction(v: Toast<any>)}
  <button class="btn btn-circle btn-sm" onclick={() => dismiss(v.id)}>
    <XIcon size={18} />
  </button>
{/snippet}

<div class="toast toast-end z-[99999]">
  {#each Object.entries($toasts) as [k, v] (k)}
    {@const loading = v.type === "loading"}
    {@const error = v.type === "error"}
    {@const success = v.type === "success"}
    {@const info = v.type === "info"}
    {@const warning = v.type === "warning"}
    <div
      role="alert"
      class={[
        "alert flex items-center alert-vertical sm:alert-horizontal",
        v.class,
        {
          "alert-success": success,
          "alert-error": error,
          "alert-info": info || loading,
          "alert-warning": warning,
        },
      ]}
      animate:flip
      out:fly={{ y: 20 }}
    >
      {#if v.icon}
        {@render v.icon()}
      {/if}
      <div class="shrink w-full">
        <h3 class="font-bold whitespace-pre-wrap text-start">
          {v.title}
        </h3>
        {#if v.description}
          <p class="text-xs whitespace-pre-wrap text-start">{v.description}</p>
        {/if}
      </div>
      {#if v.action}
        {@render v.action(v)}
      {/if}
    </div>
  {/each}
</div>
