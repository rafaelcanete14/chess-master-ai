module.exports = {
  Audio: {
    Sound: {
      createAsync: jest.fn(() => Promise.resolve({
        sound: {
          playAsync: jest.fn(),
          replayAsync: jest.fn(),
          unloadAsync: jest.fn()
        }
      }))
    },
    setAudioModeAsync: jest.fn()
  }
};
