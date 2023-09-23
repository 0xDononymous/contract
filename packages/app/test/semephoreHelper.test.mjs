import { idenSecretToken } from './mock.mjs'
import { genIdentity } from '../backend'

describe('semaphoreHelper', () => {
  describe('genIdentity', () => {
    it('should return an Identity object', () => {
      expect(genIdentity(idenSecretToken)).toBeInstanceOf(Identity)
    })
  })
})
