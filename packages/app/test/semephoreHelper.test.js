import { Identity } from '@semaphore-protocol/identity'
import { idenSecretToken } from './mock'
import { genIdentity, joinService, genProof } from '../backend'

describe('semaphoreHelper', () => {
  describe('genIdentity', () => {
    it('should return an Identity object', () => {
      expect(genIdentity(idenSecretToken)).toBeInstanceOf(Identity)
    })
  })

  describe('joinService', () => {
    it('should return a promise', () => {
      expect(joinService()).toBeInstanceOf(Promise)
    })
  })

  describe('genProof', () => {
    it('should return a promise', () => {
      expect(genProof()).toBeInstanceOf(Promise)
    })
  })
})
