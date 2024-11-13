import {
  makeId,
} from '../util.js';

function hex2ArrayBuffer(hexString) {
  const buffer = new ArrayBuffer(hexString.length / 2);
  const bufferView = new Uint8Array(buffer);
  for (let i = 0; i < bufferView.length; i++) {
    bufferView[i] = parseInt(hexString.substr(i * 2, 2), 16);
  }
  return buffer;
}
function arrayBuffer2Hex(buffer) {
  const bufferView = new Uint8Array(buffer);
  const hex = new Array(bufferView.length);
  for (let i = 0; i < bufferView.length; i++) {
    hex[i] = ('00' + bufferView[i].toString(16)).slice(-2);
  }
  return hex.join('');
}
const makeCredentials = async (key, value) => {
  const username = 'user';
  const userid = new Uint8Array(16);
  const challenge = new ArrayBuffer(64);
  new Uint8Array(challenge).fill(0x42);
  const credentials = await navigator.credentials.create({
    publicKey: {
      attestation: 'none',
      authenticatorSelection: {
        // "residentKey": "preferred",
        "requireResidentKey": true,
        "userVerification": "preferred"
      },
      pubKeyCredParams: [
        {
          "type": "public-key",
          "alg": -7, // ES256
        },
        {
          "type": "public-key",
          "alg": -257, // RS256
        },
      ],
      extensions: [{ credProps: true }],
      challenge,
      timeout: 60000,
      user: { displayName: username, name: username, id: userid, },
      rp: { name: location.hostname, id: location.hostname, },
    },
  });
  return credentials;
};

//

export class AuthClient {
  async checkSteamKey({
    steamKey,
    authServerUrl,
  }) {
    const res = await fetch(`${authServerUrl}checkSteamKey`, {
      method: 'POST',
      body: JSON.stringify({
        steamKey,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const json = await res.json();
    const {
      ok,
    } = json;
    return ok;
  }
  async checkDiscord({
    code,
    state,
    authServerUrl,
  }) {
    // const credentials = await makeCredentials();

    // const {
    //   attestationObject,
    // } = credentials.response;
    const res = await fetch(`${authServerUrl}checkDiscord`, {
      method: 'POST',
      body: JSON.stringify({
        // id: credentials.id,
        code,
        state,
        // attestationObject: arrayBuffer2Hex(attestationObject),
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const json = await res.json();
    return json;
  }
  async registerDiscord({
    // code,
    // state,
    access_token,
    authServerUrl,
  }) {
    const credentials = await makeCredentials();
    // console.log('got credentials', credentials);

    const {
      attestationObject,
    } = credentials.response;
    const res = await fetch(`${authServerUrl}registerDiscord`, {
      method: 'POST',
      body: JSON.stringify({
        id: credentials.id,
        // code,
        // state,
        access_token,
        attestationObject: arrayBuffer2Hex(attestationObject),
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const json = await res.json();
    return json;
  }
  async registerSteam({
    steamKey,
    authServerUrl,
  }) {
    const credentials = await makeCredentials();
    // console.log('got credentials', credentials);

    const {
      attestationObject,
    } = credentials.response;
    const res = await fetch(`${authServerUrl}registerSteam`, {
      method: 'POST',
      body: JSON.stringify({
        id: credentials.id,
        steamKey,
        attestationObject: arrayBuffer2Hex(attestationObject),
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const json = await res.json();
    return json;
  }
  async login({
    id = null,
    authServerUrl,
  }) {
    const challengeId = makeId(8);
    const challenge = await (async () => {
      const res = await fetch(`${authServerUrl}challenge`, {
        method: 'POST',
        body: JSON.stringify({
          challengeId,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const json = await res.json();
      let {
        challenge,
      } = json;
      challenge = hex2ArrayBuffer(challenge);
      return challenge;
    })();
    console.log('got challenge', challenge);

    // const {
    //   rawId,
    //   id,
    // } = credentials;
    const j = {
      publicKey: {
        // allowCredentials: [
        //   {
        //     id: rawId,
        //     transports: ['hybrid', 'internal'],
        //     type: 'public-key',
        //   }
        // ],
        challenge,
        rpId: location.hostname,
        timeout: 60000,
        userVerification: 'preferred',
      },
    };
    if (id) {
      j.publicKey.allowCredentials = [
        {
          id,
          transports: ['hybrid', 'internal'],
          type: 'public-key',
        },
      ];
    }
    const credentials = await navigator.credentials.get(j);
    console.log('got credentials', credentials);

    // const {
    //   attestationObject,
    //   // clientDataJSON,
    // } = credentials.response;
    const {
      authenticatorData,
      clientDataJSON,
      signature,
    } = credentials.response;

    const j2 = {
      challengeId,
      id: credentials.id,
      // attestationObject: arrayBuffer2Hex(attestationObject),
      authenticatorData: arrayBuffer2Hex(authenticatorData),
      clientDataJSON: arrayBuffer2Hex(clientDataJSON),
      signature: arrayBuffer2Hex(signature),
    };
    // console.log('authenticating', j2, { /*attestationObject,*/ authenticatorData, clientDataJSON, signature });
    const res = await fetch(`${authServerUrl}authenticate`, {
      method: 'POST',
      body: JSON.stringify(j2),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const json = await res.json();
    return json;
  }
  async checkToken({
    token,
    authServerUrl,
  }) {
    const res = await fetch(`${authServerUrl}checkToken`, {
      method: 'POST',
      body: JSON.stringify({
        token,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const json = await res.json();
    return json;
  }
  async useToken({
    token,
    authServerUrl,
  }) {
    const res = await fetch(`${authServerUrl}useToken`, {
      method: 'POST',
      body: JSON.stringify({
        token,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const json = await res.json();
    return json;
  }
}