import { isNative } from './platform';

let nativeOk: boolean | null = null;

function webVoice(): SpeechSynthesisVoice | undefined {
  if (typeof speechSynthesis === 'undefined') return undefined;
  return speechSynthesis.getVoices().find((v) => /^(he|iw)/i.test(v.lang));
}

/** Resolves true if a Hebrew voice is available. */
export async function hebrewVoiceAvailable(): Promise<boolean> {
  if (isNative()) {
    if (nativeOk !== null) return nativeOk;
    try {
      const { TextToSpeech } = await import('@capacitor-community/text-to-speech');
      const { languages } = await TextToSpeech.getSupportedLanguages();
      nativeOk = languages.some((l) => /^(he|iw)/i.test(l));
    } catch {
      nativeOk = false;
    }
    return nativeOk;
  }
  if (typeof speechSynthesis === 'undefined') return false;
  if (webVoice()) return true;
  return new Promise((resolve) => {
    const t = setTimeout(() => resolve(!!webVoice()), 1500);
    speechSynthesis.addEventListener?.('voiceschanged', () => {
      clearTimeout(t);
      resolve(!!webVoice());
    });
  });
}

export async function speak(text: string) {
  if (isNative()) {
    const { TextToSpeech } = await import('@capacitor-community/text-to-speech');
    const { languages } = await TextToSpeech.getSupportedLanguages();
    const lang = languages.find((l) => /^he/i.test(l)) ?? languages.find((l) => /^iw/i.test(l)) ?? 'he-IL';
    await TextToSpeech.stop().catch(() => {});
    await TextToSpeech.speak({ text, lang, rate: 0.85 });
    return;
  }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const v = webVoice();
  if (v) u.voice = v;
  u.lang = v?.lang ?? 'he-IL';
  u.rate = 0.85;
  speechSynthesis.speak(u);
}
