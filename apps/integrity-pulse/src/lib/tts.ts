import { VOICE_PROFILES, AgentId } from '../agents/voiceProfiles';

function pickVoice(desired: string[]): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  // try partial name matches in order
  for (const target of desired) {
    const v = voices.find(x => x.name.toLowerCase().includes(target.toLowerCase()));
    if (v) return v;
  }
  return voices[0] || null;
}

export function speakAs(agent: AgentId, text: string) {
  const profile = VOICE_PROFILES[agent];
  if (!('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis not supported');
    return;
  }
  const utter = new SpeechSynthesisUtterance(text);
  // some browsers need async voice load
  const assignAndSpeak = () => {
    const voice = pickVoice(profile.tts.preferredVoices);
    if (voice) utter.voice = voice;
    utter.rate = profile.tts.rate ?? 1.0;
    utter.pitch = profile.tts.pitch ?? 1.0;
    utter.volume = profile.tts.volume ?? 1.0;
    window.speechSynthesis.speak(utter);
  };

  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = assignAndSpeak;
  } else {
    assignAndSpeak();
  }
}
