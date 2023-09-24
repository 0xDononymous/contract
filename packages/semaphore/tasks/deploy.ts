import { task, types } from 'hardhat/config'

task('deploy', 'Deploy a MockSemaphoreHook contract')
  .addOptionalParam(
    'semaphore',
    'Semaphore contract address',
    undefined,
    types.string
  )
  .addOptionalParam('group', 'Group id', '42', types.string)
  .addOptionalParam('logs', 'Print the logs', true, types.boolean)
  .setAction(
    async (
      { logs, semaphore: semaphoreAddress, group: groupId },
      { ethers, run }
    ) => {
      if (!semaphoreAddress) {
        const { semaphore } = await run('deploy:semaphore', {
          logs,
        })

        semaphoreAddress = semaphore.address
      }

      if (!groupId) {
        groupId = process.env.GROUP_ID
      }

      const MockSemaphoreHookFactory = await ethers.getContractFactory(
        'MockSemaphoreHook'
      )

      const MockSemaphoreHookContract = await MockSemaphoreHookFactory.deploy(
        semaphoreAddress
      )

      await MockSemaphoreHookContract.deployed()

      if (logs) {
        console.info(
          `MockSemaphoreHook contract has been deployed to: ${MockSemaphoreHookContract.address}`
        )
      }

      return MockSemaphoreHookContract
    }
  )
