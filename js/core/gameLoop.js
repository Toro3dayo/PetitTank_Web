// シンプルなゲームループ管理
export function startGameLoop(update, render) {
  let lastTime = performance.now();

  function loop(now) {
    const delta = now - lastTime;
    lastTime = now;

    update(delta);
    render();
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}
