/**
 * Web Speech API Voice Announcer for Clinic OPD Token Calling
 */

export function announceTokenNumber(tokenNumber: number, patientName: string, doctorCabin = 'Doctor Cabin') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech Synthesis not supported in this browser.');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Create chime effect using Web Audio API if available
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContext) {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch (e) {
    // ignore audio chime errors
  }

  // Speak announcement after tiny delay
  setTimeout(() => {
    const textToSpeak = `Token Number ${tokenNumber}, ${patientName}, please proceed to ${doctorCabin}.`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    utterance.rate = 0.9; // Slightly slower for clarity in clinic lobby
    utterance.pitch = 1.05;
    utterance.lang = 'en-IN'; // Indian English accent

    window.speechSynthesis.speak(utterance);
  }, 350);
}
