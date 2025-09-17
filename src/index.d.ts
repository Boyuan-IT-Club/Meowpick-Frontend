export {};
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      VITE_SERVER_HOST_PORT: string;
      VITE_TOKEN_NAME: string;
    }
  }

  type JsonRet<T> = {
    msg: string;
    code: number;
    data: T;
  };

  interface InitializeComponent {
    init: () => void;
  }
}
