import { ethers } from 'hardhat'
import { Group } from '@semaphore-protocol/group'
import { Identity } from '@semaphore-protocol/identity'
import { generateProof } from '@semaphore-protocol/proof'
import { expect } from 'chai'
import { formatBytes32String } from 'ethers/lib/utils'
import { run } from 'hardhat'
// @ts-ignore: typechain folder will be generated after contracts compilation
import { DononymousSemaphore } from '../../build/typechain'
import { config } from '../package.json'

describe('Anonymous ', () => {
  let semaphoreContract: DononymousSemaphore
  let semaphoreCore: string

  const groupId = '1'
  const group = new Group(groupId)
  const users: Identity[] = []

  before(async () => {
    console.log('Deploying Semaphore Core...')
    const { semaphore } = await run('deploy:semaphore', {
      logs: false,
    })

    semaphoreCore = semaphore
    console.log('Semaphore Core deployed at:', semaphoreCore.address)
    console.log('Deploying Semaphore Contract...')
    semaphoreContract = await run('deploy', {
      logs: false,
      semaphore: semaphore.address,
    })
    console.log('Semaphore Contract deployed at:', semaphoreContract.address)

    users.push(new Identity('user_secret_1'))
    users.push(new Identity('user_secret_2'))
  })

  describe('# createGroup', () => {
    it('Should allow owner to create a group', async () => {
      const org1 = ethers.Wallet.createRandom()
      const memberMaxAmount = 20
      const transaction = semaphoreContract.initOrganization(
        org1.address,
        groupId,
        memberMaxAmount
      )

      await expect(transaction).to.emit(semaphoreCore, 'GroupCreated')
    })
  })

  describe('# joinGroup', () => {
    it('Should allow users to join the group', async () => {
      for await (const [i, user] of users.entries()) {
        const transaction = semaphoreContract.joinService(
          groupId,
          user.commitment
        )

        group.addMember(user.commitment)

        await expect(transaction).to.emit(semaphoreCore, 'MemberAdded')
      }
    })
  })

  describe('# sendFeedback', () => {
    const wasmFilePath = `${config.paths.build['snark-artifacts']}/semaphore.wasm`
    const zkeyFilePath = `${config.paths.build['snark-artifacts']}/semaphore.zkey`

    it('Should allow users to send feedback anonymously', async () => {
      const feedback = formatBytes32String('Hello World')

      const fullProof = await generateProof(
        users[1],
        group,
        groupId,
        feedback,
        {
          wasmFilePath,
          zkeyFilePath,
        }
      )

      const transaction = semaphoreContract.verifyWithdraw(
        groupId,
        feedback,
        fullProof.merkleTreeRoot,
        fullProof.nullifierHash,
        fullProof.externalNullifier,
        fullProof.proof
      )

      await expect(transaction).to.emit(semaphoreCore, 'ProofVerified')
    })
  })
})
