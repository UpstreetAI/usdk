import {
  fileServerUrl,
} from '../endpoints.js';

export const getFormData = o => {
  const formData = new FormData();
  for (const k in o) {
    formData.append(k, o[k]);
  }
  return formData;
};

export function downloadFile(file, filename) {
  // trigger download of the file using a fake dom node
  const a = document.createElement('a');
  a.href = URL.createObjectURL(file);
  a.download = filename;
  a.click();
}

let ids = 0;
export async function zineFile2Url(file) {
  const u = `${fileServerUrl}zine-${++ids}.zine`;
  const res = await fetch(u, {
    method: 'PUT',
    body: file,
  });
  // console.log('got res', u, res);
  const blob2 = await res.blob();
  // console.log('got result', u, blob2);

  return u;
}
export async function openZineFile(file) {
  // upload tmp file
  const u = await zineFile2Url(file);

  // compute open url
  const u2 = new URL(fileServerUrl);
  u2.searchParams.set('src', u);
  
  // open in new tab
  window.open(u2.href, '_blank');
}