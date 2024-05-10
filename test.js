import CryptoJS from "crypto-js";
import secp256k1 from "secp256k1";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const secretKey =
  "0ff85630d16c9ffd03ae8d8ab92fda302994e24e2801fb99431bdf13ce5160ab";
const buffer = Buffer.from(secretKey, "hex");

const pubKey = secp256k1.publicKeyCreate(buffer);

// console.log(pubKey);

const hash = CryptoJS.SHA256("aaaa");
// 해시 값을 16진수로 변환하여 반환
const hashString = hash.toString(CryptoJS.enc.Hex);

console.log(hash);
console.log(hashString);
