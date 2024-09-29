export class Player {
  playerId: string;
  playerSpec: object;
  constructor(playerId: string, playerSpec: object) {
    this.playerId = playerId;
    this.playerSpec = playerSpec;
  }
  getPlayerSpec() {
    return this.playerSpec;
  }
  setPlayerSpec(playerSpec: object) {
    this.playerSpec = playerSpec;
  }
}
