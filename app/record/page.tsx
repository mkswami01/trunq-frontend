"use client";
import { sendVoiceNote } from "@/utils/api";
import { useState } from "react";
import RecordButton from "@/app/components/RecordButton";
import { MessageCard } from "@/app/components/MessageCard";

type Message = {
  role: "user" | "assistant";
  filename?: string;
  text: string;
  timestamp: string;
  intent?: string;
  tags?: string[];
  status: "pushed" | "retrieved";
  results?: Array<{
    text: string;
    intent?: string;
    tags?: string[];
    timestamp?: string;
  }>;
};

export default function Record() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );

  const [messages, setMessages] = useState<Message[]>([]);

  // Helper function to format timestamps
  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const startRecording = async () => {
    setError(null); // Clear any previous errors
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlog = new Blob(chunks, { type: "audio/webm" });
        await processTheRecordings(audioBlog);
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start recording", err);
      setError("Microphone access denied. Please allow microphone permissions.");
    }
  };

  const processTheRecordings = async (audioBlog: Blob) => {
    setIsProcessing(true);
    try {
      const result = await sendVoiceNote(audioBlog, "/add-voice");

      if(result.status === "pushed") {
        const notes = result.notes[0];
        const userMessage: Message = {
          role: "user",
          filename: notes.audio_filename,
          text: notes.formatted_content || notes.transcription, // Use formatted content if available
          timestamp: notes.uploaded_at,
          intent: notes.metadata.intent,
          tags: notes.metadata.tags,
          status: "pushed",
        };
        console.log("Adding message:", userMessage); // Debug log
        setMessages((prev) => [...prev, userMessage]);

      } else if (result.status === "retrieved") {
        // Create ONE message with question + all results nested
        const queryMessage: Message = {
          role: "user",
          text: result.transcription,
          timestamp: new Date().toISOString(),
          intent: "question",
          tags: [],
          status: "retrieved",
          results: result.notes.map((note: any) => ({
            text: note.text,
            intent: note.intent,
            tags: note.tags,
            timestamp: note.timestamp
          }))
        };

        setMessages((prev) => [...prev, queryMessage]);
      }
    } catch (error) {
      console.error("Failed to process recording:", error);
      setError("Failed to process your recording. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const stopRecording = () => {
    try {
      if (mediaRecorder) {
        mediaRecorder.stop();
        const tracks = mediaRecorder.stream.getTracks();
        tracks.forEach((t) => t.stop());
        setMediaRecorder(null);
      }
    } finally {
      setIsRecording(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-8">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">🎙️ Trunq</h1>
        <p className="text-gray-400 text-sm">Voice notes with AI memory</p>
      </div>

      <div className="max-w-2xl mx-auto pb-32">
        {/* Error display */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-red-400 text-lg">⚠️</span>
              <p className="text-red-200 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 text-xs mt-2 hover:text-red-300"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Empty state */}
        {messages.length === 0 && !isProcessing && !error && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎤</div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              Ready to capture your thoughts
            </h2>
            <p className="text-gray-400 mb-4">
              Press the button below to record a note or ask a question
            </p>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 max-w-md mx-auto text-left">
              <p className="text-gray-300 text-sm mb-2">✨ Try saying:</p>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>• "Remind me to call mom tomorrow"</li>
                <li>• "I need to buy groceries"</li>
                <li>• "What do I need to do today?"</li>
              </ul>
            </div>
          </div>
        )}

        {/* Message display area */}
        {messages.map((message, index) => (
          <MessageCard
            key={index}
            text={message.text}
            intent={message.intent || ""}
            tags={message.tags || []}
            timestamp={formatTimestamp(message.timestamp)}
            status={message.status}
            results={message.results}
          />
        ))}

        {/* Loading indicator */}
        {isProcessing && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-4 text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <p className="text-gray-400 text-sm mt-3">Processing your recording...</p>
          </div>
        )}
      </div>

      {/* Button fixed at bottom center */}
      <div className="fixed bottom-8 left-1/2 transform">
        <RecordButton
          isRecording={isRecording}
          onStart={startRecording}
          onStop={stopRecording}
        />
      </div>
    </div>
  );
}
