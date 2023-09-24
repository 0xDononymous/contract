# Dononymous

Do the world some kind with Dononymous.<br/>
Dononymous allows you to donate anonymously, and ensures your donation always aligns with your interest. 

Dononymous includes four main part:
1. Verified Identity Source: <br/>
   We utilized Lens protocol profile as the identity source. Verified through PolygonId, we ensure the validity of fund source.
2. Onchain Privacy Identity <br/>
   We use a relayer wallet account along with Semaphore to generate idCommitment to prove the user has donated with us without revealing the user's walletaddress or onchain identity.
3. Uniswap V4 pool/hook as our donation platform <br/>
   Other than giving money to the user directly, we designed the hook and enable the donor to provide liquidity while the organization get funded with hook fee. The donor would be able to retrieve the liquidity once their vision no longer aligns with the organization.
4. Proof of public goods NFT <br/>
   Among donation, the user could choose to mint a NFT as a proof of contribution to public goods. We feel close with Nouns origins of puspose thus created the NFT with the Nouns protocols material.

## Tech stack

<img width="1289" alt="image" src="https://github.com/0xDononymous/dononymous/assets/48847495/1ba0b199-7500-4994-a8b8-49f94940b0b2">

## Future enhancement
1. Integration with Axiom: <br/>
   To provide more incentive and bring closer the donation circle, we could integrate with Axiom to check the previous record of owning the proof of public good NFT and provide discount when the past donor comes to swap with our pool.
2. Diversify the usage of stale funds in the pool: <br/>
   There could be more operations to magnify the fee and fund for donation with more hook design and yield farming.
