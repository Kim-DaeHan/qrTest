import http from "http";
import { WebSocketServer } from "ws";

export default class Socket {
  constructor() {
    this.server = http.createServer();
    this.wss = new WebSocketServer({ server: this.server });
  }
}
