import { Identity } from '@semaphore-protocol/identity'

export const genIdentity = (token) => {
  return new Identity(token)
}

export const joinService = (identity) => {}

export const genProof = (identity) => {}
