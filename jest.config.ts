import type {Config} from 'jest'

const config: Config = {
  verbose: true,
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./jest.setup.ts']
}

export default config
