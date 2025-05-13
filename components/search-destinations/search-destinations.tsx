"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Mic, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useRef } from "react";
import { Destination } from "@prisma/client";
import DestinationItem from "./destination-item";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { ChevronDown, Mic as MicIcon } from "lucide-react";

const SearchDestinations = () => {
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [searchResults, setSearchResults] = useState<Destination[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [currentDeviceLabel, setCurrentDeviceLabel] = useState<string | null>(null);

  React.useEffect(() => {
    // Fetch available audio input devices
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter((d) => d.kind === "audioinput");
        setDevices(audioInputs);
        if (audioInputs.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(audioInputs[0].deviceId);
        }
      } catch (err) {
        setRecordingError("Failed to enumerate audio devices");
      }
    };
    getDevices();
  }, []);

  React.useEffect(() => {
    // Update current device label
    if (devices.length > 0 && selectedDeviceId) {
      const device = devices.find((d) => d.deviceId === selectedDeviceId);
      setCurrentDeviceLabel(device ? device.label : null);
    }
  }, [devices, selectedDeviceId]);

  const startRecording = async () => {
    try {
      setRecordingError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : true
      });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsTranscribing(true);
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const formData = new FormData();
        formData.append("audio", audioBlob);
        formData.append("language", "en");

        try {
          const response = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Transcription failed");
          }

          const data = await response.json();
          if (data.transcript) {
            setInputValue(data.transcript);
            // Automatically trigger search after successful transcription
            handleSearch(new Event('submit') as any);
          } else {
            setRecordingError("No speech detected. Please try again.");
          }
        } catch (error) {
          console.error("Error transcribing audio:", error);
          setRecordingError(error instanceof Error ? error.message : "Failed to transcribe audio");
        } finally {
          setIsTranscribing(false);
          // Stop all audio tracks
          stream.getTracks().forEach((track) => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setRecordingError("Failed to access microphone. Please check your permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: inputValue.trim(),
          limit: 10,
        }),
      });

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      setSearchResults(data.results);
    } catch (error) {
      console.error("Error searching:", error);
      setSearchError("Failed to perform search. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };
  return (
    <>
      <form onSubmit={handleSearch}>
        <Card className="w-full mb-6">
          <CardHeader>
            <CardTitle>Travel Search</CardTitle>
            <CardDescription>
              Find your next adventure with our intelligent search
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                type="text"
                placeholder="Search destinations..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Button type="submit" disabled={isSearching || isTranscribing}>
                {isSearching ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Search
              </Button>
              <div className="relative flex items-center">
                <Button
                  variant="outline"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={isRecording ? "bg-red-500 hover:bg-red-600 rounded-r-none" : "rounded-r-none"}
                  type="button"
                  disabled={isTranscribing}
                  style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                  aria-label={isRecording ? "Stop recording" : "Start recording"}
                >
                  {isTranscribing ? (
                    <Loader2 className="h-4 w-4" />
                  ) : (
                    <MicIcon className="h-4 w-4" />
                  )}
                </Button>
                <TooltipProvider>
                  <Popover>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-l-none border-l-0"
                            type="button"
                            aria-label="Select microphone"
                            disabled={isRecording || isTranscribing}
                            tabIndex={0}
                            style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                      </TooltipTrigger>
                      <TooltipContent side="top" align="center">
                        Select microphone
                      </TooltipContent>
                    </Tooltip>
                    <PopoverContent className="max-w-xs w-72 p-2">
                      <div className="flex flex-col gap-1">
                        {devices.length === 0 && (
                          <span className="text-xs text-muted-foreground">No microphones found</span>
                        )}
                        {devices.map(device => (
                          <Tooltip key={device.deviceId}>
                            <TooltipTrigger asChild>
                              <Button
                                variant={selectedDeviceId === device.deviceId ? "secondary" : "ghost"}
                                size="sm"
                                className="justify-start w-full truncate text-left"
                                onClick={() => setSelectedDeviceId(device.deviceId)}
                                disabled={isRecording || isTranscribing}
                              >
                                <span className="truncate block w-full">{device.label || `Microphone (${device.deviceId})`}</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right" align="center">
                              {device.label || `Microphone (${device.deviceId})`}
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </TooltipProvider>
              </div>
            </div>
            {recordingError && (
              <p className="text-sm text-red-500 mt-2">{recordingError}</p>
            )}
            {isRecording && (
              <p className="text-sm text-muted-foreground mt-2">
                Recording... Click the microphone button to stop
              </p>
            )}
            {isTranscribing && (
              <p className="text-sm text-muted-foreground mt-2">
                Transcribing your speech...
              </p>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <p className="text-sm text-muted-foreground">
              Try voice search or explore trending destinations
            </p>
            <Link
              href="/api/ping"
              className="text-sm text-blue-500 hover:underline"
            >
              API Status
            </Link>
          </CardFooter>
        </Card>
      </form>

      {searchError && (
        <Card className="w-full mb-6 border-red-500">
          <CardContent className="pt-6">
            <p className="text-red-500">{searchError}</p>
          </CardContent>
        </Card>
      )}

      {searchResults.length > 0 && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <CardDescription>
              Found {searchResults.length} destinations matching your search
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {searchResults.map((destination) => (
                <DestinationItem
                  key={destination.id}
                  destination={destination}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default SearchDestinations;
