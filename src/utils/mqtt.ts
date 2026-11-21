/**
 * MQTT Connection Utilities
 * Handles WebSocket-based MQTT connection for real-time sync
 */

export interface MqttConnection {
  connected: boolean;
  publish: (topic: string, messageStr: string) => boolean;
  close: () => void;
}

export interface MqttConnectionOptions {
  brokerUrl: string;
  clientId: string;
  topics: string[];
  onConnect?: () => void;
  onDisconnect?: () => void;
  onMessage?: (topic: string, payload: string) => void;
}

function encodeMqttLength(len: number): number[] {
  const out: number[] = [];
  do {
    let digit = len % 128;
    len = Math.floor(len / 128);
    if (len > 0) digit |= 0x80;
    out.push(digit);
  } while (len > 0);
  return out;
}

function encodeMqttString(str: string): number[] {
  const bytes = new TextEncoder().encode(str);
  return [(bytes.length >> 8) & 0xff, bytes.length & 0xff, ...bytes];
}

export function createNativeMqttConnection({
  brokerUrl,
  clientId,
  topics,
  onConnect,
  onDisconnect,
  onMessage,
}: MqttConnectionOptions): MqttConnection {
  let ws: WebSocket | null = null;
  let pingTimer: ReturnType<typeof setInterval> | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let isClosedIntentionally = false;
  let isConnected = false;
  let incomingBuffer = new Uint8Array(0);

  const sendRaw = (uint8: Uint8Array): boolean => {
    try {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(uint8);
        return true;
      }
    } catch {
      // ignored
    }
    return false;
  };

  const scheduleReconnect = () => {
    if (isClosedIntentionally) return;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(() => {
      connect();
    }, 3500);
  };

  const connect = () => {
    if (isClosedIntentionally || typeof WebSocket === 'undefined') return;
    try {
      ws = new WebSocket(brokerUrl, ['mqtt']);
      ws.binaryType = 'arraybuffer';
    } catch {
      scheduleReconnect();
      return;
    }

    ws.onopen = () => {
      if (isClosedIntentionally) return;
      incomingBuffer = new Uint8Array(0);
      const cidBytes = encodeMqttString(clientId);
      const varHeader = [0x00, 0x04, 0x4d, 0x51, 0x54, 0x54, 0x04, 0x02, 0x00, 0x3c];
      const body = [...varHeader, ...cidBytes];
      sendRaw(new Uint8Array([0x10, ...encodeMqttLength(body.length), ...body]));
    };

    ws.onmessage = (ev) => {
      if (isClosedIntentionally || !ev.data) return;
      try {
        const chunk = new Uint8Array(ev.data);
        const combined = new Uint8Array(incomingBuffer.length + chunk.length);
        combined.set(incomingBuffer, 0);
        combined.set(chunk, incomingBuffer.length);
        incomingBuffer = combined;

        let pos = 0;
        while (pos < incomingBuffer.length) {
          const packetStart = pos;
          const headerByte = incomingBuffer[pos++];
          const packetType = headerByte >> 4;

          let multiplier = 1;
          let remLen = 0;
          let encodedByte = 0;

          do {
            if (pos >= incomingBuffer.length) {
              incomingBuffer = incomingBuffer.subarray(packetStart);
              return;
            }
            encodedByte = incomingBuffer[pos++];
            remLen += (encodedByte & 127) * multiplier;
            multiplier *= 128;
            if (multiplier > 128 * 128 * 128) {
              incomingBuffer = new Uint8Array(0);
              return;
            }
          } while ((encodedByte & 128) !== 0);

          const packetEnd = pos + remLen;
          if (packetEnd > incomingBuffer.length) {
            incomingBuffer = incomingBuffer.subarray(packetStart);
            return;
          }

          if (packetType === 2) {
            // CONNACK
            isConnected = true;
            const subPayload: number[] = [];
            topics.forEach((t) => {
              subPayload.push(...encodeMqttString(t), 0x00);
            });
            const subBody = [0x00, 0x01, ...subPayload];
            sendRaw(new Uint8Array([0x82, ...encodeMqttLength(subBody.length), ...subBody]));

            if (pingTimer) clearInterval(pingTimer);
            pingTimer = setInterval(() => {
              sendRaw(new Uint8Array([0xc0, 0x00]));
            }, 20000);

            if (onConnect) onConnect();
          } else if (packetType === 3) {
            // PUBLISH
            const qos = (headerByte >> 1) & 0x03;
            const topicLen = (incomingBuffer[pos] << 8) | incomingBuffer[pos + 1];
            const topicStart = pos + 2;
            const msgTopic = new TextDecoder().decode(incomingBuffer.subarray(topicStart, topicStart + topicLen));
            let payloadPos = topicStart + topicLen;
            if (qos > 0) {
              const packetId = (incomingBuffer[payloadPos] << 8) | incomingBuffer[payloadPos + 1];
              payloadPos += 2;
              sendRaw(new Uint8Array([0x40, 0x02, (packetId >> 8) & 0xff, packetId & 0xff]));
            }
            const payloadStr = new TextDecoder().decode(incomingBuffer.subarray(payloadPos, packetEnd));
            if (onMessage) onMessage(msgTopic, payloadStr);
          }

          pos = packetEnd;
        }

        incomingBuffer = incomingBuffer.subarray(pos);
      } catch (err) {
        console.warn('MQTT parser notice:', err);
      }
    };

    const handleCloseOrError = () => {
      if (isConnected) {
        isConnected = false;
        if (onDisconnect) onDisconnect();
      }
      if (pingTimer) {
        clearInterval(pingTimer);
        pingTimer = null;
      }
      incomingBuffer = new Uint8Array(0);
      if (!isClosedIntentionally) {
        scheduleReconnect();
      }
    };

    ws.onclose = handleCloseOrError;
    ws.onerror = handleCloseOrError;
  };

  connect();

  return {
    get connected() {
      return isConnected && ws && ws.readyState === WebSocket.OPEN;
    },
    publish(topic: string, messageStr: string): boolean {
      if (!isConnected || !ws || ws.readyState !== WebSocket.OPEN) return false;
      try {
        const topicBytes = encodeMqttString(topic);
        const msgBytes = new TextEncoder().encode(messageStr);
        const bodyLen = topicBytes.length + msgBytes.length;
        const header = 0x30;
        const lenBytes = encodeMqttLength(bodyLen);
        const packet = new Uint8Array(1 + lenBytes.length + bodyLen);
        packet[0] = header;
        packet.set(lenBytes, 1);
        packet.set(topicBytes, 1 + lenBytes.length);
        packet.set(msgBytes, 1 + lenBytes.length + topicBytes.length);
        return sendRaw(packet);
      } catch {
        return false;
      }
    },
    close() {
      isClosedIntentionally = true;
      isConnected = false;
      if (pingTimer) clearInterval(pingTimer);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      incomingBuffer = new Uint8Array(0);
      try {
        if (ws) ws.close();
      } catch {
        // ignored
      }
    },
  };
}

export const MQTT_CHUNK_SIZE = 1200;

export function publishWithChunking(
  clients: MqttConnection[],
  topic: string,
  jsonString: string,
  senderId: string
): void {
  if (!jsonString) return;
  if (jsonString.length <= MQTT_CHUNK_SIZE) {
    clients.forEach((c) => {
      try {
        if (c && c.connected) c.publish(topic, jsonString);
      } catch {
        // ignored
      }
    });
    return;
  }

  const totalChunks = Math.ceil(jsonString.length / MQTT_CHUNK_SIZE);
  const msgId = `${senderId || 'dev'}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  for (let i = 0; i < totalChunks; i++) {
    const chunkData = jsonString.slice(i * MQTT_CHUNK_SIZE, (i + 1) * MQTT_CHUNK_SIZE);
    const envelope = JSON.stringify({
      _c: true,
      id: msgId,
      i,
      n: totalChunks,
      d: chunkData,
      s: senderId,
    });

    setTimeout(() => {
      clients.forEach((c) => {
        try {
          if (c && c.connected) c.publish(topic, envelope);
        } catch {
          // ignored
        }
      });
    }, i * 50);
  }
}

export function createChunkAssembler(onCompletePayload: (packet: any) => void) {
  const chunks = new Map<string, { total: number; received: string[]; timer: ReturnType<typeof setTimeout> | null }>();

  return {
    process(rawText: string) {
      try {
        const pkt = JSON.parse(rawText);
        if (!pkt._c || !pkt.id || typeof pkt.i !== 'number' || typeof pkt.n !== 'number' || !pkt.d) return;
        const { id, i, n, d } = pkt;
        let entry = chunks.get(id);
        if (!entry) {
          entry = { total: n, received: new Array(n), timer: null };
          chunks.set(id, entry);
        }
        entry.received[i] = d;
        if (entry.timer) clearTimeout(entry.timer);
        entry.timer = setTimeout(() => chunks.delete(id), 8000);
        if (entry.received.every((x) => x)) {
          if (entry.timer) clearTimeout(entry.timer);
          chunks.delete(id);
          onCompletePayload(JSON.parse(entry.received.join('')));
        }
      } catch {
        // ignored
      }
    },
  };
}