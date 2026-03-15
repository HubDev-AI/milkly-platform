export const storage = {
  upload: async (_key: string, _body: Buffer, _contentType: string): Promise<string> => {
    throw new Error("Storage not implemented yet");
  },
};
