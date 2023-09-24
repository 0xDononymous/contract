// reference: https://github.com/docknetwork/polygonid-demo/blob/master/docs/IssuingQuickStart.md

import axios from 'axios'
import { Buffer } from 'buffer';


function btoa(str) {
  if (Buffer.byteLength(str) !== str.length)
    throw new Error('bad string!');
  return Buffer(str, 'binary').toString('base64');
}

const PID_API_URL = 'https://api-testnet.dock.io'

const paths = {
  // identities: 'identities',
  // publishOnChain: `${PID_API_URL}/state/publish`,
  createClaim: `${PID_API_URL}/credentials/request-claims`,
  // claimQrCode: (did, claimId) => `${did}/claims/${claimId}/qrcode`,
}
// const headersConfig = {
//   // Authorization: 'Basic ' + btoa(username + ':' + password),
//   // 'Access-Control-Allow-Origin': 'https://api-testnet.dock.io',
//   // 'Content-Type': 'application/json',
//   headers: {
//     'DOCK-API-TOKEN': 'eyJzY29wZXMiOlsidGVzdCIsImFsbCJdLCJzdWIiOiIxMDIxMSIsInNlbGVjdGVkVGVhbUlkIjoiMTQyOTIiLCJjcmVhdG9ySWQiOiIxMDIxMSIsImlhdCI6MTY5NTQ4ODM0OCwiZXhwIjo0Nzc0Nzg0MzQ4fQ.5nAknsr5g0Ic1daNnKB5PKeO6jHx-hM2zK5qQHNWuImFEk0qS_llEPFolrJb65zI118_bKiZMLZUrNy5ktSuCw',
//   },
// }

const axiosHeaders = {
  // headers: {
  //   'DOCK-API-TOKEN': 'eyJzY29wZXMiOlsidGVzdCIsImFsbCJdLCJzdWIiOiIxMDIxMSIsInNlbGVjdGVkVGVhbUlkIjoiMTQyOTIiLCJjcmVhdG9ySWQiOiIxMDIxMSIsImlhdCI6MTY5NTQ4ODM0OCwiZXhwIjo0Nzc0Nzg0MzQ4fQ.5nAknsr5g0Ic1daNnKB5PKeO6jHx-hM2zK5qQHNWuImFEk0qS_llEPFolrJb65zI118_bKiZMLZUrNy5ktSuCw',
  // },
  'DOCK-API-TOKEN': 'eyJzY29wZXMiOlsidGVzdCIsImFsbCJdLCJzdWIiOiIxMDIxMSIsInNlbGVjdGVkVGVhbUlkIjoiMTQyOTIiLCJjcmVhdG9ySWQiOiIxMDIxMSIsImlhdCI6MTY5NTQ4ODM0OCwiZXhwIjo0Nzc0Nzg0MzQ4fQ.5nAknsr5g0Ic1daNnKB5PKeO6jHx-hM2zK5qQHNWuImFEk0qS_llEPFolrJb65zI118_bKiZMLZUrNy5ktSuCw',  //TODO(ky): hard-coded, to refactor.
};


// no need to create identity
// export const createIdentity = async (body) =>
//   await axios({
//     method: 'POST',
//     url: `${PID_API_URL}${paths.identities}`,
//     data: body,
//     headers: headersConfig,
//   })

export const createClaim = async (
  // issuerDID, //TODO update where the function's being called.
  userDID,
  lensID,
  lensfollowers
) => {
  // const body = {
  //   credentialSchema:
  //     'https://raw.githubusercontent.com/teeolendo/lens-id/main/schemas/lensfollowers.json',
  //   type: 'lensfollowers',
  //   credentialSubject: {
  //     id: userDID,
  //     lensfollowers: lensID,
  //     lensid: lensfollowers,
  //   },
  //   expiration: 1680532130,
  // }

  const requestBody = {
    schema: 'https://raw.githubusercontent.com/teeolendo/lens-id/main/schemas/lensfollowers.json',
    claims: [ 'id', 'name', 'stats'],
    credentialOptions: {
      anchor: false,
      persist: false,
      emailMessage: '',
      credential: {
        schema: 'https://raw.githubusercontent.com/teeolendo/lens-id/main/schemas/lensfollowers.json',
        issuer: 'did:polygonid:polygon:mumbai:2qG79L99uDxgaWe9ySyudEAxkv8V1EoShcbvZk5deC',
        name: 'LensKYCCredential',
        type: [ "VerifiableCredential", "lensfollowers" ],
        subject: {
          id: userDID,
          lensid: lensID,
          lensfollowers: lensfollowers
        }
      },
      distribute: true
    }
  };

  return await axios({
    method: 'POST',
    url: `${paths.createClaim}`,
    data: requestBody,
    headers: axiosHeaders,
  })
}



// export const claimQrCode = async (did, claimId) =>
//   await axios({
//     method: 'GET',
//     url: `${PID_API_URL}${paths.claimQrCode(did, claimId)}`,
//     headers: headersConfig,
//   })

// export const generateQRCode = async (jsonLD) => {
//   const body = {
//     apikey: process.env.NEXT_PUBLIC_QRIO_API_KEY,
//     data: JSON.stringify(jsonLD),
//     transparent: 'on',
//     frontcolor: '#000000',
//     marker_out_color: '#000000',
//     marker_in_color: '#000000',
//     pattern: 'default',
//     marker: 'default',
//     marker_in: 'default',
//     optionlogo: 'none',
//   }

//   return await axios({
//     method: 'POST',
//     url: 'https://api.qr.io/v1/create',
//     data: body,
//   })
// }
