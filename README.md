# Dononymous

Do the world some kind with Dononymous.</br>
Dononymous allows you to donate anonymously, and ensures your donation always aligns with your interest.

## Dononymous includes four main part

1. Verified Identity Source: </br>
   We utilized Lens protocol profile as the identity source. Verified through PolygonId, we ensure the validity of fund source.
2. Onchain Privacy Identity </br>
   We use a relayer wallet account along with Semaphore to generate idCommitment to prove the user has donated with us without revealing the user's walletaddress or onchain identity.
3. Uniswap V4 pool/hook as our donation platform </br>
   Other than giving money to the user directly, we designed the hook and enable the donor to provide liquidity while the organization get funded with hook fee. The donor would be able to retrieve the liquidity once their vision no longer aligns with the organization.
4. Proof of public goods NFT </br>
   Among donation, the user could choose to mint a NFT as a proof of contribution to public goods. We feel close with Nouns origins of puspose thus created the NFT with the Nouns protocols material.

## Tech stack

![Dononymous Image](https://github.com/0xDononymous/dononymous/assets/48847495/1ba0b199-7500-4994-a8b8-49f94940b0b2)

[Our figma board](https://www.figma.com/file/kx2dF6nh1GdXSMbzXCewdE/ZKoupon?type=design&node-id=101%3A2&mode=design&t=bTVxkG3VKebXW0Xf-1)

## Repo Guide

Ths saperate part of App and Contract is under the `package` and the set up guide could be find from the folder saperately.

```bash
yarn
```

### Build

* Semaphore

```bash
pwd
# dononymous/packages/semaphore
# make sure you are under the semaphore folder
yarn hardhat compile
```

* Contracts

```bash
pwd
# dononymous/packages/contracts
# make sure you are under the contracts folder
forge build --via-ir
```

### Test

* Semaphore

```bash
pwd
# dononymous/packages/semaphore
# make sure you are under the semaphore folder
yarn test
```

* Dononymous

```bash
pwd
# dononymous/packages/contracts
# make sure you are under the contracts folder
# forge test
```

### Deploy

* Issuer (Locally)

```bash
pwd
# dononymous/packages/issuer
# make sure you are under the issuer folder
# TODO
```

* Verifier (Locally)

```bash
pwd
# dononymous/packages/verifier
# make sure you are under the verifier folder
# TODO
```

* Semaphore

```bash
pwd
# dononymous/packages/semaphore
# make sure you are under the semaphore folder
# remember to pass in your ETHEREUM_PRIVATE_KEY
yarn hardhat run scripts/deploy.ts

Deploying Semaphore Core...
Semaphore Core deployed at: 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
```

* Dononymous

```bash
pwd
# dononymous/packages/contracts
# make sure you are under the contracts folder
# copy the semaphore address and paste it to packages/contracts/script/Dononymous.s.sol#L18
forge script script/Dononymous.s.sol \
    --rpc-url <rpc url> \
    --private-key <private key> \
    --broadcast
```

## Future enhancement

1. Integration with Axiom:</br>
   To provide more incentive and bring closer the donation circle, we could integrate with Axiom to check the previous record of owning the proof of public good NFT and provide discount when the past donor comes to swap with our pool.
2. Diversify the usage of stale funds in the pool: </br>
   There could be more operations to magnify the fee and fund for donation with more hook design and yield farming.

## Deployed Address

### Base Goerli

### Arbitrum Goerli
semaphore [0x279cB6bb9C0354e19908b82b34D24fbd76A45bB3](https://goerli.arbiscan.io/address/0x279cB6bb9C0354e19908b82b34D24fbd76A45bB3)
dononymous 0x20e1081fBaadf2472F5E54af8F5CFcE52df04328

### Scroll Sepolia
