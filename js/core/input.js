// キーボード入力管理
export class Input {
  constructor() {
    this.keys = new Set();
    this._onKeyDown = (e) => this.handleKeyDown(e);
    this._onKeyUp = (e) => this.handleKeyUp(e);
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
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
}
