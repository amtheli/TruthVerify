declare module 'react' {
  export = React;
}

declare module 'react-dom/client' {
  export function createRoot(container: Element | null): {
    render(element: React.ReactNode): void;
    unmount(): void;
  };
}

declare module 'react-redux' {
  export function useSelector<T = any, U = any>(
    selector: (state: T) => U,
    equalityFn?: (left: U, right: U) => boolean
  ): U;
  
  export function useDispatch<T = any>(): (action: T) => T;
  
  export interface ProviderProps {
    store: any;
    children: React.ReactNode;
  }
  
  export function Provider(props: ProviderProps): JSX.Element;
}

declare module '@reduxjs/toolkit' {
  export function configureStore(options: {
    reducer: any;
    middleware?: any;
    devTools?: boolean;
    preloadedState?: any;
    enhancers?: any[];
  }): any;
  
  export function createSlice(options: {
    name: string;
    initialState: any;
    reducers: Record<string, (state: any, action: any) => void | any>;
  }): {
    actions: Record<string, (payload?: any) => { type: string; payload?: any }>;
    reducer: (state: any, action: any) => any;
    name: string;
  };
  
  export interface PayloadAction<P = any> {
    payload: P;
    type: string;
  }
}

declare namespace React {
  interface ReactNode {
    // Empty interface to satisfy TypeScript
  }
  
  interface FC<P = {}> {
    (props: P): JSX.Element | null;
    displayName?: string;
  }
  
  function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  
  function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  
  function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
  
  function useMemo<T>(factory: () => T, deps: any[]): T;
}

declare namespace JSX {
  interface Element {
    // Empty interface to satisfy TypeScript
  }
  
  interface IntrinsicElements {
    div: any;
    span: any;
    button: any;
    input: any;
    label: any;
    select: any;
    option: any;
    h1: any;
    h2: any;
    h3: any;
    h4: any;
    h5: any;
    h6: any;
    p: any;
    a: any;
    ul: any;
    ol: any;
    li: any;
    form: any;
  }
} 