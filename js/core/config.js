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
    fireDistance: 360,
    fireCooldown: 1100,
    scatter: 0.14, // 照準に乗せるブレ
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
