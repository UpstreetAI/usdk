import { getJWT } from '@/lib/getJWT'
import { aiHost } from '@/utils/const/endpoints'


export async function getUserFromAIProxy(jwt?: string) {
  const _jwt = jwt || await getJWT()

  const res = await fetch(`${aiHost}/checkUser`, {
    headers: {
      Authorization: `Bearer ${_jwt}`,
    },
  });
  if (res.ok) {
    const j = await res.json();
    return j.data;
  } else {
    const text = await res.text();
    console.warn(text);
    return null;
  }
}
