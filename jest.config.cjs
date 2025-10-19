const path = require('path');

module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',

    transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', 
            { 
                tsconfig: '<rootDir>/tsconfig.jest.json' 
            }]
    },
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

    setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '^axios$': require.resolve('axios')
    },
    globals: {
        'ts-jest': {
            tsconfig: path.resolve(__dirname, 'tsconfig.jest.json'),
            diagnostics: true
        }
    },
    transformIgnorePatterns: ['/node_modules/'],
    verbose: true
};