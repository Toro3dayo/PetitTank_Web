// ステージ定義。シンプルな矩形の壁を並べて戦場を構築する。
import { Wall } from './wall.js';
import { config } from '../core/config.js';

export function createLevel() {
  const walls = [];
  const margin = 26;
  const { width, height } = config.level;

  // 外周の壁
  walls.push(new Wall(0, 0, width, margin));
  walls.push(new Wall(0, height - margin, width, margin));
  walls.push(new Wall(0, 0, margin, height));
  walls.push(new Wall(width - margin, 0, margin, height));

  // 中央に風穴を空けた迷路風の配置
  walls.push(new Wall(180, 140, 40, 300));
  walls.push(new Wall(180, 140, 360, 40));
  walls.push(new Wall(520, 140, 40, 240));
  walls.push(new Wall(320, 380, 40, 220));
  walls.push(new Wall(620, 80, 40, 220));
  walls.push(new Wall(620, 300, 240, 40));
  walls.push(new Wall(820, 140, 40, 260));
  walls.push(new Wall(740, 460, 40, 180));
  walls.push(new Wall(520, 480, 200, 40));
  walls.push(new Wall(180, 520, 280, 40));
  walls.push(new Wall(940, 360, 40, 260));
  walls.push(new Wall(860, 580, 180, 40));

  // 中央広場を囲む低い壁
  walls.push(new Wall(440, 260, 320, 40));
  walls.push(new Wall(440, 260, 40, 220));
  walls.push(new Wall(720, 260, 40, 220));
  walls.push(new Wall(440, 440, 320, 40));

  return walls;
}
