/* const vqaQueries = [
  `is this birds eye view?`,
  `is the viewer looking up at the sky?`,
  `is the viewer looking up at the ceiling?`,
  `how many feet tall is the viewer?`,
]; */

//

const blipBaseUrl = `https://blip.webaverse.com/`;

//

export class VQAClient {
  async getPredictedHeight(blob) {
    const fd = new FormData();
    fd.append('question', 'in feet, how high up is this?');
    fd.append('file', blob);
    fd.append('task', 'vqa');
    const res = await fetch(`${blipBaseUrl}upload`, {
      method: 'post',
      body: fd,
    });
    const j = await res.json();
    const {Answer} = j;
    const f = parseFloat(Answer);
    if (!isNaN(f)) {
      return f;
    } else {
      return null;
    }
  }
  async getImageCaption(blob) {
    const fd = new FormData();
    fd.append('file', blob);
    fd.append('task', 'image_captioning');
    const res = await fetch(`${blipBaseUrl}upload`, {
      method: 'post',
      body: fd,
    });
    const j = await res.json();
    const {Caption} = j;
    return Caption;
  }
}