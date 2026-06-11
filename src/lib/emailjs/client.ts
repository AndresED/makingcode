type EmailJsSend = (
  serviceId: string,
  templateId: string,
  params: Record<string, string>,
  publicKey: string,
) => Promise<unknown>;

interface EmailJsWindow extends Window {
  emailjs?: { send: EmailJsSend };
}

const SCRIPT_SRC = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';

let scriptPromise: Promise<void> | null = null;

function loadEmailJsScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('EmailJS is only available in the browser'));
  }

  const win = window as EmailJsWindow;
  if (win.emailjs) return Promise.resolve();

  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = SCRIPT_SRC;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load EmailJS'));
      document.head.appendChild(script);
    });
  }

  return scriptPromise;
}

export async function sendEmailJsTemplate(
  serviceId: string,
  templateId: string,
  params: Record<string, string>,
  publicKey: string,
): Promise<void> {
  await loadEmailJsScript();
  const win = window as EmailJsWindow;
  if (!win.emailjs) {
    throw new Error('EmailJS is not available');
  }
  await win.emailjs.send(serviceId, templateId, params, publicKey);
}
