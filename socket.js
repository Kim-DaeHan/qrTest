import http from "http";
import { WebSocketServer } from "ws";
import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";

function decrypt(encryptedText, key) {
  const bytes = CryptoJS.AES.decrypt(encryptedText, key);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  return decrypted;
}

function encrypt(text, key) {
  const encrypted = CryptoJS.AES.encrypt(text, key).toString();
  return encrypted;
}

function createToken(address, sessionKey) {
  const payload = { sub: address };
  const token = jwt.sign(payload, sessionKey);
  return token;
}

const sessionKey = "103a4081d986d570e28e1bc35d53cc93";
const secretKey =
  "0ff85630d16c9ffd03ae8d8ab92fda302994e24e2801fb99431bdf13ce5160ab";

const message = "Welcome to DAPP!!";

// 소켓 서버 초기화 함수
function initializeSocketServer() {
  // HTTP 서버 생성
  const server = http.createServer();

  // WebSocket 서버 생성
  const wss = new WebSocketServer({ server });

  // 연결된 클라이언트들을 저장할 배열
  const clients = [];

  // 연결 이벤트 리스너
  wss.on("connection", (ws, req) => {
    console.log("Client connected");
    // 요청 헤더에서 세션 키 추출
    const clientSessionKey = req.headers["sec-websocket-protocol"];

    // 세션 키 검증
    if (clientSessionKey !== sessionKey) {
      console.log("Invalid session key");
      ws.close(); // 잘못된 세션 키인 경우 연결 종료
      return;
    }

    // 세션 키가 유효한 경우 클라이언트를 배열에 추가
    clients.push(ws);

    // 클라이언트로부터 메시지를 수신하는 이벤트 핸들러
    ws.on("message", (msg) => {
      const decryptMsg = decrypt(msg.toString(), secretKey);
      if (decryptMsg.length === 44) {
        const token = createToken(decryptMsg, sessionKey);
        console.log("token: ", token);
        const encryptToken = encrypt(token, secretKey);
        ws.send(encryptToken);
      } else if (decryptMsg === "sign") {
        console.log("sign 요청");
        ws.send(encrypt(message, secretKey));
      } else if (decryptMsg.length === 64) {
        console.log("Received message:", decryptMsg);
        const hash = CryptoJS.SHA256(message + "zigap").toString(
          CryptoJS.enc.Hex
        );
        console.log("hash: ", hash);
        if (decryptMsg === hash) {
          console.log("로그인 완료");
          ws.close();
        }
      }
    });

    // 연결 종료 이벤트 처리
    ws.on("close", () => {
      console.log("Client disconnected");
      // 배열에서 연결이 종료된 클라이언트 제거
      const index = clients.indexOf(ws);
      if (index !== -1) {
        clients.splice(index, 1);
      }
    });
  });

  // HTTP 서버 시작
  const PORT = 7070;
  server.listen(PORT, () => {
    console.log(`Socket server listening on port ${PORT}`);
  });
}

// 소켓 서버 초기화 함수 호출
initializeSocketServer();
