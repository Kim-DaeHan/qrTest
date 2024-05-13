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
async function initializeSocketServer() {
  // return new Promise는 언제 resolve를 할지 정할 수 있고 async를 사용하면 함수 끝까지 실행이되고 resolve를 한다
  // async는 await를 사용하기 위함이 가장 크고 resolve를 handler를 하기 위해선 return new Promise를 명시적으로
  return new Promise((resolve, reject) => {
    // HTTP 서버 생성
    const server = http.createServer();

    // WebSocket 서버 생성
    const wss = new WebSocketServer({ server });

    // 연결된 클라이언트들을 저장할 배열
    const clients = [];

    let token;

    // 연결 이벤트 리스너
    // 애초에 Promise를 반환하는 콜백함수가 아니기 때문에
    wss.on("connection", (ws, req) => {
      console.log("Client connected");
      // 요청 헤더에서 세션 키 추출
      const clientSessionKey = req.headers["sec-websocket-protocol"];

      // 세션 키 검증
      if (clientSessionKey !== sessionKey) {
        // console.log("Invalid session key");
        ws.close(); // 잘못된 세션 키인 경우 연결 종료
        server.close(() => {
          console.log("Socket server closed");
          // Promise 완료
          reject("Invalid session key");
          // throw new Error("Invalid session key");
        });
      }

      // 세션 키가 유효한 경우 클라이언트를 배열에 추가
      clients.push(ws);

      // 클라이언트로부터 메시지를 수신하는 이벤트 핸들러
      ws.on("message", (msg) => {
        const decryptMsg = decrypt(msg.toString(), secretKey);
        if (decryptMsg.length === 44) {
          token = createToken(decryptMsg, sessionKey);
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
            // 소켓 서버 종료
            server.close(() => {
              console.log("Socket server closed111");
              // Promise 완료
              resolve(token);
              // return token;
            });
          }
        }
      });

      // 연결 종료 이벤트 처리
      ws.on("close", () => {
        // console.log("Client disconnected");
        // 배열에서 연결이 종료된 클라이언트 제거
        const index = clients.indexOf(ws);
        if (index !== -1) {
          clients.splice(index, 1);
        }
        server.close(() => {
          console.log("Socket server closed222");
          reject("Client disconnected22");
          // throw new Error("Invalid session key");
        });
      });
    });

    // HTTP 서버 시작
    const PORT = 7070;
    server.listen(PORT, (error) => {
      if (error) {
        reject("Server Error");
      }
      console.log(`Socket server listening on port ${PORT}`);
    });
  });
}

async function main() {
  // 소켓 서버 초기화 함수 호출
  try {
    const token = await initializeSocketServer();

    // const token = "aaa";
    // 5초를 기다리기 위한 Promise를 생성
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // 5초를 기다림
    await wait(5000);

    console.log("token123 : ", token);
    console.log("token123 : ", token);
    console.log("token123 : ", token);
    console.log("token123 : ", token);
  } catch (error) {
    console.error("에러다: ", error);
  }
}

main();
// async function test() {
//   const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

//   // 5초를 기다림
//   await wait(5000);
//   return 42;
// }

// console.log("bbb");
// const testaa = await test();
// console.log("aaaaaaaaa", testaa);
