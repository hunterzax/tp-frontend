const fs = require('fs');
const axios = require('axios');

const VAULT_TOKEN = process.env.VAULT_TOKEN;
const VAULT_ADDR = process.env.daa || 'http://110.164.203.174:8200';
const SECRET_PATH = 'kv/data/tpa'; // KV v2 path

// async function main() {
//     try {
//         const res = await axios.get(`${VAULT_ADDR}/v1/${SECRET_PATH}`, {
//             headers: {
//                 'X-Vault-Token': VAULT_TOKEN,
//             },
//         });

//         const data = res.data.data.data;

//         const envLines = Object.entries(data).map(([key, value]) => `${key}=${value}`);
//         fs.writeFileSync('.env.local', envLines.join('\n'));

//     } catch (err) {
//          // [Vault] Failed to fetch secret:
//         process.exit(1);
//     }
// }

// main();