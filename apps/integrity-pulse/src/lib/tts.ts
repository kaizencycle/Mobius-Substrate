import { VOICE_PROFILES, AgentId } from '../agents/voiceProfiles';

function pickVoice(desired: string[]): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();

  // Optimize: Pre-lowercase arrays to avoid repeated toLowerCase() calls
  const desiredLower = desired.map(d => d.toLowerCase());
  const voicesWithLowerNames = voices.map(v => ({ voice: v, nameLower: v.name.toLowerCase() }));

  // try partial name matches in order
  for (const targetLower of desiredLower) {
    const match = voicesWithLowerNames.find(v => v.nameLower.includes(targetLower));
    if (match) return match.voice;
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
