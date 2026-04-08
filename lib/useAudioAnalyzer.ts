import { useEffect, useRef, useState, useCallback } from "react";
import {
  audioSpectrumBridge,
  computeSpectrumFromBins,
  resetAudioSpectrumBridge,
} from "@/lib/audioSpectrumBridge";

const TARGET_VOLUME = 0.4;
const FADE_DURATION = 3000;
const FADE_INTERVAL = 50;

export function useAudioAnalyzer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number>(0);
  const hasStartedRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const savedVolumeRef = useRef(TARGET_VOLUME);

  const startAudio = useCallback(() => {
    if (hasStartedRef.current) return;
    if (typeof window === "undefined") return;

    hasStartedRef.current = true;

    // Create audio element
    const audio = new Audio("/zoned_final.mp3");
    audio.loop = false;
    audio.volume = 0;
    audioRef.current = audio;

    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      resetAudioSpectrumBridge();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    });

    audio.addEventListener("error", (e) => {
      console.error("Audio error:", e);
      hasStartedRef.current = false;
    });

    // Create AudioContext synchronously in user gesture
    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;

    const source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

    // Play audio
    audio
      .play()
      .then(() => {
        setIsPlaying(true);

        // Fade in volume
        const volumeIncrement = TARGET_VOLUME / (FADE_DURATION / FADE_INTERVAL);
        const fadeInterval = setInterval(() => {
          if (audio.volume < TARGET_VOLUME) {
            audio.volume = Math.min(
              audio.volume + volumeIncrement,
              TARGET_VOLUME
            );
          } else {
            clearInterval(fadeInterval);
          }
        }, FADE_INTERVAL);

        // Start animation loop to update audio data
        const updateAudioData = () => {
          if (analyserRef.current && dataArrayRef.current) {
            analyserRef.current.getByteFrequencyData(dataArrayRef.current);
            const { lowFreq, highFreq } = computeSpectrumFromBins(
              dataArrayRef.current,
            );
            audioSpectrumBridge.lowFreq = lowFreq;
            audioSpectrumBridge.highFreq = highFreq;
          }
          animationFrameRef.current = requestAnimationFrame(updateAudioData);
        };
        updateAudioData();
      })
      .catch((error) => {
        console.error("Audio playback failed:", error);
        hasStartedRef.current = false;
      });
  }, []);

  useEffect(() => {
    return () => {
      resetAudioSpectrumBridge();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;

    if (isMuted) {
      audioRef.current.volume = savedVolumeRef.current;
      setIsMuted(false);
    } else {
      savedVolumeRef.current = audioRef.current.volume;
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted]);

  return { isPlaying, isMuted, startAudio, toggleMute };
}
