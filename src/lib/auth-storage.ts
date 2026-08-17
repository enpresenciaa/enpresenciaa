import * as SecureStore from "expo-secure-store";

const CHUNK_SIZE = 1800;
const metadataSuffix = ".metadata";

function getChunkKey(key: string, index: number): string {
  return `${key}.chunk.${index}`;
}

function getMetadataKey(key: string): string {
  return `${key}${metadataSuffix}`;
}

async function getChunkCount(key: string): Promise<number> {
  const storedCount = await SecureStore.getItemAsync(getMetadataKey(key));
  const count = Number(storedCount);

  return Number.isInteger(count) && count > 0 ? count : 0;
}

async function removeChunks(key: string, count: number): Promise<void> {
  await Promise.all(Array.from(
    { length: count },
    (_, index) => SecureStore.deleteItemAsync(getChunkKey(key, index)),
  ));
}

export const authStorage = {
  async getItem(key: string): Promise<string | null> {
    const count = await getChunkCount(key);

    if (count === 0) {
      return null;
    }

    const chunks = await Promise.all(Array.from(
      { length: count },
      (_, index) => SecureStore.getItemAsync(getChunkKey(key, index)),
    ));

    if (chunks.includes(null)) {
      await authStorage.removeItem(key);
      return null;
    }

    return chunks.join("");
  },

  async removeItem(key: string): Promise<void> {
    const count = await getChunkCount(key);
    await removeChunks(key, count);
    await SecureStore.deleteItemAsync(getMetadataKey(key));
  },

  async setItem(key: string, value: string): Promise<void> {
    const previousCount = await getChunkCount(key);
    const chunks = value.match(new RegExp(`.{1,${CHUNK_SIZE}}`, "gs")) ?? [];

    await Promise.all(
      chunks.map((chunk, index) =>
        SecureStore.setItemAsync(getChunkKey(key, index), chunk),
      ),
    );
    await SecureStore.setItemAsync(getMetadataKey(key), String(chunks.length));

    if (previousCount > chunks.length) {
      await Promise.all(
        Array.from(
          { length: previousCount - chunks.length },
          (_, offset) => SecureStore.deleteItemAsync(
            getChunkKey(key, chunks.length + offset),
          ),
        ),
      );
    }
  },
};
