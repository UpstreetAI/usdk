// import 'server-only';

const chatRoomRoute = '/rooms';

export function newChat() {
  location.href = `${chatRoomRoute}/${crypto.randomUUID()}`;
}