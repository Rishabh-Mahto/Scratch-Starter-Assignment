import React from "react";
import { DragDropContext } from "react-beautiful-dnd";
import { AppProvider, useAppState, useAppDispatch } from "./Context";
import Sidebar from "./components/Sidebar";
import MidArea from "./components/MidArea";
import PreviewArea from "./components/PreviewArea";
import { createBlock } from "./models";

function AppContent() {
  const { sprites, tools, selectedSpriteId } = useAppState();
  const dispatch = useAppDispatch();
  const queue = sprites[selectedSpriteId].queue;

  function onDragEnd({ source, destination, draggableId }) {
    if (!destination) return;
    const spriteId = selectedSpriteId;
    const fromTool = source.droppableId === "TOOLBOX";
    const toWorkspace = destination.droppableId === "WORKSPACE";
    const type = draggableId.replace("tool-", "");
    if (fromTool && toWorkspace) {
      const tool = tools.find((t) => t.type === type);
      const block = createBlock(type, tool.defaultParams);
      dispatch({
        type: "INSERT_BLOCK",
        payload: { spriteId, block, index: destination.index },
      });
    } else if (
      source.droppableId === "WORKSPACE" &&
      destination.droppableId === "WORKSPACE"
    ) {
      const reordered = Array.from(queue);
      const [moved] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, moved);
      dispatch({
        type: "REORDER_BLOCKS",
        payload: { spriteId, newQueue: reordered },
      });
    }
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex w-full h-screen overflow-hidden bg-slate-200">
        <div className="flex w-1/2">
          <Sidebar />
          <MidArea />
        </div>
        <div className="w-1/2">
          <PreviewArea />
        </div>
      </div>
    </DragDropContext>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
