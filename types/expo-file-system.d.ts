declare module "expo-file-system" {
  export const cacheDirectory: string | null;
  export const documentDirectory: string | null;

  export enum EncodingType {
    UTF8 = "utf8",
    Base64 = "base64",
  }

  // Ha kell, felveheted a meglévő típusokat is
  export function writeAsStringAsync(
    fileUri: string,
    contents: string,
    options?: { encoding?: EncodingType }
  ): Promise<void>;
}
