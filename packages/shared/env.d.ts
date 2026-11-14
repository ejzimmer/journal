declare module '*.css';

declare namespace NodeJS {
  interface ProcessEnv {
    readonly PUBLIC_URL: string;
  }
}
