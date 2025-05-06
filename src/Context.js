import React, { createContext, useContext, useReducer } from "react";
import { INITIAL_TOOL_DEFS } from "./models";
import BulbaSprite from "./sprites/BulbaSprite";

export function createSprite(id, name, spriteImg) {
  return {
    id,
    name,
    spriteImg,
    queue: [],
    sprite: { x: 0, y: 0, angle: 0, bubble: null },
  };
}

const initialSprites = {
  "sprite-1": createSprite("sprite-1", "Bulbasaur", <BulbaSprite />),
};

const initialState = {
  tools: INITIAL_TOOL_DEFS.map((t) => ({ ...t })),
  sprites: initialSprites,
  selectedSpriteId: "sprite-1",
  heroMode: false,
  collided: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "TOGGLE_HERO":
      return { ...state, heroMode: !state.heroMode, collided: false };

    case "SWAP_QUEUES": {
      const [a, b] = action.payload;
      const spriteA = state.sprites[a];
      const spriteB = state.sprites[b];

      return {
        ...state,
        sprites: {
          ...state.sprites,
          [a]: { ...spriteA, queue: [...spriteB.queue] },
          [b]: { ...spriteB, queue: [...spriteA.queue] },
        },
        collided: true,
      };
    }

    case "SELECT_SPRITE": {
      return { ...state, selectedSpriteId: action.payload.spriteId };
    }

    case "ADD_SPRITE": {
      const { spriteId, name, spriteImg } = action.payload;
      return {
        ...state,
        sprites: {
          ...state.sprites,
          [spriteId]: createSprite(spriteId, name, spriteImg),
        },
      };
    }

    case "UPDATE_TOOL_PARAM": {
      const { type, paramKey, value } = action.payload;
      return {
        ...state,
        tools: state.tools.map((t) =>
          t.type === type
            ? { ...t, defaultParams: { ...t.defaultParams, [paramKey]: value } }
            : t
        ),
      };
    }

    case "INSERT_BLOCK": {
      const { spriteId, block, index, parentId } = action.payload;
      const target = state.sprites[spriteId];
      let newQueue;
      if (parentId) {
        newQueue = target.queue.map((b) =>
          b.id === parentId ? { ...b, children: [...b.children, block] } : b
        );
      } else {
        newQueue = [...target.queue];
        newQueue.splice(index, 0, block);
      }
      return {
        ...state,
        sprites: {
          ...state.sprites,
          [spriteId]: { ...target, queue: newQueue },
        },
      };
    }

    case "REORDER_BLOCKS": {
      const { spriteId, newQueue } = action.payload;
      return {
        ...state,
        sprites: {
          ...state.sprites,
          [spriteId]: { ...state.sprites[spriteId], queue: newQueue },
        },
      };
    }

    case "REMOVE_BLOCK": {
      const { spriteId, blockId } = action.payload;
      return {
        ...state,
        sprites: {
          ...state.sprites,
          [spriteId]: {
            ...state.sprites[spriteId],
            queue: state.sprites[spriteId].queue.filter(
              (b) => b.id !== blockId
            ),
          },
        },
      };
    }

    case "UPDATE_BLOCK_PARAMS": {
      const { spriteId, blockId, params } = action.payload;
      const updated = state.sprites[spriteId].queue.map((b) =>
        b.id === blockId ? { ...b, params: { ...b.params, ...params } } : b
      );
      return {
        ...state,
        sprites: {
          ...state.sprites,
          [spriteId]: { ...state.sprites[spriteId], queue: updated },
        },
      };
    }

    case "UPDATE_SPRITE": {
      const { spriteId, ...rest } = action.payload;
      const target = state.sprites[spriteId];
      return {
        ...state,
        sprites: {
          ...state.sprites,
          [spriteId]: {
            ...target,
            sprite: { ...target.sprite, ...rest },
          },
        },
      };
    }

    case "RESET_COLLISION": {
      return { ...state, collided: false };
    }

    case "RESET_SPRITE": {
      const { spriteId } = action.payload;
      const target = state.sprites[spriteId];

      return {
        ...state,
        sprites: {
          ...state.sprites,
          [spriteId]: {
            ...target,
            sprite: { x: 0, y: 0, angle: 0, bubble: null },
          },
        },
      };
    }

    default:
      return state;
  }
}

export const AppStateContext = createContext();
export const AppDispatchContext = createContext();

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  return useContext(AppStateContext);
}
export function useAppDispatch() {
  return useContext(AppDispatchContext);
}
