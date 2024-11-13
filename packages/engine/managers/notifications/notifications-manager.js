import { v4 as uuidv4 } from 'uuid';

const NOTIFICATION_TYPE = {
  FRIEND_REQUEST: 'friend-request',
  MESSAGE_REQUEST: 'message-request',
  FRIEND_REQUEST_ACCEPT: 'friend-request-accept',
  ERROR_MESSAGE: 'error-message',
};

export class NotificationsManager extends EventTarget {
  #notifications = [];
  constructor({ chatManager, relationshipsManager }) {
    super();
    this.chatManager = chatManager;
    this.relationshipsManager = relationshipsManager;

    this.NOTIFICATION_TYPE = NOTIFICATION_TYPE;

    this.add = this.add.bind(this);
    this.clean = this.clean.bind(this);
    this.remove = this.remove.bind(this);
    this.onMessageRequest = this.onMessageRequest.bind(this);
    this.onRelationshipUpdate = this.onRelationshipUpdate.bind(this);
    this._registerListener = this._registerListener.bind(this);
    this.destroy = this.destroy.bind(this);

    this._registerListener();
  }

  get notifications() {
    return this.#notifications;
  }

  clean() {
    this.#notifications = [];
  }

  remove(index) {
    if (index >= 0 && index < this.#notifications.length) {
      this.#notifications.splice(index, 1);
    } else {
      console.error('removeNotification: index out of bounds');
    }
  }

  add(notification) {
    this.#notifications.push(notification);
    this.dispatchEvent(
      new MessageEvent('newNotification', {
        data: {
          notification,
        },
      }),
    );
  }

  error(errorMessage) {
    const notification = {
      id: uuidv4(),
      type: NOTIFICATION_TYPE.ERROR_MESSAGE,
      data: errorMessage,
    };
    this.#notifications.push(notification);
    this.dispatchEvent(
      new MessageEvent('newErrorMessage', {
        data: {
          notification,
        },
      }),
    );
  }

  onMessageRequest(event) {
    const { message } = event.data;
    const notification = {
      id: uuidv4(),
      type: NOTIFICATION_TYPE.MESSAGE_REQUEST,
      data: message,
    };
    this.add(notification);
  }

  onRelationshipUpdate(event) {
    const { relationship, reason } = event.data;
    if (reason === 'remote-add-friend') {
      const notification = {
        id: uuidv4(),
        type: NOTIFICATION_TYPE.FRIEND_REQUEST,
        data: relationship,
      };
      this.add(notification);
    } else if (reason === 'remote-accept-friend') {
      const notification = {
        id: uuidv4(),
        type: NOTIFICATION_TYPE.FRIEND_REQUEST_ACCEPT,
        data: relationship,
      };
      this.add(notification);
    }
  }

  _registerListener() {
    this.chatManager.addEventListener('message_request', this.onMessageRequest);

    this.relationshipsManager.addEventListener(
      'relationshipupdate',
      this.onRelationshipUpdate,
    );
  }

  destroy() {
    this.chatManager.removeEventListener(
      'message_request',
      this.onMessageRequest,
    );

    this.relationshipsManager.removeEventListener(
      'relationshipupdate',
      this.onRelationshipUpdate,
    );

    this.clean();
  }
}
