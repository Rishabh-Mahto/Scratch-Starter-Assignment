import React from "react";
import { useAppState, useAppDispatch } from "../Context";
import { Draggable, Droppable } from "react-beautiful-dnd";

export default function MidArea() {
  const { sprites, selectedSpriteId } = useAppState();
  const dispatch = useAppDispatch();
  const current = sprites[selectedSpriteId];

  function handleParamChange(blockId, key, value, isText = false) {
    dispatch({
      type: "UPDATE_BLOCK_PARAMS",
      payload: {
        spriteId: selectedSpriteId,
        blockId,
        params: { [key]: isText ? value : Number(value) },
      },
    });
  }

  const getCustomLabel = (block, key) => {
    if (block.type !== "say" && block.type !== "think") return key;
    if (block.type === "say" || block.type === "think") {
      return key === "for" ? "" : key;
    }
  };

  return (
    <div className="flex flex-col flex-1 p-4 bg-gray-50">
      <div className="flex mb-4">
        {Object.values(sprites).map((s) => (
          <button
            key={s.id}
            onClick={() =>
              dispatch({ type: "SELECT_SPRITE", payload: { spriteId: s.id } })
            }
            className={`px-4 py-1 mr-2 border-2 border-solid rounded-lg ${
              s.id === selectedSpriteId
                ? "border-green-500 text-slate-600"
                : "border-gray-200"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      <Droppable droppableId="WORKSPACE">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex-1 overflow-auto"
          >
            {current.queue.map((block, index) => (
              <Draggable key={block.id} draggableId={block.id} index={index}>
                {(prov) => (
                  <div
                    ref={prov.innerRef}
                    {...prov.draggableProps}
                    {...prov.dragHandleProps}
                    className="p-2 mb-2 bg-white rounded flex items-center border-2 border-solid border-slate-800 justify-between"
                  >
                    <div className="flex items-center capitalize">
                      <span className="font-semibold capitalize mr-2">
                        {block.type}
                      </span>
                      {Object.entries(block.params).map(([k, v]) => (
                        <label key={k} className="mr-4">
                          <span className="mr-1">
                            {getCustomLabel(block, k)}
                          </span>
                          <input
                            type={typeof v === "string" ? "text" : "number"}
                            value={v}
                            onChange={(e) =>
                              handleParamChange(
                                block.id,
                                k,
                                e.target.value,
                                typeof v === "string"
                              )
                            }
                            className="w-16 p-1 border rounded"
                          />
                        </label>
                      ))}
                    </div>
                    <button
                      className="flex items-center justify-center w-5 h-5 border-2 border-solid border-red-500 rounded text-red-500"
                      onClick={() =>
                        dispatch({
                          type: "REMOVE_BLOCK",
                          payload: {
                            spriteId: selectedSpriteId,
                            blockId: block.id,
                          },
                        })
                      }
                    >
                      X
                    </button>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
