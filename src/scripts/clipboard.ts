export const COPY_SUCCESS_MESSAGE = 'Correo copiado al portapapeles';
export const TOAST_HIDE_DELAY_MS = 2600;
export const TOAST_VISIBLE_CLASS = 'toast--visible';

export interface ClipboardWriter {
  writeText(text: string): Promise<void>;
}

export interface ToastView {
  container: {
    classList: {
      add(token: string): void;
      remove(token: string): void;
    };
  };
  message: {
    textContent: string | null;
  };
}

export async function copyToClipboard(
  text: string,
  onSuccess: () => void,
  clipboard: ClipboardWriter = navigator.clipboard,
): Promise<boolean> {
  try {
    await clipboard.writeText(text);
    onSuccess();
    return true;
  } catch {
    return false;
  }
}

let hideTimeout: ReturnType<typeof setTimeout> | undefined;

export function showToast(
  view: ToastView,
  message: string = COPY_SUCCESS_MESSAGE,
  hideDelayMs: number = TOAST_HIDE_DELAY_MS,
): void {
  view.message.textContent = message;
  view.container.classList.add(TOAST_VISIBLE_CLASS);
  clearTimeout(hideTimeout);
  hideTimeout = setTimeout(() => {
    view.container.classList.remove(TOAST_VISIBLE_CLASS);
    hideTimeout = undefined;
  }, hideDelayMs);
}
