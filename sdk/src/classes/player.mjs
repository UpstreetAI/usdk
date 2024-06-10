export class Player {
  playerId;
  playerSpec;
  constructor(playerId = '', playerSpec = null) {
    this.playerId = playerId;
    this.playerSpec = playerSpec;
  }
  setPlayerSpec(playerSpec) {
    this.playerSpec = playerSpec;
  }
}
