// Type declarations for Chrome extension APIs
declare namespace chrome {
  namespace runtime {
    function sendMessage(
      message: any,
      responseCallback?: (response: any) => void
    ): void;
    
    const onMessage: {
      addListener(
        callback: (
          message: any,
          sender: chrome.runtime.MessageSender,
          sendResponse: (response?: any) => void
        ) => boolean | void
      ): void;
      removeListener(
        callback: (
          message: any,
          sender: chrome.runtime.MessageSender,
          sendResponse: (response?: any) => void
        ) => boolean | void
      ): void;
      hasListeners(): boolean;
    };
    
    interface MessageSender {
      tab?: chrome.tabs.Tab;
      frameId?: number;
      id?: string;
      url?: string;
      tlsChannelId?: string;
    }
  }
  
  namespace tabs {
    interface Tab {
      id?: number;
      index: number;
      pinned: boolean;
      highlighted: boolean;
      windowId: number;
      active: boolean;
      url?: string;
      title?: string;
      favIconUrl?: string;
      status?: string;
      incognito: boolean;
      width?: number;
      height?: number;
      sessionId?: string;
    }
    
    function query(
      queryInfo: {
        active?: boolean;
        currentWindow?: boolean;
        highlighted?: boolean;
        lastFocusedWindow?: boolean;
        status?: string;
        title?: string;
        url?: string | string[];
        windowId?: number;
        windowType?: string;
        index?: number;
        pinned?: boolean;
      },
      callback: (result: Tab[]) => void
    ): void;
    
    function create(
      createProperties: {
        active?: boolean;
        cookieStoreId?: string;
        index?: number;
        openerTabId?: number;
        pinned?: boolean;
        url?: string;
        windowId?: number;
      },
      callback?: (tab: Tab) => void
    ): void;
    
    function sendMessage(
      tabId: number,
      message: any,
      options?: { frameId?: number },
      responseCallback?: (response: any) => void
    ): Promise<any>;
  }
  
  namespace storage {
    interface StorageArea {
      get(
        keys: string | string[] | object | null,
        callback?: (items: { [key: string]: any }) => void
      ): Promise<{ [key: string]: any }>;
      
      set(
        items: { [key: string]: any },
        callback?: () => void
      ): Promise<void>;
      
      remove(
        keys: string | string[],
        callback?: () => void
      ): Promise<void>;
      
      clear(callback?: () => void): Promise<void>;
    }
    
    const sync: StorageArea;
    const local: StorageArea;
    const managed: StorageArea;
    const session: StorageArea;
  }
} 