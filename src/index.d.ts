export {};
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      VITE_SERVER_HOST_PORT: string;
      VITE_TOKEN_NAME: string;
    }
  }

  type JsonRet<T> = {
    state: {
      msg: string;
      code: number;
    };
    payload: T;
  };

  interface InitializeComponent {
    init: () => void;
  }
}
