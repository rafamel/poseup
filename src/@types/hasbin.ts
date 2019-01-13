declare module 'hasbin' {
  export default function hasbin(
    name: string,
    cb: (result: boolean) => void
  ): void;
}
