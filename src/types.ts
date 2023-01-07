
/*
const fritz = Object.create(null);
fritz.Component = Component;
fritz.define = define;
fritz.h = h;
fritz._tags = new Map();
fritz._instances = new Map();
fritz.fritz = fritz;
*/

export type Fritz = {
  _instances: Map<number, any>;
};

export type WindowFritz = Fritz & {
  _workers: Worker[];
  state?: any;
};