// 戦車モデル
import { config } from '../core/config.js';

export class Tank {
  constructor(x, y, angle, isPlayer = false) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.isPlayer = isPlayer;
    this.size = isPlayer ? config.player.size : config.enemy.size;
    this.radius = this.size / 2;
    this.hp = 1;
    this.alive = true;
    this.lastShot = 0;
  }

  rotate(delta) {
    this.angle += delta;
  }

  forward(speed) {
    this.x += Math.cos(this.angle) * speed;
    this.y += Math.sin(this.angle) * speed;
  }

  backward(speed) {
    this.x -= Math.cos(this.angle) * speed;
    this.y -= Math.sin(this.angle) * speed;
  }

  takeDamage() {
    this.hp -= 1;
    if (this.hp <= 0) {
      this.alive = false;
    }
  }

  getCollider() {
    return { x: this.x, y: this.y, r: this.radius };
  }
}
