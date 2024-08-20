import { QueueManager } from '../util/queue-manager.mjs';

const pingRate = 10000; // 10 seconds

export class PingManager {
  // members
  userId: string;
  supabase: any;
  // state
  interval: any;
  queueManager: QueueManager;

  constructor({
    userId,
    supabase,
  }: {
    userId: string,
    supabase: any,
  }) {
    this.userId = userId;
    this.supabase = supabase;

    this.interval = null;
    this.queueManager = new QueueManager();

    this.live();
  }
  live() {
    this.interval = setInterval(async () => {
      await this.queueManager.waitForTurn(async () => {
        // console.log('ping 1');
        const result = await this.supabase.from('pings')
          .upsert({
            user_id: this.userId,
            timestamp: new Date(),
          }, {
            onConflict: ['user_id'],
          });
        const {
          error,
        } = result;
        if (!error) {
          // nothing
        } else {
          console.warn('ping error', error);
        }
        // console.log('ping 2');
      });
    }, pingRate);
  }
  destroy() {
    clearInterval(this.interval);
  }
}