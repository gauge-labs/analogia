import type { EditorEngine } from "./engine";
import { WebviewEventHandler } from "./eventHandler";

interface WebviewContext {
  handlerRemovers: (() => void)[];
}

export class WebviewMessageBridge {
  webviews: Map<string, WebviewContext> = new Map();
  eventHandlers: Record<string, (e: any) => void>;

  constructor(editorEngine: EditorEngine) {
    const webviewEventHandler = new WebviewEventHandler(editorEngine);
    this.eventHandlers = {
      "ipc-message": webviewEventHandler.handleIpcMessage,
      "console-message": webviewEventHandler.handleConsoleMessage,
    };
  }

  register(webview: Electron.WebviewTag, id: string) {
    const handlerRemovers: (() => void)[] = [];
    Object.entries(this.eventHandlers).forEach(([event, handler]) => {
      webview.addEventListener(event, handler as any);
      handlerRemovers.push(() => {
        webview.removeEventListener(event, handler as any);
      });
    });
    this.webviews.set(id, { handlerRemovers });
  }

  deregister(webview: Electron.WebviewTag) {
    const context = this.webviews.get(webview.id);
    if (!context) {
      return;
    }
    context.handlerRemovers.forEach((removeHandler) => removeHandler());
    this.webviews.delete(webview.id);
  }

  dispose() {
    // Clean up all webview event handlers
    Array.from(this.webviews.values()).forEach((context) => {
      context.handlerRemovers.forEach((removeHandler) => removeHandler());
    });
    this.webviews.clear();

    // Clear event handlers
    this.eventHandlers = {};
  }
}
