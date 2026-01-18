import CryptoJS from "crypto-js";

const SECRET_KEY:any = process.env.NEXT_PUBLIC_RESPONSE_ENCRYPT_KEY
const KEY2:any = process.env.NEXT_PUBLIC_RESPONSE_ENCRYPT_KEY2
const SECRET_KEY_IV:any = process.env.NEXT_PUBLIC_RESPONSE_ENCRYPT_KEY_IV

// Encrypt data
export const encryptData = (data: any) => {
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
  return encrypted;
};

// Decrypt data
export const decryptData = (ciphertext: string) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    // const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted;
  } catch (error) {
    // Decryption failed
    return null;
  }
};

export const decryptResponse = (encryptedData:any) => {
  // const crypto = require('crypto');
  const algorithm = 'aes-256-cbc';
  
   // Parse the key and IV into WordArray format
   const key = CryptoJS.enc.Utf8.parse(KEY2);
   const ivBytes = CryptoJS.enc.Utf8.parse(SECRET_KEY_IV);
 
   // Extract the encrypted string from the object
  //  const encryptedData = encryptedObject.encryptedData;
 
   const decrypted = CryptoJS.AES.decrypt(encryptedData.encryptedData, key, {
     iv: ivBytes,
     mode: CryptoJS.mode.CBC,
     padding: CryptoJS.pad.Pkcs7,
   });
 
   const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
 
   try {
     return JSON.parse(decryptedText); // Convert JSON string to object if valid JSON
   } catch (error) {
     return decryptedText; // Return plain text if it's not JSON
   }

}