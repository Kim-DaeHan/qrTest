import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

// 암호화에 사용할 키 생성
const secretKey = randomBytes(32); // 32바이트 길이의 무작위 키 생성
const keyString = secretKey.toString("hex");
const aaaa = Buffer.from(keyString, "hex");
console.log(secretKey, keyString);
console.log(aaaa);

// 암호화 함수 정의
function encrypt(text, key) {
  const iv = Buffer.alloc(16, 0); // 초기화 벡터(IV) 사용
  const cipher = createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

// 복호화 함수 정의
function decrypt(encryptedText, key) {
  const iv = Buffer.alloc(16, 0);
  const decipher = createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

// 테스트 문자열
const originalText = "Hello, world!";

// 문자열 암호화
const encryptedText = encrypt(originalText, secretKey);
console.log("Encrypted:", encryptedText);

// 암호화된 문자열 복호화
const decryptedText = decrypt(encryptedText, secretKey);
console.log("Decrypted:", decryptedText);
