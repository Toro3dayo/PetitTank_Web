// リザルト画面用の再スタートポップアップ。
import { BasePopup } from './basePopup.js';

export class RestartPopup extends BasePopup {
  constructor(onRestart) {
    super({
      id: 'restartPopup',
      title: 'もう一度挑戦',
      descriptionLines: ['もう一度挑戦するにはボタンを押してください。'],
      actionLabel: '再スタート',
      onAction: onRestart,
    });
    this.setActionStyle({ alert: true });
  }

  showGameOver() {
    this.setTitle('被弾して撃破');
    this.setDescriptionLines(['敵弾を受けてしまいました。', '再スタートしてリベンジしましょう。']);
    this.show();
  }

  showVictory() {
    this.setTitle('敵部隊を殲滅！');
    this.setDescriptionLines(['見事な戦果です。', '別の立ち回りでもう一度挑戦できます。']);
    this.show();
  }
}
