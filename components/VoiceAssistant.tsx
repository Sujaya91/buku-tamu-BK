
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';
import { Mic, MicOff, Loader2, Volume2 } from 'lucide-react';

interface VoiceAssistantProps {
  onUpdateFields: (fields: Partial<{ nama: string; instansi: string; alamat: string; kepentingan: string }>) => void;
}

// Audio utils
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const updateFormTool: FunctionDeclaration = {
  name: 'update_guest_form',
  parameters: {
    type: Type.OBJECT,
    description: 'Update the fields in the guest book form based on user speech.',
    properties: {
      nama: { type: Type.STRING, description: 'Nama lengkap tamu' },
      instansi: { type: Type.STRING, description: 'Instansi atau hubungan (contoh: Orang tua dari X)' },
      alamat: { type: Type.STRING, description: 'Alamat tamu' },
      kepentingan: { type: Type.STRING, description: 'Maksud atau tujuan kunjungan' },
    },
  },
};

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onUpdateFields }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);

  const stopAssistant = () => {
    if (sessionRef.current) {
      sessionRef.current.close?.();
      sessionRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.input.close();
      audioContextRef.current.output.close();
      audioContextRef.current = null;
    }
    for (const source of sourcesRef.current) {
      source.stop();
    }
    sourcesRef.current.clear();
    setIsActive(false);
    setIsConnecting(false);
  };

  const startAssistant = async () => {
    setIsConnecting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = { input: inputCtx, output: outputCtx };

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
          },
          tools: [{ functionDeclarations: [updateFormTool] }],
          systemInstruction: 'Anda adalah asisten buku tamu digital SMP Negeri 6 Nusa Penida. Tugas Anda adalah membantu tamu mengisi formulir melalui percakapan. Sapa tamu dengan ramah, tanyakan nama, instansi/orang tua dari siapa, alamat, dan kepentingannya. Gunakan alat update_guest_form setiap kali Anda mendapatkan informasi tersebut. Bicara dalam bahasa Indonesia yang sopan.',
        },
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (msg.toolCall) {
              for (const fc of msg.toolCall.functionCalls) {
                if (fc.name === 'update_guest_form') {
                  onUpdateFields(fc.args);
                  sessionPromise.then(s => s.sendToolResponse({
                    functionResponses: { id: fc.id, name: fc.name, response: { result: "ok" } }
                  }));
                }
              }
            }

            const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              const outCtx = audioContextRef.current?.output;
              if (!outCtx) return;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), outCtx, 24000, 1);
              const source = outCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outCtx.destination);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }

            if (msg.serverContent?.interrupted) {
              for (const s of sourcesRef.current) s.stop();
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => stopAssistant(),
          onerror: (e) => {
            console.error(e);
            stopAssistant();
          }
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setIsConnecting(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {isActive ? (
        <button
          onClick={stopAssistant}
          type="button"
          className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full font-semibold animate-pulse border border-red-200"
        >
          <MicOff className="w-4 h-4" />
          Selesaikan Voice Fill
        </button>
      ) : (
        <button
          onClick={startAssistant}
          disabled={isConnecting}
          type="button"
          className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-semibold hover:bg-blue-100 transition-colors border border-blue-100 disabled:opacity-50"
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Menghubungkan...
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              Isi Pakai Suara
            </>
          )}
        </button>
      )}
      {isActive && (
        <div className="flex items-center gap-2 text-xs text-blue-600 font-medium">
          <Volume2 className="w-3 h-3 animate-bounce" />
          Asisten sedang mendengarkan...
        </div>
      )}
    </div>
  );
};

export default VoiceAssistant;
