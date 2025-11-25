// ゲーム全体で共有する定数定義
export const config = {
  canvas: {
    width: 960,
    height: 640,
  },
  camera: {
    zoom: 1.1,
  },
  player: {
    speed: 220, // 1 秒あたりの移動ピクセル
    rotateSpeed: 0.08,
    size: 46,
    maxBullets: 3,
    fireCooldown: 420,
  },
  enemy: {
    speed: 160,
    rotateSpeed: 0.06,
    size: 44,
    fireDistance: 320, // 射程 (px): 近距離のみ撃つので安全に間合いを取れる
    fireCooldown: 1500, // 発射間隔 (ms): 弾幕が疎になり回避に余裕がある
    scatter: 0.26, // 照準ブレ: 弾が大きく散るため被弾しにくい
  },
  bullet: {
    speed: 520,
    size: 10,
    bounceLimit: 1,
  },
  level: {
    width: 1200,
    height: 880,
  },
};
