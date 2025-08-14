export const hashPreprocessor = () => ({
  name: "hash-preprocessor",
  markup: async ({ filename, content }) => {
    const rune = "$hashed";
    const encoder = new TextEncoder();
    const result = await replaceAllAsync(
      content,
      rune,
      async (_, offset, raw) => {
        const buffer = await crypto.subtle.digest(
          "SHA-1",
          encoder.encode(filename + "\0\0" + raw.slice(0, offset)),
        );
        const hash = Array.from(new Uint8Array(buffer))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        return hash;
      },
    );
    return { code: result };
  },
});

const replaceAllAsync = async (str, pattern, func) => {
  const matches = [...str.matchAll(new RegExp("\\" + pattern, "g"))];
  const replaces = await Promise.all(
    matches.map((match) => func(match[0], match.index, str)),
  );
  let i = 0;
  return str.replaceAll(pattern, () => replaces[i++]);
};
