// ゲーム進行に合わせてポップアップを切り替えるプレゼンター。
import { STATE } from '../controller/gameController.js';
import { StartPopup } from './popup/startPopup.js';
import { RestartPopup } from './popup/restartPopup.js';

export class GamePopupPresenter {
  constructor(controller) {
    this.controller = controller;
    this.startPopup = new StartPopup(() => this.controller.requestStart());
    this.restartPopup = new RestartPopup(() => this.controller.requestReset());

    this.controller.onStateChange((state) => this.handleStateChange(state));
  }

  handleStateChange(state) {
    if (state === STATE.TITLE) {
      this.restartPopup.hide();
      this.startPopup.show();
    } else if (state === STATE.PLAY) {
      this.startPopup.hide();
      this.restartPopup.hide();
    } else if (state === STATE.GAMEOVER) {
      this.startPopup.hide();
      this.restartPopup.showGameOver();
    } else if (state === STATE.VICTORY) {
      this.startPopup.hide();
      this.restartPopup.showVictory();
    }
  }
}
