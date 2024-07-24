'use client';

const chatRoomRoute = '/rooms';

export default async function NewPage() {
  location.href = `${chatRoomRoute}/${crypto.randomUUID()}`;
}
