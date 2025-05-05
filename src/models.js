export const INITIAL_TOOL_DEFS = [
  { label: "Move", isMotion: true, type: "move", defaultParams: { steps: 10 } },
  {
    label: "Turn",
    isMotion: true,
    type: "turn",
    defaultParams: { degrees: 30 },
  },
  {
    label: "Go To",
    isMotion: true,
    type: "goto",
    defaultParams: { x: 0, y: 0 },
  },
  {
    label: "Say",
    isMotion: false,
    type: "say",
    defaultParams: { for: "Hello", sec: 2 },
  },
  {
    label: "Think",
    isMotion: false,
    type: "think",
    defaultParams: { for: "Hmm...", sec: 2 },
  },
  {
    label: "Repeat",
    isMotion: true,
    type: "repeat",
    defaultParams: { times: 20 },
  },
];

export function createBlock(type, params) {
  return {
    id: `${type}-${Date.now()}`,
    type,
    params: { ...params },
  };
}
