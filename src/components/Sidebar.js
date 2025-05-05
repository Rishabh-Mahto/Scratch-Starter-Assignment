import React from "react";
import { useAppState, useAppDispatch } from "../Context";
import { Draggable, Droppable } from "react-beautiful-dnd";

export default function Sidebar() {
  const { tools } = useAppState();
  const dispatch = useAppDispatch();

  function handleChange(type, key, value) {
    dispatch({
      type: "UPDATE_TOOL_PARAM",
      payload: { type, paramKey: key, value },
    });
  }

  return (
    <Droppable droppableId="TOOLBOX" isDropDisabled>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className="w-64 p-4 border-r"
        >
          <p className="text-lg font-semibold my-2">Motion</p>
          {tools
            .filter((t) => t.isMotion)
            .map((tool, idx) => (
              <Draggable
                key={tool.type}
                draggableId={`tool-${tool.type}`}
                index={idx}
              >
                {(prov) => (
                  <div
                    ref={prov.innerRef}
                    {...prov.draggableProps}
                    {...prov.dragHandleProps}
                    className="mb-2 px-2 py-1 bg-blue-500 text-white rounded cursor-move text-sm"
                  >
                    <div className="flex items-center">
                      <span className="mr-2">{tool.label}</span>
                      {Object.entries(tool.defaultParams).map(([k, v]) => (
                        <React.Fragment key={k}>
                          <input
                            type={typeof v === "string" ? "text" : "number"}
                            value={v}
                            onChange={(e) =>
                              handleChange(
                                tool.type,
                                k,
                                typeof v === "string"
                                  ? e.target.value
                                  : Number(e.target.value)
                              )
                            }
                            className="w-12 p-1 text-black rounded mr-1"
                          />
                          <span className="mr-1">{k}</span>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
          <p className="text-lg font-semibold my-2">Looks</p>
          {tools
            .filter((t) => !t.isMotion)
            .map((tool, idx) => (
              <Draggable
                key={tool.type}
                draggableId={`tool-${tool.type}`}
                index={idx}
              >
                {(prov) => (
                  <div
                    ref={prov.innerRef}
                    {...prov.draggableProps}
                    {...prov.dragHandleProps}
                    className="mb-2 px-2 py-1 bg-purple-500 text-white rounded cursor-move text-sm"
                  >
                    <div className="flex items-center">
                      <span className="mr-2">{tool.label}</span>
                      {Object.entries(tool.defaultParams).map(([k, v]) => (
                        <React.Fragment key={k}>
                          <input
                            type={typeof v === "string" ? "text" : "number"}
                            value={v}
                            onChange={(e) =>
                              handleChange(
                                tool.type,
                                k,
                                typeof v === "string"
                                  ? e.target.value
                                  : Number(e.target.value)
                              )
                            }
                            className="w-12 p-1 text-black rounded mr-1"
                          />
                          <span className="mr-1">{k}</span>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}
