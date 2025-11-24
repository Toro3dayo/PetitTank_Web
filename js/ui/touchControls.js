// スマホ向けの簡易タッチ操作UI
export class TouchControls {
  constructor(input) {
    this.input = input;
    this.joystick = document.getElementById('touchPad');
    this.stick = document.getElementById('touchPadStick');
    this.fireButton = document.getElementById('fireButton');
    this.active = false;
    this.center = { x: 0, y: 0 };
    this.boundKeys = ['w', 'a', 's', 'd'];

    if (this.joystick) {
      this.joystick.addEventListener('pointerdown', (e) => this.onPointerDown(e));
      this.joystick.addEventListener('pointermove', (e) => this.onPointerMove(e));
      this.joystick.addEventListener('pointerup', () => this.onPointerUp());
      this.joystick.addEventListener('pointercancel', () => this.onPointerUp());
      this.joystick.addEventListener('pointerleave', () => this.onPointerUp());
    }

    if (this.fireButton) {
      this.fireButton.addEventListener('pointerdown', (e) => this.onFireDown(e));
      this.fireButton.addEventListener('pointerup', () => this.onFireUp());
      this.fireButton.addEventListener('pointercancel', () => this.onFireUp());
      this.fireButton.addEventListener('pointerleave', () => this.onFireUp());
    }
  }

  onPointerDown(event) {
    this.active = true;
    const rect = this.joystick.getBoundingClientRect();
    this.center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    this.handleDirection(event.clientX, event.clientY);
  }

  onPointerMove(event) {
    if (!this.active) return;
    this.handleDirection(event.clientX, event.clientY);
  }

  onPointerUp() {
    this.active = false;
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
    const radius = Math.min(40, Math.hypot(dx, dy));
    const angle = Math.atan2(dy, dx);
    const limitedX = Math.cos(angle) * radius;
    const limitedY = Math.sin(angle) * radius;
    this.setStickPosition(limitedX, limitedY);

    this.input.release(this.boundKeys);
    if (dy < -threshold) this.input.press('w');
    if (dy > threshold) this.input.press('s');
    if (dx < -threshold) this.input.press('a');
    if (dx > threshold) this.input.press('d');
  }

  resetMovement() {
    this.input.release(this.boundKeys);
  }

  setStickPosition(x, y) {
    if (!this.stick) return;
    this.stick.style.transform = `translate(${x}px, ${y}px)`;
  }
}
