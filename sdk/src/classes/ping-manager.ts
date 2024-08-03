const pingRate = 10000; // 10 seconds

export class PingManager {
  // members
  userId: string;
  supabase: any;
  // state
  interval: any;

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

    this.live();
  }
  live() {
    this.interval = setInterval(async () => {
      await this.supabase.from('pings')
        .upsert({
          user_id: this.userId,
          timestamp: new Date(),
        }, {
          onConflict: ['user_id'],
        });
    }, pingRate);
  }
  destroy() {
    clearInterval(this.interval);
  }
}