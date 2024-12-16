import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { rimraf } from 'rimraf';
import { mkdirp } from 'mkdirp';
import { loginLocation } from '../lib/locations.mjs';
import { EventEmitter } from 'events';
import { Readable } from 'stream';

// Mock ethers HDNodeWallet
jest.unstable_mockModule('ethers', () => ({
  HDNodeWallet: {
    fromPhrase: jest.fn().mockReturnValue({
      address: '0xMockedWalletAddress',
      privateKey: '0xMockedWalletPrivateKey',
      mnemonic: {
        phrase: 'test test test test test test test test test test test test'
      }
    })
  }
}));

// Create mock streams for stdout/stderr
class MockStream extends Readable {
  constructor(options = {}) {
    super(options);
    this._data = options.data || '';
  }

  _read() {
    this.push(this._data);
    this.push(null);
  }

  pipe() {
    return this;
  }
}

// Create a mock process that implements event emitter
class MockProcess extends EventEmitter {
  constructor(options = {}) {
    super();
    this.stdout = new MockStream({ data: options.stdout || '' });
    this.stderr = new MockStream({ data: options.stderr || '' });
    this.status = options.status || 0;

    // Emit close event on next tick
    process.nextTick(() => {
      this.emit('close', this.status);
    });
  }

  on(event, handler) {
    super.on(event, handler);
    return this;
  }
}

// Mock cross-spawn
jest.unstable_mockModule('cross-spawn', () => ({
  default: jest.fn().mockImplementation((cmd, args) => {
    // For pnpm root command, return a process with stdout data
    if (args && args[0] === 'root') {
      return new MockProcess({
        stdout: '/usr/local/lib/node_modules\n',
        status: 0
      });
    }
    // For other commands, return a basic successful process
    return new MockProcess({ status: 0 });
  })
}));

// Mock the required modules before any imports
const mockGetAgentAuthSpec = jest.fn().mockImplementation(async (jwt) => {
  // First call getUserForJwt to validate the JWT
  await mockGetUserForJwt(jwt);
  return {
    guid: 'test-guid',
    agentToken: 'test-agent-token',
    userPrivate: 'test-user-private',
    mnemonic: 'test-mnemonic'
  };
});

const mockGetUserForJwt = jest.fn().mockResolvedValue({
  id: 'test-user-id',
  active_asset: null
});

const mockGetUserIdForJwt = jest.fn().mockResolvedValue('test-user-id');
const mockMakeAnonymousClient = jest.fn();

// Mock npm-util module with all required exports
jest.unstable_mockModule('../lib/npm-util.mjs', () => ({
  getPnpmPath: jest.fn().mockReturnValue('/usr/local/bin/pnpm'),
  getNpmPath: jest.fn().mockReturnValue('/usr/local/bin/npm'),
  getYarnPath: jest.fn().mockReturnValue('/usr/local/bin/yarn'),
  hasNpm: jest.fn().mockResolvedValue(true),
  npmInstall: jest.fn().mockResolvedValue(undefined),
  ensureNpmRoot: jest.fn().mockResolvedValue('/usr/local/lib/node_modules')
}));

// Mock directory-util module
jest.unstable_mockModule('../lib/directory-util.mjs', () => ({
  cleanDir: jest.fn().mockImplementation(async (dir) => {
    await rimraf(dir);
    await mkdirp(dir);
    // Create package.json
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({
      name: 'test-agent',
      version: '1.0.0'
    }, null, 2));
    return true;
  })
}));

// Mock directory-utils module
jest.unstable_mockModule('../util/directory-utils.mjs', () => ({
  cwd: process.cwd()
}));

// Mock fs operations
const mockWriteFileSync = jest.spyOn(fs, 'writeFileSync');
const mockMkdirSync = jest.spyOn(fs, 'mkdirSync');

// Mock ethereum-utils module
jest.unstable_mockModule('../packages/upstreet-agent/packages/react-agents/util/ethereum-utils.mjs', () => ({
  getWalletFromMnemonic: jest.fn().mockReturnValue({
    address: '0xMockedAddress',
    privateKey: '0xMockedPrivateKey',
    mnemonic: {
      phrase: 'test test test test test test test test test test test test'
    }
  }),
  getIndexedAccountPath: jest.fn().mockReturnValue("m/44'/60'/0'/0/0")
}));

// Mock agent-json-util module
jest.unstable_mockModule('../packages/upstreet-agent/packages/react-agents/util/agent-json-util.mjs', () => {
  let testDirectory;
  return {
    updateAgentJsonAuth: jest.fn().mockImplementation(async (agentJson, { mnemonic }) => {
      const updatedJson = {
        ...agentJson,
        address: '0xMockedAddress',
        privateKey: '0xMockedPrivateKey'
      };
      fs.writeFileSync(path.join(testDirectory, 'agent.json'), JSON.stringify(updatedJson, null, 2));
      return updatedJson;
    }),
    ensureAgentJsonDefaults: jest.fn().mockImplementation(agentJson => {
      const defaultJson = {
        ...agentJson,
        name: 'Test Agent',
        bio: 'Test Bio'
      };
      return defaultJson;
    }),
    setTestDirectory: (dir) => {
      testDirectory = dir;
      // Ensure directory exists
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  };
});

// Mock agent-source-code-formatter module
jest.unstable_mockModule('../packages/upstreet-agent/packages/react-agents/util/agent-source-code-formatter.mjs', () => {
  let testDirectory;
  return {
    makeAgentSourceCode: jest.fn().mockImplementation((agentJson) => {
      const sourceCode = '// Mocked agent source code';
      fs.writeFileSync(path.join(testDirectory, 'index.js'), sourceCode);
      return sourceCode;
    }),
    setTestDirectory: (dir) => {
      testDirectory = dir;
      // Ensure directory exists
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  };
});

// Mock agent-interview module
jest.unstable_mockModule('../packages/upstreet-agent/packages/react-agents/util/agent-interview.mjs', () => ({
  AgentInterview: jest.fn().mockImplementation(() => ({
    addEventListener: jest.fn(),
    waitForFinish: jest.fn().mockResolvedValue({
      name: 'Test Agent',
      bio: 'Test Bio'
    })
  }))
}));

// Mock character-card module
jest.unstable_mockModule('../util/character-card.mjs', () => ({
  CharacterCardParser: jest.fn(),
  LorebookParser: jest.fn()
}));

// Mock image-preview-server module
jest.unstable_mockModule('../util/image-preview-server.mjs', () => ({
  default: jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    updateImage: jest.fn(),
    getImageUrl: jest.fn()
  }))
}));

// Mock other modules
jest.unstable_mockModule('../util/agent-auth-util.mjs', () => ({
  getAgentAuthSpec: mockGetAgentAuthSpec
}));

jest.unstable_mockModule('../packages/upstreet-agent/packages/react-agents/util/supabase-client.mjs', () => ({
  makeAnonymousClient: mockMakeAnonymousClient,
  getUserIdForJwt: mockGetUserIdForJwt,
  getUserForJwt: mockGetUserForJwt
}));

describe('usdk create command', () => {
  let create;
  let agentJsonUtil;
  let agentSourceCodeFormatter;
  const testDir = path.join(process.cwd(), 'test-agent');
  const mockJwt = 'mock.jwt.token';
  const mockLoginData = {
    id: 'test-user-id',
    jwt: mockJwt
  };

  // Import the create function after mocks are set up
  beforeAll(async () => {
    // Ensure login directory exists
    await mkdirp(path.dirname(loginLocation));
    // Write mock login data
    fs.writeFileSync(loginLocation, JSON.stringify(mockLoginData));

    // Import the create function
    const module = await import('../lib/create.mjs');
    create = module.create;

    // Get mock modules to set test directory
    const agentJsonUtilModule = await import('../packages/upstreet-agent/packages/react-agents/util/agent-json-util.mjs');
    const agentSourceCodeFormatterModule = await import('../packages/upstreet-agent/packages/react-agents/util/agent-source-code-formatter.mjs');

    agentJsonUtil = agentJsonUtilModule;
    agentSourceCodeFormatter = agentSourceCodeFormatterModule;
  });

  afterAll(async () => {
    try {
      await fs.promises.unlink(loginLocation);
    } catch (err) {
      // Ignore error if file doesn't exist
    }
  });

  beforeEach(async () => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Clean up test directory before each test
    await rimraf(testDir);

    // Set test directory in mocked modules
    agentJsonUtil.setTestDirectory(testDir);
    agentSourceCodeFormatter.setTestDirectory(testDir);
  });

  afterEach(async () => {
    // Clean up test directory after each test
    await rimraf(testDir);
  });

  test('create -y creates agent successfully', async () => {
    // Call create function with properly structured arguments
    const args = {
      _: [testDir], // First positional argument is the destination directory
      yes: true     // -y flag
    };
    const opts = {
      jwt: mockJwt  // JWT should be in opts, not args
    };

    await create(args, opts);

    // Verify directory was created
    expect(fs.existsSync(testDir)).toBe(true);

    // Verify key files exist
    expect(fs.existsSync(path.join(testDir, 'agent.json'))).toBe(true);
    expect(fs.existsSync(path.join(testDir, 'package.json'))).toBe(true);

    // Verify mocks were called
    expect(mockGetAgentAuthSpec).toHaveBeenCalled();
    expect(mockGetUserForJwt).toHaveBeenCalledWith(mockJwt);
  });
});
