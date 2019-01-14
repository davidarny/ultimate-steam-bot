module.exports = {
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
  globals: { 'ts-jest': { tsConfig: 'tsconfig.json', diagnostics: false } },
  moduleFileExtensions: ['ts', 'js'],
  transform: { '^.+\\.(ts|tsx)$': 'ts-jest' },
  moduleNameMapper: {
    '^@app(.*)$': '<rootDir>/src/app$1',
    '^@config(.*)$': '<rootDir>/src/config$1',
    '^@middlewares(.*)$': '<rootDir>/src/middlewares$1',
    '^@utils(.*)$': '<rootDir>/src/utils$1',
    '^@entities(.*)$': '<rootDir>/src/entities$1',
    '^@controllers(.*)$': '<rootDir>/src/controllers$1',
    '^@services(.*)$': '<rootDir>/src/services$1',
    '^@routes(.*)$': '<rootDir>/src/routes$1',
  },
  testMatch: ['**/test/**/*.test.ts'],
  testEnvironment: 'node',
};
