
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
  _id: number;
  _workers: Worker[];
  state?: any;
};

export type PropDefinition = {
  attribute: boolean;
};

export type PropDefinitions = Record<string, PropDefinition>;

export type RemoteEvent<D = any> = {
  type: string;
  detail?: D;
  cancelable?: boolean;
  composed?: boolean;
  scoped?: boolean;
};