import React, { useRef, useEffect, useState } from "react";
import { useAppState, useAppDispatch } from "../Context";
import { usePlayback } from "../hooks/usePlayback";
import BulbaSprite from "../sprites/BulbaSprite";
import TotoSprite from "../sprites/TotoSprite";
import TorchSprite from "../sprites/TorchSprite";
import CatSprite from "../sprites/CatSprite";

const ALL_SPRITES = [
  { id: "sprite-1", name: "Bulbasaur", spriteImg: <BulbaSprite /> },
  { id: "sprite-2", name: "Totodile", spriteImg: <TotoSprite /> },
  { id: "sprite-3", name: "Torchic", spriteImg: <TorchSprite /> },
  { id: "sprite-4", name: "Cat", spriteImg: <CatSprite /> },
];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default function PreviewArea() {
  const { sprites, heroMode, collided } = useAppState();
  const dispatch = useAppDispatch();
  const { runAll } = usePlayback();

  useEffect(() => {
    if (collided) {
      runAll();
    }
  }, [collided]);

  const playAreaRef = useRef(null);
  const initializedRef = useRef(false);
  const dragState = useRef({
    dragging: false,
    spriteId: null,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
    lastX: 0,
    lastY: 0,
  });
  const [toAdd, setToAdd] = useState("");

  function initializePositions() {
    if (!playAreaRef.current) return;
    const rect = playAreaRef.current.getBoundingClientRect();
    const halfW = rect.width / 2;
    const halfH = rect.height / 2;
    Object.values(sprites).forEach((s) => {
      const randX = Math.floor(Math.random() * rect.width) - halfW;
      const randY = Math.floor(Math.random() * rect.height) - halfH;
      dispatch({
        type: "UPDATE_SPRITE",
        payload: { spriteId: s.id, x: randX, y: randY, angle: 0, bubble: null },
      });
      dispatch({
        type: "REORDER_BLOCKS",
        payload: { spriteId: s.id, newQueue: [] },
      });
    });
    initializedRef.current = true;
  }

  useEffect(() => {
    if (!initializedRef.current) {
      initializePositions();
    }
  }, [sprites]);

  useEffect(() => {
    if (!initializedRef.current && playAreaRef.current) {
      const rect = playAreaRef.current.getBoundingClientRect();
      const halfW = rect.width / 2;
      const halfH = rect.height / 2;
      Object.values(sprites).forEach((s) => {
        const randX = Math.floor(Math.random() * rect.width) - halfW;
        const randY = Math.floor(Math.random() * rect.height) - halfH;
        dispatch({
          type: "UPDATE_SPRITE",
          payload: { spriteId: s.id, x: randX, y: randY },
        });
      });
      initializedRef.current = true;
    }
  }, [sprites, dispatch]);

  useEffect(() => {
    function handleMouseMove(e) {
      if (!dragState.current.dragging) return;
      const dx = e.clientX - dragState.current.startX;
      const dy = e.clientY - dragState.current.startY;
      const newX = dragState.current.origX + dx;
      const newY = dragState.current.origY + dy;
      dragState.current.lastX = newX;
      dragState.current.lastY = newY;
      dispatch({
        type: "UPDATE_SPRITE",
        payload: { spriteId: dragState.current.spriteId, x: newX, y: newY },
      });
    }
    function handleMouseUp(e) {
      if (dragState.current.dragging && playAreaRef.current) {
        const rect = playAreaRef.current.getBoundingClientRect();
        const halfW = (rect.width - 50) / 2;
        const halfH = (rect.height - 50) / 2;
        const id = dragState.current.spriteId;
        const rawX = dragState.current.lastX;
        const rawY = dragState.current.lastY;
        const clampedX = clamp(rawX, -halfW, halfW);
        const clampedY = clamp(rawY, -halfH, halfH);
        dispatch({
          type: "UPDATE_SPRITE",
          payload: { spriteId: id, x: clampedX, y: clampedY },
        });
      }
      dragState.current.dragging = false;
    }
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dispatch]);

  function handlePointerDown(e, s) {
    e.preventDefault();
    dragState.current = {
      dragging: true,
      spriteId: s.id,
      startX: e.clientX,
      startY: e.clientY,
      origX: s.sprite.x,
      origY: s.sprite.y,
      lastX: s.sprite.x,
      lastY: s.sprite.y,
    };
  }

  function handleAddSprite(e) {
    const id = e.target.value;
    setToAdd(id);
    if (!id) return;
    const def = ALL_SPRITES.find((x) => x.id === id);
    dispatch({
      type: "ADD_SPRITE",
      payload: { spriteId: id, name: def.name, spriteImg: def.spriteImg },
    });
    setToAdd("");
  }

  return (
    <div className="flex-1 h-screen p-4 border-l">
      <div
        ref={playAreaRef}
        className="relative w-full h-2/3 border-2 border-gray-200 bg-white rounded overflow-hidden"
      >
        {Object.values(sprites).map((s) => {
          const { x, y, angle, bubble } = s.sprite;
          return (
            <div
              key={s.id}
              className="absolute top-1/2 left-1/2 cursor-move transition-transform duration-300 ease-out"
              style={{
                transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${angle}deg)`,
              }}
              onMouseDown={(e) => handlePointerDown(e, s)}
            >
              {s.spriteImg}
              {bubble && (
                <div className="absolute -top-6 bg-white p-1 rounded shadow">
                  {bubble}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-2 p-2 rounded border border-solid border-gray-200">
        <ul className="flex gap-4 items-center w-full justify-between">
          {Object.values(sprites).map((s) => (
            <li key={s.id}>
              {s.name}: {s.sprite.x.toFixed(0)},{s.sprite.y.toFixed(0)}
            </li>
          ))}
        </ul>
      </div>

      <div className="w-full flex justify-between items-center">
        <div className="w-full flex items-center gap-2 mt-4">
          <button
            onClick={runAll}
            className=" p-2 bg-green-500 text-white rounded"
          >
            Play All
          </button>
          <button
            onClick={initializePositions}
            className="p-2 bg-yellow-500 text-white rounded"
          >
            Reset All
          </button>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={heroMode}
              onChange={() => dispatch({ type: "TOGGLE_HERO" })}
              className="form-checkbox w-6 h-6"
            />
            <span className="ml-2">Hero Mode</span>
          </label>
        </div>
        <div className="mt-4">
          <select
            value={toAdd}
            onChange={handleAddSprite}
            className="p-2 border rounded"
          >
            <option value="">Add Sprite</option>
            {ALL_SPRITES.filter((x) => !sprites[x.id]).map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
