import { QueueManager } from 'queue-manager';

export const pingRate = 10000; // 10 seconds

/* the purpose of this class is to ping the database with liveness beacons */
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
        const ping = {
          user_id: this.userId,
          timestamp: new Date(),
        };
        // console.log('ping 1', ping);
        const result = await this.supabase.from('pings')
          .upsert(ping, {
            onConflict: ['user_id'],
          });
        // console.log('ping 2', result);
        const {
          error,
        } = result;
        if (!error) {
          // nothing
        } else {
          // console.warn('ping error', error);
        }
        // console.log('ping 3');
      });
    }, pingRate);
  }
  destroy() {
    clearInterval(this.interval);
  }
}