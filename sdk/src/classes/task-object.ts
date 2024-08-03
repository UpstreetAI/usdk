import {
  TaskResultEnum,
} from '../types';

export class TaskObject {
  id: any;
  timestamp: Date;
  constructor({
    id = null,
    timestamp = new Date(0),
  } = {}) {
    if (!(timestamp instanceof Date)) {
      throw new Error('Invalid timestamp; must be a Date: ' + timestamp);
    }
    this.id = id;
    this.timestamp = timestamp;
  }
}
export class TaskResult {
  type: TaskResultEnum;
  args: object;

  static SCHEDULE = TaskResultEnum.Schedule;
  static IDLE = TaskResultEnum.Idle;
  static DONE = TaskResultEnum.Done;

  constructor(type: TaskResultEnum, args: object = null) {
    switch (type) {
      case TaskResult.SCHEDULE: {
        const timestamp = (args as any)?.timestamp;
        if (!(timestamp instanceof Date)) {
          throw new Error('Invalid timestamp: ' + timestamp);
        }
        break;
      }
      case TaskResult.DONE: {
        break;
      }
      default: {
        throw new Error('Invalid task result type: ' + type);
      }
    }

    this.type = type;
    this.args = args;
  }
}