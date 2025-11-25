// 開始時の案内を行うポップアップ。
import { BasePopup } from './basePopup.js';

export class StartPopup extends BasePopup {
  constructor(onStart) {
    super({
      id: 'startPopup',
      title: '作戦開始',
      descriptionLines: [
        'WASD / 十字パッドで移動、Space / 砲弾ボタンで攻撃',
        '壁の反射を利用して敵を撃破しよう',
        'このボタンを押すとすぐに戦闘が始まります',
      ],
      actionLabel: 'ゲームスタート',
      onAction: onStart,
    });
  }
}
