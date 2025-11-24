// 弾丸モデル。所有者によって色を変え、壁でバウンドさせる。
import { config } from '../core/config.js';
import { getDirectionVector } from '../core/direction.js';

export class Bullet {
  constructor(x, y, angle, owner) {
    const dir = getDirectionVector(angle);
    this.x = x;
    this.y = y;
    this.vx = dir.x * config.bullet.speed;
    this.vy = dir.y * config.bullet.speed;
    this.size = config.bullet.size;
    this.radius = this.size / 2;
    this.owner = owner; // 'player' or 'enemy'
    this.bouncesLeft = config.bullet.bounceLimit;
    this.alive = true;
  }

  update(deltaSeconds) {
    this.x += this.vx * deltaSeconds;
    this.y += this.vy * deltaSeconds;
  }

  reflect(axis) {
    if (axis === 'x') {
      this.vx *= -1;
    } else if (axis === 'y') {
      this.vy *= -1;
    }
    this.bouncesLeft -= 1;
    if (this.bouncesLeft < 0) {
      this.alive = false;
    }
  }

  getCollider() {
    return { x: this.x, y: this.y, r: this.radius };
  }
}
