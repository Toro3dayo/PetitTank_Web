// スマホ向けの簡易タッチ操作UI
export class TouchControls {
  constructor(input) {
    this.input = input;
    this.joystick = document.getElementById('touchPad');
    this.stick = document.getElementById('touchPadStick');
    this.fireButton = document.getElementById('fireButton');
    this.active = false;
    this.activePointerId = null;
    this.center = { x: 0, y: 0 };
    this.boundKeys = ['w', 'a', 's', 'd'];

    if (this.joystick) {
      this.joystick.addEventListener('pointerdown', (e) => this.onPointerDown(e));
      this.joystick.addEventListener('pointermove', (e) => this.onPointerMove(e));
      this.joystick.addEventListener('pointerup', (e) => this.onPointerUp(e));
      this.joystick.addEventListener('pointercancel', (e) => this.onPointerUp(e));
      this.joystick.addEventListener('pointerleave', (e) => this.onPointerUp(e));
    }

    if (this.fireButton) {
      this.fireButton.addEventListener('pointerdown', (e) => this.onFireDown(e));
      this.fireButton.addEventListener('pointerup', () => this.onFireUp());
      this.fireButton.addEventListener('pointercancel', () => this.onFireUp());
      this.fireButton.addEventListener('pointerleave', () => this.onFireUp());
    }
  }

  onPointerDown(event) {
    event.preventDefault();
    this.active = true;
    this.activePointerId = event.pointerId;
    this.joystick.setPointerCapture(event.pointerId);
    const rect = this.joystick.getBoundingClientRect();
    this.center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    this.handleDirection(event.clientX, event.clientY);
  }

  onPointerMove(event) {
    if (!this.active || event.pointerId !== this.activePointerId) return;
    event.preventDefault();
    this.handleDirection(event.clientX, event.clientY);
  }

  onPointerUp(event) {
    if (event && this.activePointerId !== event.pointerId) return;
    this.active = false;
    this.activePointerId = null;
    if (event) {
      this.joystick.releasePointerCapture(event.pointerId);
    }
    this.resetMovement();
    this.setStickPosition(0, 0);
  }

  onFireDown(event) {
    event.preventDefault();
    this.input.press(' ');
  }

  onFireUp() {
    this.input.release(' ');
  }

  handleDirection(clientX, clientY) {
    const dx = clientX - this.center.x;
    const dy = clientY - this.center.y;
    const threshold = 12;

    // 十字パッド風に軸ごとへ入力を限定することで、意図せぬ回転を防ぐ
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const radius = Math.min(40, Math.hypot(dx, dy));

    // 見た目のスティック位置も軸方向へスナップさせる
    if (absX > absY && absX > threshold) {
      const limitedX = Math.sign(dx) * radius;
      this.setStickPosition(limitedX, 0);
      this.input.release(this.boundKeys);
      this.input.press(dx > 0 ? 'd' : 'a');
    } else if (absY > threshold) {
      const limitedY = Math.sign(dy) * radius;
      this.setStickPosition(0, limitedY);
      this.input.release(this.boundKeys);
      this.input.press(dy > 0 ? 's' : 'w');
    } else {
      this.setStickPosition(0, 0);
      this.input.release(this.boundKeys);
    }
  }

  resetMovement() {
    this.input.release(this.boundKeys);
  }

  setStickPosition(x, y) {
    if (!this.stick) return;
    this.stick.style.transform = `translate(${x}px, ${y}px)`;
  }
}
