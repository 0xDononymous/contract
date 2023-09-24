import { ethers, run } from 'hardhat'

async function main() {
  let semaphoreCore: string
  console.log('Deploying Semaphore Core...')
  const { semaphore } = await run('deploy:semaphore', {
    logs: false,
  })

  semaphoreCore = semaphore
  console.log('Semaphore Core deployed at:', semaphoreCore.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
