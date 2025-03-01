'use strict';

const assert = require('bsert');
const Mnemonic = require('../lib/hd/mnemonic');
const HDPrivateKey = require('../lib/hd/private');

const tests = {
  english: require('./data/mnemonic-english.json'),
  japanese: require('./data/mnemonic-japanese.json')
};

describe('Mnemonic', function() {
  for (const language of Object.keys(tests)) {
    const test = tests[language];
    let i = 0;

    for (const data of test) {
      const entropy = Buffer.from(data[0], 'hex');
      const phrase = data[1];
      const passphrase = data[2];
      const seed = Buffer.from(data[3], 'hex');
      const xpriv = data[4];

      it(`should create a ${language} mnemonic from entropy (${i})`, () => {
        const mnemonic = new Mnemonic({
          language,
          entropy
        });

        assert.strictEqual(mnemonic.getPhrase(), phrase);
        assert.bufferEqual(mnemonic.getEntropy(), entropy);
        assert.bufferEqual(mnemonic.toSeed(passphrase), seed);

        const key = HDPrivateKey.fromMnemonic(mnemonic, passphrase);
        assert.strictEqual(key.toBase58('main'), xpriv);
      });

      it(`should create a ${language} mnemonic from phrase (${i})`, () => {
        const mnemonic = new Mnemonic({
          language,
          phrase
        });

        assert.strictEqual(mnemonic.getPhrase(), phrase);
        assert.bufferEqual(mnemonic.getEntropy(), entropy);
        assert.bufferEqual(mnemonic.toSeed(passphrase), seed);

        const key = HDPrivateKey.fromMnemonic(mnemonic, passphrase);
        assert.strictEqual(key.toBase58('main'), xpriv);
      });

      i += 1;
    }
  }

  it('should verify phrase', () => {
    const m1 = new Mnemonic();
    const m2 = Mnemonic.fromPhrase(m1.getPhrase());
    assert.bufferEqual(m2.getEntropy(), m1.getEntropy());
    assert.strictEqual(m2.bits, m1.bits);
    assert.strictEqual(m2.language, m1.language);
    assert.bufferEqual(m2.toSeed(), m1.toSeed());
  });

  it('should standardize phrase', () => {
    for (const language of Object.keys(tests)) {
      const test = tests[language];

      // modified phrase contains new lines before every space
      const phrase = test[0][1];
      const phraseWithNl = phrase.replace(/(\s|\u3000)/g, '\n$&');

      // ensure new lines are added
      assert(!phrase.includes('\n'));
      assert(phraseWithNl.includes('\n'));

      const m1 = Mnemonic.fromPhrase(phrase);
      const m2 = Mnemonic.fromPhrase(phraseWithNl);

      // Both mnemonics should have same phrase without new lines
      assert(m1.getPhrase() === m2.getPhrase());
      assert(!m1.getPhrase().includes('\n'));
    }
  });
});
