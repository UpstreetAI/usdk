export async function getUser(
  client: any,
  jwt?: string|null,
) {
  return jwt
    ? ( await client.auth.getUser(jwt))?.data?.user
    : ( await client.auth.getUser())?.data?.user
}
