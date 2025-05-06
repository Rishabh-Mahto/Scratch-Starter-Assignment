import { useEffect, useRef } from "react";
import { useAppState, useAppDispatch } from "../Context";

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function usePlayback() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const runKeyRef = useRef(null);

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  function checkCollision() {
    const { sprites, collided } = stateRef.current;
    const ids = Object.keys(sprites).slice(0, 2);
    const [a, b] = ids;
    const sa = sprites[a].sprite;
    const sb = sprites[b].sprite;
    const dx = sa.x - sb.x;
    const dy = sa.y - sb.y;
    const dist = Math.hypot(dx, dy);
    const threshold = 50;
    if (dist < threshold && !collided) {
      dispatch({ type: "SWAP_QUEUES", payload: [a, b] });
      stateRef.current.collided = true;
    } else if (dist >= threshold && collided) {
      dispatch({ type: "SET_COLLIDED", payload: false });
    }
  }

  async function runBlock(block, spriteId, runKey) {
    console.log(runKey, runKeyRef.current);
    if (runKeyRef.current !== runKey) return;
    const { sprites } = stateRef.current;
    const spriteObj = sprites[spriteId];
    const { x: curX, y: curY, angle: curAngle } = spriteObj.sprite;

    switch (block.type) {
      case "move": {
        const radians = (curAngle * Math.PI) / 180;
        const newX = curX + block.params.steps * Math.cos(radians);
        const newY = curY + block.params.steps * Math.sin(radians);

        dispatch({
          type: "UPDATE_SPRITE",
          payload: {
            spriteId,
            x: newX,
            y: newY,
          },
        });
        await wait(300);
        break;
      }
      case "turn": {
        dispatch({
          type: "UPDATE_SPRITE",
          payload: {
            spriteId,
            angle: curAngle + block.params.degrees,
          },
        });
        await wait(300);
        break;
      }
      case "goto": {
        dispatch({
          type: "UPDATE_SPRITE",
          payload: {
            spriteId,
            x: block.params.x,
            y: block.params.y,
          },
        });
        await wait(300);
        break;
      }
      case "say":
      case "think": {
        dispatch({
          type: "UPDATE_SPRITE",
          payload: { spriteId, bubble: block.params.for },
        });
        await wait(block.params.sec * 1000);
        dispatch({
          type: "UPDATE_SPRITE",
          payload: { spriteId, bubble: null },
        });
        break;
      }
      default:
        break;
    }
    await wait(200);
    console.log(stateRef.current.heroMode, stateRef.current.collided);
    if (runKeyRef.current !== runKey) return;
    if (stateRef.current.heroMode) {
      checkCollision();
    }
  }

  async function runRepeat(spriteId, count, runKey) {
    for (let i = 0; i < count; i++) {
      const queue = stateRef.current.sprites[spriteId].queue;
      const others = queue.filter((b) => b.type !== "repeat");
      for (const b of others) {
        await runBlock(b, spriteId, runKey);
      }
    }
  }
  async function runQueueFor(spriteId, runKey) {
    let i = 0;
    while (true) {
      const queue = stateRef.current.sprites[spriteId].queue;
      if (i >= queue.length) break;
      const block = queue[i];
      if (block.type === "repeat") {
        await runRepeat(spriteId, block.params.times || 1, runKey);
      } else {
        await runBlock(block, spriteId, runKey);
      }
      i++;
    }
  }

  function runAll() {
    const runKey = Symbol();
    runKeyRef.current = runKey;
    const ids = Object.keys(state.sprites);
    const runIds = state.heroMode ? ids.slice(0, 2) : ids;
    return Promise.all(runIds.map((id) => runQueueFor(id, runKey)));
  }

  return { runAll };
}
