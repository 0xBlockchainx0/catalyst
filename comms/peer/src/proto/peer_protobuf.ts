
import { Writer, Reader } from 'protobufjs/minimal';

export enum PacketType {
  UKNOWN_PACKET_TYPE = 0,
  MESSAGE = 1,
  PING = 2,
  PONG = 3,
}

export enum PayloadEncoding {
  BYTES = 0,
  STRING = 1,
  JSON = 2,
}

export interface MessageData {
  room: string;
  dst: Uint8Array[];
  payload: Uint8Array;
  encoding: PayloadEncoding;
}

export interface PingData {
  pingId: number;
}

export interface PongData {
  pingId: number;
}

export interface Packet {
  sequenceId: number;
  instanceId: number;
  timestamp: number;
  src: number;
  subtype: string;
  discardOlderThan: number;
  optimistic: boolean;
  expireTime: number;
  hops: number;
  ttl: number;
  receivedBy: number[];
  messageData: MessageData | undefined;
  pingData: PingData | undefined;
  pongData: PongData | undefined;
}

const baseMessageData: object = {
  room: "",
  dst: undefined,
  payload: undefined,
  encoding: 0,
};

const basePingData: object = {
  pingId: 0,
};

const basePongData: object = {
  pingId: 0,
};

const basePacket: object = {
  sequenceId: 0,
  instanceId: 0,
  timestamp: 0,
  src: 0,
  subtype: "",
  discardOlderThan: 0,
  optimistic: false,
  expireTime: 0,
  hops: 0,
  ttl: 0,
  receivedBy: 0,
};

export namespace PacketType {
  export function fromJSON(object: any): PacketType {
    switch (object) {
      case 0:
      case "UKNOWN_PACKET_TYPE":
        return PacketType.UKNOWN_PACKET_TYPE;
      case 1:
      case "MESSAGE":
        return PacketType.MESSAGE;
      case 2:
      case "PING":
        return PacketType.PING;
      case 3:
      case "PONG":
        return PacketType.PONG;
      default:
        throw new Error(`Invalid value ${object}`);
    }
  }
  export function toJSON(object: PacketType): string {
    switch (object) {
      case PacketType.UKNOWN_PACKET_TYPE:
        return "UKNOWN_PACKET_TYPE";
      case PacketType.MESSAGE:
        return "MESSAGE";
      case PacketType.PING:
        return "PING";
      case PacketType.PONG:
        return "PONG";
      default:
        return "UNKNOWN";
    }
  }
}

export namespace PayloadEncoding {
  export function fromJSON(object: any): PayloadEncoding {
    switch (object) {
      case 0:
      case "BYTES":
        return PayloadEncoding.BYTES;
      case 1:
      case "STRING":
        return PayloadEncoding.STRING;
      case 2:
      case "JSON":
        return PayloadEncoding.JSON;
      default:
        throw new Error(`Invalid value ${object}`);
    }
  }
  export function toJSON(object: PayloadEncoding): string {
    switch (object) {
      case PayloadEncoding.BYTES:
        return "BYTES";
      case PayloadEncoding.STRING:
        return "STRING";
      case PayloadEncoding.JSON:
        return "JSON";
      default:
        return "UNKNOWN";
    }
  }
}

export const MessageData = {
  encode(message: MessageData, writer: Writer = Writer.create()): Writer {
    writer.uint32(10).string(message.room);
    for (const v of message.dst) {
      writer.uint32(18).bytes(v!);
    }
    writer.uint32(26).bytes(message.payload);
    writer.uint32(32).int32(message.encoding);
    return writer;
  },
  decode(reader: Reader, length?: number): MessageData {
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = Object.create(baseMessageData) as MessageData;
    message.dst = [];
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.room = reader.string();
          break;
        case 2:
          message.dst.push(reader.bytes());
          break;
        case 3:
          message.payload = reader.bytes();
          break;
        case 4:
          message.encoding = reader.int32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): MessageData {
    const message = Object.create(baseMessageData) as MessageData;
    message.dst = [];
    if (object.room !== undefined && object.room !== null) {
      message.room = String(object.room);
    } else {
      message.room = "";
    }
    if (object.dst !== undefined && object.dst !== null) {
      for (const e of object.dst) {
        //@ts-ignore
        message.dst.push(e);
      }
    }
    if (object.payload !== undefined && object.payload !== null) {
      message.payload = object.payload;
    }
    if (object.encoding !== undefined && object.encoding !== null) {
      message.encoding = PayloadEncoding.fromJSON(object.encoding);
    } else {
      message.encoding = 0;
    }
    return message;
  },
  fromPartial(object: DeepPartial<MessageData>): MessageData {
    const message = Object.create(baseMessageData) as MessageData;
    message.dst = [];
    if (object.room !== undefined && object.room !== null) {
      message.room = object.room;
    } else {
      message.room = "";
    }
    if (object.dst !== undefined && object.dst !== null) {
      for (const e of object.dst) {
        //@ts-ignore
        message.dst.push(e);
      }
    }
    if (object.payload !== undefined && object.payload !== null) {
      message.payload = object.payload;
    }
    if (object.encoding !== undefined && object.encoding !== null) {
      message.encoding = object.encoding;
    } else {
      message.encoding = 0;
    }
    return message;
  },
  toJSON(message: MessageData): unknown {
    const obj: any = {};
    obj.room = message.room || "";
    if (message.dst) {
      obj.dst = message.dst.map(e => e || undefined);
    } else {
      obj.dst = [];
    }
    obj.payload = message.payload || undefined;
    obj.encoding = PayloadEncoding.toJSON(message.encoding);
    return obj;
  },
};

export const PingData = {
  encode(message: PingData, writer: Writer = Writer.create()): Writer {
    writer.uint32(8).uint32(message.pingId);
    return writer;
  },
  decode(reader: Reader, length?: number): PingData {
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = Object.create(basePingData) as PingData;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.pingId = reader.uint32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): PingData {
    const message = Object.create(basePingData) as PingData;
    if (object.pingId !== undefined && object.pingId !== null) {
      message.pingId = Number(object.pingId);
    } else {
      message.pingId = 0;
    }
    return message;
  },
  fromPartial(object: DeepPartial<PingData>): PingData {
    const message = Object.create(basePingData) as PingData;
    if (object.pingId !== undefined && object.pingId !== null) {
      message.pingId = object.pingId;
    } else {
      message.pingId = 0;
    }
    return message;
  },
  toJSON(message: PingData): unknown {
    const obj: any = {};
    obj.pingId = message.pingId || 0;
    return obj;
  },
};

export const PongData = {
  encode(message: PongData, writer: Writer = Writer.create()): Writer {
    writer.uint32(8).uint32(message.pingId);
    return writer;
  },
  decode(reader: Reader, length?: number): PongData {
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = Object.create(basePongData) as PongData;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.pingId = reader.uint32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): PongData {
    const message = Object.create(basePongData) as PongData;
    if (object.pingId !== undefined && object.pingId !== null) {
      message.pingId = Number(object.pingId);
    } else {
      message.pingId = 0;
    }
    return message;
  },
  fromPartial(object: DeepPartial<PongData>): PongData {
    const message = Object.create(basePongData) as PongData;
    if (object.pingId !== undefined && object.pingId !== null) {
      message.pingId = object.pingId;
    } else {
      message.pingId = 0;
    }
    return message;
  },
  toJSON(message: PongData): unknown {
    const obj: any = {};
    obj.pingId = message.pingId || 0;
    return obj;
  },
};

export const Packet = {
  encode(message: Packet, writer: Writer = Writer.create()): Writer {
    writer.uint32(8).uint32(message.sequenceId);
    writer.uint32(16).uint32(message.instanceId);
    writer.uint32(25).double(message.timestamp);
    writer.uint32(33).double(message.src);
    writer.uint32(42).string(message.subtype);
    writer.uint32(48).int32(message.discardOlderThan);
    writer.uint32(112).bool(message.optimistic);
    writer.uint32(56).int32(message.expireTime);
    writer.uint32(64).uint32(message.hops);
    writer.uint32(72).uint32(message.ttl);
    writer.uint32(82).fork();
    for (const v of message.receivedBy) {
      writer.double(v);
    }
    writer.ldelim();
    if (message.messageData !== undefined && message.messageData !== undefined) {
      MessageData.encode(message.messageData, writer.uint32(90).fork()).ldelim();
    }
    if (message.pingData !== undefined && message.pingData !== undefined) {
      PingData.encode(message.pingData, writer.uint32(98).fork()).ldelim();
    }
    if (message.pongData !== undefined && message.pongData !== undefined) {
      PongData.encode(message.pongData, writer.uint32(106).fork()).ldelim();
    }
    return writer;
  },
  decode(reader: Reader, length?: number): Packet {
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = Object.create(basePacket) as Packet;
    message.receivedBy = [];
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sequenceId = reader.uint32();
          break;
        case 2:
          message.instanceId = reader.uint32();
          break;
        case 3:
          message.timestamp = reader.double();
          break;
        case 4:
          message.src = reader.double();
          break;
        case 5:
          message.subtype = reader.string();
          break;
        case 6:
          message.discardOlderThan = reader.int32();
          break;
        case 14:
          message.optimistic = reader.bool();
          break;
        case 7:
          message.expireTime = reader.int32();
          break;
        case 8:
          message.hops = reader.uint32();
          break;
        case 9:
          message.ttl = reader.uint32();
          break;
        case 10:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.receivedBy.push(reader.double());
            }
          } else {
            message.receivedBy.push(reader.double());
          }
          break;
        case 11:
          message.messageData = MessageData.decode(reader, reader.uint32());
          break;
        case 12:
          message.pingData = PingData.decode(reader, reader.uint32());
          break;
        case 13:
          message.pongData = PongData.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromJSON(object: any): Packet {
    const message = Object.create(basePacket) as Packet;
    message.receivedBy = [];
    if (object.sequenceId !== undefined && object.sequenceId !== null) {
      message.sequenceId = Number(object.sequenceId);
    } else {
      message.sequenceId = 0;
    }
    if (object.instanceId !== undefined && object.instanceId !== null) {
      message.instanceId = Number(object.instanceId);
    } else {
      message.instanceId = 0;
    }
    if (object.timestamp !== undefined && object.timestamp !== null) {
      message.timestamp = Number(object.timestamp);
    } else {
      message.timestamp = 0;
    }
    if (object.src !== undefined && object.src !== null) {
      message.src = Number(object.src);
    } else {
      message.src = 0;
    }
    if (object.subtype !== undefined && object.subtype !== null) {
      message.subtype = String(object.subtype);
    } else {
      message.subtype = "";
    }
    if (object.discardOlderThan !== undefined && object.discardOlderThan !== null) {
      message.discardOlderThan = Number(object.discardOlderThan);
    } else {
      message.discardOlderThan = 0;
    }
    if (object.optimistic !== undefined && object.optimistic !== null) {
      message.optimistic = Boolean(object.optimistic);
    } else {
      message.optimistic = false;
    }
    if (object.expireTime !== undefined && object.expireTime !== null) {
      message.expireTime = Number(object.expireTime);
    } else {
      message.expireTime = 0;
    }
    if (object.hops !== undefined && object.hops !== null) {
      message.hops = Number(object.hops);
    } else {
      message.hops = 0;
    }
    if (object.ttl !== undefined && object.ttl !== null) {
      message.ttl = Number(object.ttl);
    } else {
      message.ttl = 0;
    }
    if (object.receivedBy !== undefined && object.receivedBy !== null) {
      for (const e of object.receivedBy) {
        message.receivedBy.push(Number(e));
      }
    }
    if (object.messageData !== undefined && object.messageData !== null) {
      message.messageData = MessageData.fromJSON(object.messageData);
    } else {
      message.messageData = undefined;
    }
    if (object.pingData !== undefined && object.pingData !== null) {
      message.pingData = PingData.fromJSON(object.pingData);
    } else {
      message.pingData = undefined;
    }
    if (object.pongData !== undefined && object.pongData !== null) {
      message.pongData = PongData.fromJSON(object.pongData);
    } else {
      message.pongData = undefined;
    }
    return message;
  },
  fromPartial(object: DeepPartial<Packet>): Packet {
    const message = Object.create(basePacket) as Packet;
    message.receivedBy = [];
    if (object.sequenceId !== undefined && object.sequenceId !== null) {
      message.sequenceId = object.sequenceId;
    } else {
      message.sequenceId = 0;
    }
    if (object.instanceId !== undefined && object.instanceId !== null) {
      message.instanceId = object.instanceId;
    } else {
      message.instanceId = 0;
    }
    if (object.timestamp !== undefined && object.timestamp !== null) {
      message.timestamp = object.timestamp;
    } else {
      message.timestamp = 0;
    }
    if (object.src !== undefined && object.src !== null) {
      message.src = object.src;
    } else {
      message.src = 0;
    }
    if (object.subtype !== undefined && object.subtype !== null) {
      message.subtype = object.subtype;
    } else {
      message.subtype = "";
    }
    if (object.discardOlderThan !== undefined && object.discardOlderThan !== null) {
      message.discardOlderThan = object.discardOlderThan;
    } else {
      message.discardOlderThan = 0;
    }
    if (object.optimistic !== undefined && object.optimistic !== null) {
      message.optimistic = object.optimistic;
    } else {
      message.optimistic = false;
    }
    if (object.expireTime !== undefined && object.expireTime !== null) {
      message.expireTime = object.expireTime;
    } else {
      message.expireTime = 0;
    }
    if (object.hops !== undefined && object.hops !== null) {
      message.hops = object.hops;
    } else {
      message.hops = 0;
    }
    if (object.ttl !== undefined && object.ttl !== null) {
      message.ttl = object.ttl;
    } else {
      message.ttl = 0;
    }
    if (object.receivedBy !== undefined && object.receivedBy !== null) {
      for (const e of object.receivedBy) {
        message.receivedBy.push(e);
      }
    }
    if (object.messageData !== undefined && object.messageData !== null) {
      message.messageData = MessageData.fromPartial(object.messageData);
    } else {
      message.messageData = undefined;
    }
    if (object.pingData !== undefined && object.pingData !== null) {
      message.pingData = PingData.fromPartial(object.pingData);
    } else {
      message.pingData = undefined;
    }
    if (object.pongData !== undefined && object.pongData !== null) {
      message.pongData = PongData.fromPartial(object.pongData);
    } else {
      message.pongData = undefined;
    }
    return message;
  },
  toJSON(message: Packet): unknown {
    const obj: any = {};
    obj.sequenceId = message.sequenceId || 0;
    obj.instanceId = message.instanceId || 0;
    obj.timestamp = message.timestamp || 0;
    obj.src = message.src || 0;
    obj.subtype = message.subtype || "";
    obj.discardOlderThan = message.discardOlderThan || 0;
    obj.optimistic = message.optimistic || false;
    obj.expireTime = message.expireTime || 0;
    obj.hops = message.hops || 0;
    obj.ttl = message.ttl || 0;
    if (message.receivedBy) {
      obj.receivedBy = message.receivedBy.map(e => e || 0);
    } else {
      obj.receivedBy = [];
    }
    obj.messageData = message.messageData ? MessageData.toJSON(message.messageData) : undefined;
    obj.pingData = message.pingData ? PingData.toJSON(message.pingData) : undefined;
    obj.pongData = message.pongData ? PongData.toJSON(message.pongData) : undefined;
    return obj;
  },
};

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T[P] extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T[P] extends Date | Function | Uint8Array | undefined
  ? T[P]
  : T[P] extends infer U | undefined
  ? DeepPartial<U>
  : T[P] extends object
  ? DeepPartial<T[P]>
  : T[P]
};