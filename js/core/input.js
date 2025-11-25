// キーボード入力管理
export class Input {
  constructor() {
    this.keys = new Set();
    this.gamepadVector = { x: 0, y: 0 };
    this._onKeyDown = (e) => this.handleKeyDown(e);
    this._onKeyUp = (e) => this.handleKeyUp(e);
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
  }

  /**
   * 毎フレームの更新。主にゲームパッド入力のポーリングを行う。
   * @param {number} deltaSeconds 経過時間（秒）
   */
  update(deltaSeconds) {
    this.updateGamepad(deltaSeconds);
  }

  handleKeyDown(event) {
    this.keys.add(event.key.toLowerCase());
  }

  handleKeyUp(event) {
    this.keys.delete(event.key.toLowerCase());
  }

  isPressed(key) {
    return this.keys.has(key.toLowerCase());
  }

  // 仮想パッドなどからキー状態を直接操作するためのヘルパー
  press(keys) {
    const list = Array.isArray(keys) ? keys : [keys];
    list.forEach((k) => this.keys.add(k.toLowerCase()));
  }

  release(keys) {
    const list = Array.isArray(keys) ? keys : [keys];
    list.forEach((k) => this.keys.delete(k.toLowerCase()));
  }

  /**
   * 入力ベクトルを返す。ゲームパッドが優先され、無ければキーボード入力を利用する。
   */
  getMoveVector() {
    const gamepadMagnitude = Math.hypot(this.gamepadVector.x, this.gamepadVector.y);
    if (gamepadMagnitude > 0.01) {
      return { ...this.gamepadVector, magnitude: Math.min(1, gamepadMagnitude) };
    }

    const dx = (this.isPressed('d') ? 1 : 0) - (this.isPressed('a') ? 1 : 0);
    const dy = (this.isPressed('s') ? 1 : 0) - (this.isPressed('w') ? 1 : 0);
    const mag = Math.hypot(dx, dy);
    if (mag === 0) return { x: 0, y: 0, magnitude: 0 };
    return { x: dx / mag, y: dy / mag, magnitude: 1 };
  }

  /**
   * ゲームパッドの左右スティック（左優先）から入力を取得し、なめらかに補間する。
   */
  updateGamepad(deltaSeconds) {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const pad = pads.find((p) => p && p.connected);
    if (!pad) {
      // 入力が途切れた場合は徐々にゼロへ戻す
      this.gamepadVector.x *= 1 - Math.min(1, deltaSeconds * 12);
      this.gamepadVector.y *= 1 - Math.min(1, deltaSeconds * 12);
      return;
    }

    // 左スティック。右が有効なら右をフォールバックとして使う。
    const rawX = pad.axes[0] ?? pad.axes[2] ?? 0;
    const rawY = pad.axes[1] ?? pad.axes[3] ?? 0;
    const deadzone = 0.18;
    const filteredX = Math.abs(rawX) < deadzone ? 0 : rawX;
    const filteredY = Math.abs(rawY) < deadzone ? 0 : rawY;
    const length = Math.hypot(filteredX, filteredY);
    const clampedLength = Math.min(1, length);
    const target = length > 0 ? { x: (filteredX / length) * clampedLength, y: (filteredY / length) * clampedLength } : { x: 0, y: 0 };

    // スティック移動を滑らかにするため、線形補間で追従速度を調整
    const follow = Math.min(1, deltaSeconds * 12);
    this.gamepadVector.x += (target.x - this.gamepadVector.x) * follow;
    this.gamepadVector.y += (target.y - this.gamepadVector.y) * follow;
  }
}
