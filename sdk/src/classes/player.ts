export class Player {
  playerId;
  playerSpec;
  constructor(playerId = '', playerSpec = null) {
    this.playerId = playerId;
    this.playerSpec = playerSpec;
  }
  getPlayerSpec() {
    return this.playerSpec;
  }
  setPlayerSpec(playerSpec) {
    this.playerSpec = playerSpec;
  }
}
