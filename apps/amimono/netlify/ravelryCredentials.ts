export function createRavelryAuthHeader() {
  const username = process.env.RAVELRY_READ_ONLY_USERNAME;
  const password = process.env.RAVELRY_READ_ONLY_PASSWORD;
  return { Authorization: `Basic ${btoa(`${username}:${password}`)}` };
}
