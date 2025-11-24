// ゲーム全体の制御
import { Tank } from '../model/tank.js';
import { Bullet } from '../model/bullet.js';
import { createLevel } from '../model/level.js';
import { Renderer } from '../view/renderer.js';
import { config } from '../core/config.js';
import {
  angleFromVector,
  DIRECTION,
  getDirectionVector,
  shortestAngleDelta,
} from '../core/direction.js';

const STATE = {
  TITLE: 'TITLE',
  PLAY: 'PLAY',
  GAMEOVER: 'GAMEOVER',
  VICTORY: 'VICTORY',
};

export class GameController {
  constructor(ctx, input) {
    this.ctx = ctx;
    this.input = input;
    this.renderer = new Renderer(ctx);
    this.walls = createLevel();
    this.state = STATE.TITLE;
    this.stateMessage = 'Press Space to Start';
    this.player = null;
    this.enemies = [];
    this.bullets = [];
    this.reset();
  }

  reset() {
    this.player = new Tank(120, 120, DIRECTION.UP, true);
    this.enemies = [
      new Tank(820, 520, DIRECTION.LEFT, false),
      new Tank(760, 140, DIRECTION.LEFT, false),
    ];
    this.bullets = [];
    this.state = STATE.TITLE;
    this.stateMessage = 'Space で開始 / R でリセット';
  }

  update(delta) {
    if (this.input.isPressed('r')) {
      this.reset();
      return;
    }

    switch (this.state) {
      case STATE.TITLE:
        if (this.input.keys.size > 0) {
          this.state = STATE.PLAY;
          this.stateMessage = '';
        }
        break;
      case STATE.PLAY:
        this.updatePlayer(delta);
        this.updateEnemies(delta);
        this.updateBullets();
        this.checkEnd();
        break;
      case STATE.GAMEOVER:
      case STATE.VICTORY:
        // 何もしない（R キーでリセット）
        break;
      default:
        break;
    }
  }

  updatePlayer(delta) {
    if (!this.player.alive) return;
    const moveSpeed = config.player.speed;

    const desired = this.getPlayerDesiredAngle();
    if (desired !== null) {
      this.player.angle = desired;
      const dir = getDirectionVector(this.player.angle);
      this.tryMove(this.player, dir.x * moveSpeed, dir.y * moveSpeed);
    }

    if (this.input.isPressed(' ')) {
      const now = performance.now();
      if (now - this.player.lastShot >= config.player.fireCooldown && this.activeBulletCount('player') < config.player.maxBullets) {
        this.spawnBullet(this.player, 'player');
        this.player.lastShot = now;
      }
    }
  }

  getPlayerDesiredAngle() {
    if (this.input.isPressed('w')) return DIRECTION.UP;
    if (this.input.isPressed('a')) return DIRECTION.LEFT;
    if (this.input.isPressed('s')) return DIRECTION.DOWN;
    if (this.input.isPressed('d')) return DIRECTION.RIGHT;
    return null;
  }

  updateEnemies(delta) {
    this.enemies.forEach((enemy) => {
      if (!enemy.alive) return;
      const targetAngle = angleFromVector(this.player.x - enemy.x, this.player.y - enemy.y);
      const diff = shortestAngleDelta(enemy.angle, targetAngle);
      const rot = Math.sign(diff) * Math.min(Math.abs(diff), config.enemy.rotateSpeed);
      enemy.rotate(rot);

      if (Math.random() < 0.02) {
        const dir = getDirectionVector(enemy.angle);
        this.tryMove(enemy, dir.x * config.enemy.speed, dir.y * config.enemy.speed);
      }

      const distSq = (enemy.x - this.player.x) ** 2 + (enemy.y - this.player.y) ** 2;
      if (distSq < config.enemy.fireDistance ** 2) {
        const now = performance.now();
        if (now - enemy.lastShot >= config.enemy.fireCooldown) {
          this.spawnBullet(enemy, 'enemy');
          enemy.lastShot = now;
        }
      }
    });
  }

  updateBullets() {
    this.bullets.forEach((b) => {
      if (!b.alive) return;
      b.update();
      this.handleBulletWallCollision(b);
      this.handleBulletTankCollision(b);
      if (
        b.x < -b.radius ||
        b.x > config.canvas.width + b.radius ||
        b.y < -b.radius ||
        b.y > config.canvas.height + b.radius
      ) {
        b.alive = false;
      }
    });
    this.bullets = this.bullets.filter((b) => b.alive);
  }

  handleBulletWallCollision(bullet) {
    this.walls.forEach((wall) => {
      if (!bullet.alive) return;
      const nearestX = clamp(bullet.x, wall.x, wall.x + wall.width);
      const nearestY = clamp(bullet.y, wall.y, wall.y + wall.height);
      const dx = bullet.x - nearestX;
      const dy = bullet.y - nearestY;
      const distSq = dx * dx + dy * dy;
      if (distSq < bullet.radius * bullet.radius) {
        const overlapX = bullet.radius - Math.abs(dx);
        const overlapY = bullet.radius - Math.abs(dy);
        if (overlapX < overlapY) {
          if (dx > 0) bullet.x = wall.x + wall.width + bullet.radius;
          else bullet.x = wall.x - bullet.radius;
          bullet.reflect('x');
        } else {
          if (dy > 0) bullet.y = wall.y + wall.height + bullet.radius;
          else bullet.y = wall.y - bullet.radius;
          bullet.reflect('y');
        }
      }
    });
  }

  handleBulletTankCollision(bullet) {
    const targets = bullet.owner === 'player' ? this.enemies : [this.player];
    targets.forEach((tank) => {
      if (!tank.alive || !bullet.alive) return;
      const dx = bullet.x - tank.x;
      const dy = bullet.y - tank.y;
      const distSq = dx * dx + dy * dy;
      const r = bullet.radius + tank.radius;
      if (distSq < r * r) {
        bullet.alive = false;
        tank.takeDamage();
      }
    });
  }

  tryMove(tank, dx, dy) {
    const nextX = tank.x + dx;
    const nextY = tank.y + dy;
    const collider = { x: nextX, y: nextY, r: tank.radius };
    const blocked = this.walls.some((wall) => circleRectCollision(collider, wall));
    if (!blocked) {
      tank.x = nextX;
      tank.y = nextY;
    }
  }

  spawnBullet(tank, owner) {
    const dir = getDirectionVector(tank.angle);
    const spawnX = tank.x + dir.x * (tank.radius + 2);
    const spawnY = tank.y + dir.y * (tank.radius + 2);
    this.bullets.push(new Bullet(spawnX, spawnY, tank.angle, owner));
  }

  activeBulletCount(owner) {
    return this.bullets.filter((b) => b.owner === owner).length;
  }

  checkEnd() {
    if (!this.player.alive) {
      this.state = STATE.GAMEOVER;
      this.stateMessage = 'Game Over - R で再挑戦';
      return;
    }
    const anyEnemyAlive = this.enemies.some((e) => e.alive);
    if (!anyEnemyAlive) {
      this.state = STATE.VICTORY;
      this.stateMessage = 'Victory! - R でリスタート';
    }
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
