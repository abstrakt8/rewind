import { OsuBuffer } from "./OsuBuffer";

// .db and .osr files can be read with this
export class Reader {
  protected readonly buffer: OsuBuffer;

  constructor(buffer: Buffer) {
    this.buffer = new OsuBuffer(buffer);
  }

  readByte() {
    return this.buffer.readByte();
  }

  readShort() {
    return this.buffer.readUInt16();
  }

  readInt() {
    return this.buffer.readUInt32();
  }

  readLong() {
    return this.buffer.readUInt64();
  }

  readString() {
    return this.buffer.readOsuString();
  }

  readSingle() {
    return this.buffer.readFloat();
  }

  readDouble() {
    return this.buffer.readDouble();
  }

  readBoolean() {
    return this.buffer.readBoolean();
  }

  readDateTime() {
    return this.buffer.readUInt64();
  }
}
