import { useState, useRef, useEffect } from "react";
import { Play, Pause, XIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface VoiceMessageProps {
  audioUrl: string;
  duration: number;
  removeVoice: any;
}

export const VoiceThumbnails = ({
  audioUrl,
  duration,
  removeVoice,
}: VoiceMessageProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [audioDuration, setAudioDuration] = useState<number>(duration);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const handleLoadedMetadata = () => setAudioDuration(audio.duration);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    generateWaveform(audioUrl);

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);

  const generateWaveform = async (url: string) => {
    try {
      const audioContext = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const rawData = audioBuffer.getChannelData(0);
      const samples = 50;
      const blockSize = Math.floor(rawData.length / samples);
      const filteredData = [];

      for (let i = 0; i < samples; i++) {
        let blockStart = blockSize * i;
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(rawData[blockStart + j]);
        }
        filteredData.push(sum / blockSize);
      }

      const multiplier = Math.pow(Math.max(...filteredData), -1);
      const normalizedData = filteredData.map((n) => n * multiplier);

      setWaveformData(normalizedData);
      audioContext.close();
    } catch (error) {
      setWaveformData(Array.from({ length: 50 }, () => Math.random()));
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const totalDuration = audioDuration || duration;
  const playedPercentage = totalDuration
    ? (currentTime / totalDuration) * 100
    : 0;

  return (
    <div className="flex flex-col gap-1">
      <div
        className={cn(
          "group flex items-center gap-2 p-2 rounded-lg max-w-md border relative"
        )}
      >
        <Button
          size="icon"
          variant="ghost"
          onClick={togglePlayPause}
          className={cn(
            "h-9 w-9 rounded-full flex-shrink-0 bg-primary-500 hover:bg-blue-200 text-white"
          )}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4 fill-current text-white" />
          ) : (
            <Play className="h-4 w-4 fill-current ml-0.5 text-white" />
          )}
        </Button>

        <div className="relative flex-1 min-w-0 flex items-center gap-2">
          <div className="flex items-center gap-[2px] h-8 flex-1">
            {waveformData.map((value, index) => {
              const barPercentage = (index / waveformData.length) * 100;
              const isPlayed = barPercentage <= playedPercentage;
              const height = Math.max(4, value * 24);

              return (
                <div
                  key={index}
                  className={cn(
                    "w-0.5 rounded-full transition-colors",
                    isPlayed ? "bg-primary-500" : "bg-muted-foreground/30"
                  )}
                  style={{ height: `${height}px` }}
                />
              );
            })}
          </div>

          <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
            {isPlaying ? formatTime(currentTime) : formatTime(totalDuration)}
          </span>
        </div>

        <button
          type="button"
          aria-label="Remove voice message"
          onClick={removeVoice}
          className="absolute -top-2 -right-2 p-1 bg-gray-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
        >
          <XIcon size={14} />
        </button>
      </div>
    </div>
  );
};
