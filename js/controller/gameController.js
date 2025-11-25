// ゲーム全体の進行を管理するコントローラ。
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

export const STATE = {
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
    this.state = null;
    this.stateListeners = [];
    this.player = null;
    this.enemies = [];
    this.bullets = [];
    this.waveIndex = 0;
    this.time = 0;

    this.waves = [
      // まずは1体だけの遠距離スポーンで準備時間を確保
      { title: '偵察部隊', spawns: [{ x: 1040, y: 760 }] },
      // 2体に絞り、縦方向に間隔を取って同時交戦を避ける
      { title: '遊撃隊', spawns: [{ x: 1040, y: 200 }, { x: 240, y: 760 }] },
      // 最終波も2体に減らし、左右の端から段階的に迫らせる
      { title: '司令車両', spawns: [{ x: 980, y: 240 }, { x: 240, y: 760 }] },
    ];

    this.resetAll();
  }

  /**
   * 状態を変更し、リスナーへ通知する。
   */
  setState(nextState) {
    if (this.state === nextState) return;
    this.state = nextState;
    this.stateListeners.forEach((listener) => listener(this.state));
  }

  /**
   * 外部から状態変更を監視するための購読。
   * 追加時点の状態も即座に通知する。
   */
  onStateChange(listener) {
    this.stateListeners.push(listener);
    listener(this.state);
  }

  resetAll() {
    this.player = new Tank(160, 160, DIRECTION.RIGHT, true);
    this.waveIndex = 0;
    this.spawnWave();
    this.bullets = [];
    this.setState(STATE.TITLE);
    this.time = 0;
  }

  /**
   * UI ボタンからの開始要求。
   * タイトル中ならそのまま開始、リザルト中ならリセットして即座に開始する。
   */
  requestStart() {
    if (this.state === STATE.TITLE) {
      this.setState(STATE.PLAY);
    } else if (this.state === STATE.GAMEOVER || this.state === STATE.VICTORY) {
      this.resetAll();
      this.setState(STATE.PLAY);
    }
  }

  /**
   * UI ボタンからのリセット要求。
   * キー入力に頼らず、スマホでもワンタップでやり直せるようにする。
   */
  requestReset() {
    this.resetAll();
  }

  spawnWave() {
    const wave = this.waves[this.waveIndex];
    this.enemies = wave.spawns.map((pos) => new Tank(pos.x, pos.y, DIRECTION.LEFT, false));
  }

  update(deltaMs) {
    const deltaSeconds = deltaMs / 1000;
    this.time += deltaMs;

    // 入力は毎フレーム更新してパッドの状態を反映する
    this.input.update(deltaSeconds);

    if (this.input.isPressed('r')) {
      this.resetAll();
      return;
    }

    switch (this.state) {
      case STATE.TITLE:
        if (this.input.isPressed(' ')) {
          this.setState(STATE.PLAY);
        }
        break;
      case STATE.PLAY:
        this.updatePlayer(deltaSeconds);
        this.updateEnemies(deltaSeconds);
        this.updateBullets(deltaSeconds);
        this.checkEnd();
        break;
      case STATE.GAMEOVER:
      case STATE.VICTORY:
        // R でリスタート
        break;
      default:
        break;
    }
  }

  updatePlayer(deltaSeconds) {
    if (!this.player.alive) return;

    const desired = this.getPlayerDesiredMove();
    if (desired) {
      const diff = shortestAngleDelta(this.player.angle, desired.angle);
      const rotateAmount = Math.sign(diff) * Math.min(Math.abs(diff), config.player.rotateSpeed);
      this.player.rotate(rotateAmount);
      const dir = getDirectionVector(this.player.angle);
      const distance = config.player.speed * deltaSeconds * desired.magnitude;
      this.tryMove(this.player, dir.x * distance, dir.y * distance);
    }

    if (this.input.isPressed(' ')) {
      const now = this.time;
      if (now - this.player.lastShot >= config.player.fireCooldown && this.activeBulletCount('player') < config.player.maxBullets) {
        this.spawnBullet(this.player, 'player');
        this.player.lastShot = now;
      }
    }

    this.keepTankInsideLevel(this.player);
  }

  getPlayerDesiredMove() {
    const move = this.input.getMoveVector();
    if (move.magnitude === 0) return null;
    const angle = angleFromVector(move.x, move.y);
    return { ...move, angle };
  }

  updateEnemies(deltaSeconds) {
    this.enemies.forEach((enemy) => {
      if (!enemy.alive || !this.player.alive) return;

      const targetAngle = angleFromVector(this.player.x - enemy.x, this.player.y - enemy.y);
      const diff = shortestAngleDelta(enemy.angle, targetAngle);
      const rot = Math.sign(diff) * Math.min(Math.abs(diff), config.enemy.rotateSpeed);
      enemy.rotate(rot);

      // たまに前進させて位置をずらす
      if (Math.random() < 0.05) {
        const dir = getDirectionVector(enemy.angle);
        const distance = config.enemy.speed * deltaSeconds;
        this.tryMove(enemy, dir.x * distance, dir.y * distance);
      }

      const distSq = (enemy.x - this.player.x) ** 2 + (enemy.y - this.player.y) ** 2;
      if (distSq < config.enemy.fireDistance ** 2) {
        const now = this.time;
        if (now - enemy.lastShot >= config.enemy.fireCooldown) {
          // 少しばらけるようにランダムな角度を加算
          const jitter = (Math.random() - 0.5) * config.enemy.scatter;
          this.spawnBullet(enemy, 'enemy', enemy.angle + jitter);
          enemy.lastShot = now;
        }
      }

      this.keepTankInsideLevel(enemy);
    });
  }

  updateBullets(deltaSeconds) {
    this.bullets.forEach((b) => {
      if (!b.alive) return;
      b.update(deltaSeconds);
      this.handleBulletWallCollision(b);
      this.handleBulletTankCollision(b);
      if (
        b.x < -b.radius ||
        b.x > config.level.width + b.radius ||
        b.y < -b.radius ||
        b.y > config.level.height + b.radius
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
          bullet.x = dx > 0 ? wall.x + wall.width + bullet.radius : wall.x - bullet.radius;
          bullet.reflect('x');
        } else {
          bullet.y = dy > 0 ? wall.y + wall.height + bullet.radius : wall.y - bullet.radius;
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

  keepTankInsideLevel(tank) {
    const margin = tank.radius + 4;
    tank.x = clamp(tank.x, margin, config.level.width - margin);
    tank.y = clamp(tank.y, margin, config.level.height - margin);
  }

  spawnBullet(tank, owner, angleOverride) {
    const angle = angleOverride ?? tank.angle;
    const dir = getDirectionVector(angle);
    const spawnX = tank.x + dir.x * (tank.radius + 4);
    const spawnY = tank.y + dir.y * (tank.radius + 4);
    this.bullets.push(new Bullet(spawnX, spawnY, angle, owner));
  }

  activeBulletCount(owner) {
    return this.bullets.filter((b) => b.owner === owner).length;
  }

  checkEnd() {
    if (!this.player.alive) {
      this.setState(STATE.GAMEOVER);
      return;
    }
    const anyEnemyAlive = this.enemies.some((e) => e.alive);
    if (!anyEnemyAlive) {
      if (this.waveIndex >= this.waves.length - 1) {
        this.setState(STATE.VICTORY);
      } else {
        this.waveIndex += 1;
        this.spawnWave();
      }
    }
  }

  render() {
    this.renderer.clear();

    const cameraFocus = this.player?.alive ? this.player : { x: config.level.width / 2, y: config.level.height / 2 };
    this.renderer.beginCamera(cameraFocus);
    this.renderer.drawWalls(this.walls);
    this.enemies.forEach((e) => this.renderer.drawTank(e));
    this.renderer.drawTank(this.player);
    this.bullets.forEach((b) => this.renderer.drawBullet(b));
    this.renderer.endCamera();

    const cooldown = Math.max(0, config.player.fireCooldown - (this.time - this.player.lastShot)) / 1000;
    this.renderer.drawHud({
      wave: this.waveIndex + 1,
      remaining: this.enemies.filter((e) => e.alive).length,
      cooldown,
    });

    if (this.state === STATE.TITLE) {
      this.renderer.drawMessage([
        'ぷちタンク: WASD で移動 / Space で砲撃',
        '壁のバウンドを利用して敵を全滅させよう',
        'Space / 開始ボタン / 開始/砲弾ボタンでスタート',
      ]);
    } else if (this.state === STATE.GAMEOVER) {
      this.renderer.drawMessage(['被弾して撃破されました', 'R または再スタートボタンで再挑戦']);
    } else if (this.state === STATE.VICTORY) {
      this.renderer.drawMessage(['敵部隊を殲滅！', 'R または再スタートボタンで再スタート']);
    }
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function circleRectCollision(circle, rect) {
  const nearestX = clamp(circle.x, rect.x, rect.x + rect.width);
  const nearestY = clamp(circle.y, rect.y, rect.y + rect.height);
  const dx = circle.x - nearestX;
  const dy = circle.y - nearestY;
  return dx * dx + dy * dy < circle.r * circle.r;
}
