import Socket from "./socket.js";
import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";

// 소켓 서버 초기화 함수
function walletLogin(message) {
  const sessionKey = "103a4081d986d570e28e1bc35d53cc93";
  const secretKey =
    "0ff85630d16c9ffd03ae8d8ab92fda302994e24e2801fb99431bdf13ce5160ab";

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

  const socket = new Socket();
  return new Promise((resolve, reject) => {
    const clients = [];

    let token;

    socket.wss.on("connection", (ws, req) => {
      const clientSessionKey = req.headers["sec-websocket-protocol"];

      if (clientSessionKey !== sessionKey) {
        ws.close();
        socket.server.close(() => {
          reject("Invalid session key");
        });
      }

      clients.push(ws);

      ws.on("message", (msg) => {
        const decryptMsg = decrypt(msg.toString(), secretKey);
        if (decryptMsg.length === 44) {
          token = createToken(decryptMsg, sessionKey);

          ws.send(encrypt(message, secretKey));
        } else if (decryptMsg.length === 64) {
          const hash = CryptoJS.SHA256(message + "zigap").toString(
            CryptoJS.enc.Hex
          );
          if (decryptMsg === hash) {
            ws.close();
            socket.server.close(() => {
              resolve(token);
            });
          } else {
            ws.close();
            socket.server.close(() => {
              reject("Failed to sign");
            });
          }
        } else {
          ws.close();
          socket.server.close(() => {
            reject("Invalid message");
          });
        }
      });

      ws.on("close", () => {
        const index = clients.indexOf(ws);
        if (index !== -1) {
          clients.splice(index, 1);
        }
        socket.server.close(() => {
          reject("Client disconnected");
        });
      });
    });

    const PORT = 7070;
    socket.server.listen(PORT, (error) => {
      if (error) {
        reject("Server Error");
      }
      console.log(`Socket server listening on port ${PORT}`);
    });
  });
}

async function main() {
  try {
    const token = await walletLogin("Welcome to DAPP!!");

    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    await wait(5000);

    console.log("token : ", token);
  } catch (error) {
    console.error("에러다: ", error);
  }
}

main();
