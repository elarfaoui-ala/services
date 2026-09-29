/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        module: 'commonjs',
        esModuleInterop: true,
      },
    }],
  },
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/../shared/src/$1',
  },
};

module.exports = config;
