/**
 MIT License

 Copyright (c) 2017 Dillon Modine-Thuen

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.

 */

export class OsuBuffer {
  buffer: Buffer;
  position: number;

  /**
   * @param input
   */
  constructor(input?: Buffer) {
    this.buffer = Buffer.from(input instanceof Buffer ? input : []);
    this.position = 0;
  }

  /**
   * Returns the full length of the buffer
   * @returns {Number}
   */
  get length() {
    return this.buffer.length;
  }

  /**
   * Returns buffer to a binary string
   * @returns {String}
   */
  toString(type: "binary" | "ascii" = "binary") {
    return this.buffer.toString(type);
  }

  /**
   * Creates a new OsuBuffer from arguments
   * @returns {OsuBuffer}
   */
  static from(args: any) {
    if (args[0] instanceof OsuBuffer) {
      args[0] = args[0].buffer;
    }
    return new OsuBuffer(Buffer.from.apply(Buffer, args));
  }

  /**
   * Returns boolean if can read from defined length from buffer
   * @param {Number} length
   * @return {boolean}
   */
  canRead(length: number) {
    return length + this.position <= this.buffer.length;
  }

  /**
   * Returns boolean if at end of the buffer
   * @return {boolean}
   */
  isEOF() {
    return this.position >= this.buffer.length;
  }

  /**
   * Slices and returns buffer
   * @param {Number} length
   * @param {Boolean?} asOsuBuffer
   * @return {OsuBuffer|Buffer}
   */
  slice(length: number, asOsuBuffer = true) {
    this.position += length;
    return asOsuBuffer
      ? OsuBuffer.from(this.buffer.slice(this.position - length, this.position))
      : this.buffer.slice(this.position - length, this.position);
  }

  // Reading

  /**
   * Peeks the next byte in the buffer without shifting the position
   * @return {Number|undefined}
   */
  peek() {
    return this.buffer[this.position + 1];
  }

  /**
   * Reads a byte from the buffer
   * Does the same thing as ReadUInt8()
   * @return {Number}
   */
  readByte() {
    return this.readUInt8();
  }

  /**
   * Reads a signed integer from the Buffer
   * @param {Number} byteLength
   * @return {Number}
   */
  readInt(byteLength: number) {
    this.position += byteLength;
    return this.buffer.readIntLE(this.position - byteLength, byteLength);
  }

  /**
   * Reads a unsigned integer from the Buffer
   * @param {Number} byteLength
   * @return {Number}
   */
  readUInt(byteLength: number) {
    this.position += byteLength;
    return this.buffer.readUIntLE(this.position - byteLength, byteLength);
  }

  /**
   * Reads a 8-bit signed integer from the buffer
   * @return {Number}
   */
  readInt8() {
    return this.readInt(1);
  }

  /**
   * Reads a 8-bit unsigned integer from the buffer
   * @return {Number}
   */
  readUInt8() {
    return this.readUInt(1);
  }

  /**
   * Reads a 16-bit signed integer from the buffer
   * @return {Number}
   */
  readInt16() {
    return this.readInt(2);
  }

  /**
   * Reads a 16-bit unsigned integer from the buffer
   * @return {Number}
   */
  readUInt16() {
    return this.readUInt(2);
  }

  /**
   * Reads a 32-bit signed integer from the buffer
   * @return {Number}
   */
  readInt32() {
    return this.readInt(4);
  }

  /**
   * Reads a 32-bit unsigned integer from the buffer
   * @return {Number}
   */
  readUInt32() {
    return this.readUInt(4);
  }

  /**
   * Reads a 64-bit signed integer from the buffer
   * @return {Number}
   */
  readInt64(): BigInt {
    this.position += 8;
    return this.buffer.readBigInt64LE(this.position - 8);
  }

  /**
   * Reads a 64-bit unsigned integer from the buffer
   * @return {Number}
   */
  readUInt64() {
    this.position += 8;
    return this.buffer.readBigUInt64LE(this.position - 8);
  }

  /**
   * Reads a 32-bit Float from the buffer
   * @returns {Number}
   */
  readFloat() {
    this.position += 4;
    return this.buffer.readFloatLE(this.position - 4);
  }

  /**
   * Reads a 64-bit Double from the buffer
   * @returns {Number}
   */
  readDouble() {
    this.position += 8;
    return this.buffer.readDoubleLE(this.position - 8);
  }

  /**
   * Reads a string from the buffer
   * @param {Number} length
   * @returns {String}
   */
  readString(length: number) {
    return this.slice(length, false).toString();
  }

  /**
   * Decodes a 7-bit encoded integer from the buffer
   * @returns {Number}
   */
  readVarInt() {
    let total = 0;
    let shift = 0;
    let byte = this.readUInt8();
    if ((byte & 0x80) === 0) {
      total |= (byte & 0x7f) << shift;
    } else {
      let end = false;
      do {
        if (shift) {
          byte = this.readUInt8();
        }
        total |= (byte & 0x7f) << shift;
        if ((byte & 0x80) === 0) end = true;
        shift += 7;
      } while (!end);
    }

    return total;
  }

  /**
   * Decodes a 7-bit encoded integer from the buffer
   * @deprecated Use ReadVarint instead
   * @returns {Number}
   */
  readULeb128() {
    return this.readVarInt();
  }

  /**
   * Reads a byte from buffer and converts to boolean
   * @return {boolean}
   */
  readBoolean() {
    return Boolean(this.readInt(1));
  }

  /**
   * Reads an osu! encoded string from the Buffer
   * @returns {string}
   */
  readOsuString() {
    const isString = this.readByte() === 11;
    if (isString) {
      const len = this.readVarInt();
      return this.readString(len);
    } else {
      return "";
    }
  }

  // Writing

  /**
   * Concats a buffer to the current buffer
   * @param {Buffer} value
   * @return {OsuBuffer}
   */
  writeBuffer(value: Buffer): OsuBuffer {
    this.buffer = Buffer.concat([this.buffer, value]);
    return this;
  }

  /**
   * Writes an unsinged integer of any byte length
   * @param {Number} value
   * @param {Number} byteLength
   * @return {OsuBuffer}
   */
  writeUInt(value: number, byteLength: number): OsuBuffer {
    const buff = Buffer.alloc(byteLength);
    buff.writeUIntLE(value, 0, byteLength);

    return this.writeBuffer(buff);
  }

  /**
   * Writes an integer of any byte length
   * @param {Number} value
   * @param {Number} byteLength
   * @return {OsuBuffer}
   */
  writeInt(value: number, byteLength: number) {
    const buff = Buffer.alloc(byteLength);
    buff.writeIntLE(value, 0, byteLength);

    return this.writeBuffer(buff);
  }

  /**
   * Writes a 8-bit integer to the Buffer
   * @param {Number} value
   * @return {OsuBuffer}
   */
  writeByte(value: number) {
    return this.writeBuffer(Buffer.alloc(1, value));
  }

  /**
   *
   * @param {Array} value
   * @return {OsuBuffer}
   */
  writeBytes(value: Array<any>) {
    return this.writeBuffer(Buffer.from(value));
  }

  /**
   * Writes a 8-bit integer to the Buffer
   * @param {Number} value
   * @return {OsuBuffer}
   */
  writeUInt8(value: number) {
    return this.writeUInt(value, 1);
  }

  /**
   * Writes a 8-bit integer to the Buffer
   * @param {Number} value
   * @return {OsuBuffer}
   */
  writeInt8(value: number) {
    return this.writeInt(value, 1);
  }

  /**
   * Writes a 16-bit unsigned integer to the Buffer
   * @param {Number} value
   * @return {OsuBuffer}
   */
  writeUInt16(value: number) {
    return this.writeUInt(value, 2);
  }

  /**
   * Writes a 16-bit signed integer to the Buffer
   * @param {Number} value
   * @return {OsuBuffer}
   */
  writeInt16(value: number) {
    return this.writeInt(value, 2);
  }

  /**
   * Writes a 32-bit unsigned integer to the Buffer
   * @param {Number} value
   * @return {OsuBuffer}
   */
  writeUInt32(value: number) {
    return this.writeUInt(value, 4);
  }

  /**
   * Writes a 32-bit signed integer to the Buffer
   * @param {Number} value
   * @return {OsuBuffer}
   */
  writeInt32(value: number) {
    return this.writeInt(value, 4);
  }

  /**
   * Writes a 64-bit unsigned integer to the Buffer
   * @param {Number} value
   * @return {OsuBuffer}
   * // TODO: Not tested (there was a bug with read, so I would be careful about this)
   */
  writeUInt64(value: number) {
    const buff = Buffer.alloc(8);
    // High
    buff.writeUInt32LE(value >> 8, 0);
    // Low
    buff.writeUInt32LE(value & 0x00ff, 4);

    return this.writeBuffer(buff);
  }

  /**
   * Writes a 64-bit signed integer to the Buffer
   * @param {Number} value
   * @return {OsuBuffer}
   */
  writeInt64(value: number) {
    const buff = Buffer.alloc(8);
    // High
    buff.writeInt32LE(value >> 8, 0);
    // Low
    buff.writeInt32LE(value & 0x00ff, 4);

    return this.writeBuffer(buff);
  }

  /**
   * Writes a 32-bit float to the buffer
   * @param {Number} value
   * @return {OsuBuffer}
   */
  writeFloat(value: number) {
    const buff = Buffer.alloc(4);
    buff.writeFloatLE(value, 0);

    return this.writeBuffer(buff);
  }

  /**
   * Writes a 64-bit double to the buffer
   * @param {Number} value
   * @return {OsuBuffer}
   */
  writeDouble(value: number) {
    const buff = Buffer.alloc(8);
    buff.writeDoubleLE(value, 0);

    return this.writeBuffer(buff);
  }

  /**
   * Writes a string to the Buffer
   * @param {string} value
   * @return {OsuBuffer}
   */
  writeString(value: string) {
    const buff = Buffer.alloc(Buffer.byteLength(value, "utf8"));
    buff.write(value);

    return this.writeBuffer(buff);
  }

  /**
   * Writes a boolean to the buffer
   * @param {boolean} value
   * @return {OsuBuffer}
   */
  writeBoolean(value: number) {
    return this.writeByte(value ? 1 : 0);
  }

  /**
   * Writes an osu! encoded string to the Buffer
   * @param {string?} value
   * @param nullable
   * @return {OsuBuffer}
   */
  writeOsuString(value: string, nullable = false) {
    if (value.length === 0 && nullable) {
      this.writeByte(0);
    } else if (value.length === 0) {
      this.writeByte(11);
      this.writeByte(0);
    } else {
      this.writeByte(11);
      this.writeVarInt(Buffer.byteLength(value, "utf8"));
      this.writeString(value);
    }
    return this;
  }

  /**
   * Writes an unsigned 7-bit encoded integer to the Buffer
   * @param {Number} value
   * @return {OsuBuffer}
   */
  writeVarInt(value: number) {
    const arr = [];
    let len = 0;
    do {
      arr[len] = value & 0x7f;
      if ((value >>= 7) !== 0) arr[len] |= 0x80;
      len++;
    } while (value > 0);

    return this.writeBuffer(Buffer.from(arr));
  }

  /**
   * Writes an unsigned 7-bit encoded integer to the Buffer
   * @deprecated Use WriteUVarint instead
   * @param {Number} value
   * @return {OsuBuffer}
   */
  writeULeb128(value: number) {
    return this.writeVarInt(value);
  }
}
