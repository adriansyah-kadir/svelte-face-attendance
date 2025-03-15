import { writable, type Readable } from "svelte/store";
import { toast } from "./ui/widgets/Toaster.svelte";
import ExcelJS from "exceljs";
import { HTTPError } from "ky";

export function zip<A, B>(a: A[], b: B[]): [A, B][] {
  return a.map(function (e, i) {
    return [e, b[i]];
  });
}

export function getany<T>(
  obj: any,
  keys: any[],
  defaultValue?: T
): T | undefined {
  let value = obj;

  for (const key of keys) {
    if (value && key in value) {
      value = value[key];
    } else {
      return defaultValue;
    }
  }

  return value ?? defaultValue;
}

type Config<I, T> = {
  fn: (i: I) => Promise<T>;
  onSuccess?: (i: I, value: T) => void;
  onError?: (i: I, error: any) => void;
};
export function callapi<I = any, T = undefined>(config: Config<I, T>) {
  const state = writable({
    isLoading: false,
    isSuccess: false,
    isError: false,
    value: undefined as T | undefined,
    error: undefined as any | undefined,
  });

  return {
    subscribe: state.subscribe,
    reset: () => {
      state.set({
        isLoading: false,
        isSuccess: false,
        isError: false,
        value: undefined as T | undefined,
        error: undefined as any | undefined,
      });
    },
    call: async (i: I) => {
      state.update((prev) => ({ ...prev, isLoading: true }));
      try {
        const v = await config.fn(i);
        state.update((prev) => ({ ...prev, v, isSuccess: true }));
        config.onSuccess?.call(undefined, i, v);
      } catch (error) {
        state.update((prev) => ({ ...prev, error, isError: true }));
        config.onError?.call(undefined, i, error);
      } finally {
        state.update((prev) => ({ ...prev, isLoading: false }));
      }
    },
  };
}

export async function pickFiles(opts?: {
  multiple?: boolean;
  accept?: string;
}) {
  const result = Promise.withResolvers<File[]>();
  const input = document.createElement("input");
  input.multiple = opts?.multiple ?? false;
  input.accept = opts?.accept ?? "*";
  input.type = "file";
  input.oncancel = result.reject;
  input.onchange = () => {
    const files = Array.from(input.files ?? []);
    result.resolve(files);
  };
  input.click();

  return result.promise;
}

export async function saveToExcel<T extends object>(
  data: Array<T>,
  filename = "output.xlsx"
) {
  if (!Array.isArray(data) || data.length === 0) {
    toast("Data tidak boleh kosong", { type: "error" });
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sheet1");

  // Extract column names dynamically from the first object
  const columns = Object.keys(data[0]).map((key) => ({ header: key, key }));
  worksheet.columns = columns;

  // Add rows
  data.forEach((item) => {
    worksheet.addRow(item);
  });

  // Save file
  let buffer = await workbook.xlsx.writeBuffer();
  let blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function reduceObject<T, K extends string | number>(key: (e: T) => K) {
  return (arr: T[]) =>
    arr.reduce((prev, curr) => ({ ...prev, [key(curr)]: curr }), {});
}

export function removeItem<T>(arr: T[], value: T, once = true) {
  let i = 0;
  while (i < arr.length) {
    if (arr[i] === value) {
      arr.splice(i, 1);
      if (once) return arr;
    } else {
      ++i;
    }
  }
  return arr;
}

export function storeLoaded<T>(
  store: Readable<T>,
  state: (t: T) => boolean | undefined
) {
  return new Promise((res, rej) => {
    store.subscribe((v) => {
      const b = state(v);
      if (b) res(undefined);
      else if (b === false) rej(undefined);
    });
  });
}

export async function displayErrorMessage(err: any, title?: string, id?: string) {
  if (err instanceof HTTPError) {
    const json = await err.response.json<{ detail: string }>();
    toast(title ?? err.name, {
      id,
      description: json.detail,
      type: "error",
    });
  } else if (err instanceof Error) {
    toast(title ?? err.name, {
      id,
      description: err.message,
      type: "error",
    });
  } else {
    toast(title ?? String(err), {
      id,
      type: "error",
    });
  }
}
