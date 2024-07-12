// import 'server-only';

const chatRoomRoute = '/rooms';

export function newChat(toAppend="") {
  location.href = `${chatRoomRoute}/${crypto.randomUUID()}`+toAppend;
}