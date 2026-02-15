"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket";
import { getSpeciesEmoji } from "@/lib/utils";
import { useToast } from "@/components/Toast";

interface MessageData {
  _id: string;
  sender: {
    _id: string;
    displayName: string;
    avatar: string;
  };
  content: string;
  read: boolean;
  createdAt: string;
}

interface MatchUser {
  _id: string;
  displayName: string;
  avatar: string;
  fursona: { name: string; species: string };
  online: boolean;
}

export default function ChatPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState<MatchUser | null>(null);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showUnmatch, setShowUnmatch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userId = (session?.user as { id: string })?.id;
  const { toast } = useToast();

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat/${id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch {
      // Polling errors are non-critical
    }
  }, [id]);

  const fetchMatchInfo = useCallback(async () => {
    try {
      const res = await fetch("/api/matches");
      if (res.ok) {
        const matches = await res.json();
        const match = matches.find(
          (m: { _id: string }) => m._id === id
        );
        if (match) {
          const other = match.users.find(
            (u: MatchUser) => u._id !== userId
          );
          setOtherUser(other || null);
        }
      }
    } catch {
      // non-critical
    }
  }, [id, userId]);

  // Socket.io integration
  useEffect(() => {
    if (!userId || !id) return;

    const socket = getSocket();
    if (!socket.connected) {
      socket.connect();
      socket.emit("register", userId);
    }
    socket.emit("join-chat", id);

    socket.on("new-message", (message: MessageData) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) return prev;
        return [...prev, message];
      });
    });

    socket.on("user-typing", () => {
      setIsTyping(true);
    });

    socket.on("user-stop-typing", () => {
      setIsTyping(false);
    });

    return () => {
      socket.emit("leave-chat", id);
      socket.off("new-message");
      socket.off("user-typing");
      socket.off("user-stop-typing");
    };
  }, [userId, id]);

  useEffect(() => {
    fetchMessages();
    fetchMatchInfo();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [fetchMessages, fetchMatchInfo]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleTyping = () => {
    const socket = getSocket();
    if (socket.connected) {
      socket.emit("typing", { matchId: id, userId });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stop-typing", { matchId: id, userId });
      }, 2000);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const socket = getSocket();
    if (socket.connected) {
      socket.emit("stop-typing", { matchId: id, userId });
    }

    try {
      const res = await fetch(`/api/chat/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage.trim() }),
      });

      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        setNewMessage("");

        if (socket.connected) {
          socket.emit("send-message", { matchId: id, message: msg });
        }
      } else {
        toast("Failed to send message", "error");
      }
    } catch {
      toast("Network error", "error");
    } finally {
      setSending(false);
    }
  };

  const handleUnmatch = async () => {
    try {
      const res = await fetch(`/api/matches/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast("Unmatched", "info");
        router.push("/matches");
      } else {
        toast("Failed to unmatch", "error");
      }
    } catch {
      toast("Network error", "error");
    }
    setShowUnmatch(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-9rem)]">
      {/* Chat header */}
      <div className="flex items-center gap-3 py-3 border-b border-border">
        <button
          onClick={() => router.push("/matches")}
          className="text-foreground/60 hover:text-foreground transition-colors"
          aria-label="Back to matches"
        >
          {"\u2190"}
        </button>
        {otherUser && (
          <>
            <div className="w-10 h-10 rounded-full bg-neon-purple/20 flex items-center justify-center text-lg" aria-hidden="true">
              {getSpeciesEmoji(otherUser.fursona.species)}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm">{otherUser.displayName}</h3>
              <p className="text-xs text-foreground/40">
                {isTyping ? (
                  <span className="text-neon-purple">typing...</span>
                ) : otherUser.online ? (
                  <span className="text-success">Online</span>
                ) : (
                  "Offline"
                )}
              </p>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowUnmatch(!showUnmatch)}
                className="text-foreground/40 hover:text-foreground/60 transition-colors p-1"
                aria-label="Chat options"
                aria-expanded={showUnmatch}
              >
                {"\u22EE"}
              </button>
              {showUnmatch && (
                <div className="absolute right-0 top-full mt-1 bg-surface border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                  <button
                    onClick={handleUnmatch}
                    className="px-4 py-2.5 text-sm text-danger hover:bg-danger/10 transition-colors whitespace-nowrap"
                  >
                    Unmatch
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3" role="log" aria-label="Chat messages" aria-live="polite">
        {messages.length === 0 && (
          <div className="text-center py-10">
            <div className="text-4xl mb-3" aria-hidden="true">{"\u{1F4AC}"}</div>
            <p className="text-foreground/40 text-sm">
              Start the conversation! Say something nice.
            </p>
          </div>
        )}
        {messages.map((msg) => {
          const isMine = msg.sender._id === userId;
          return (
            <div
              key={msg._id}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                  isMine
                    ? "gradient-bg text-white rounded-br-sm"
                    : "bg-surface border border-border text-foreground rounded-bl-sm"
                }`}
              >
                <p>{msg.content}</p>
                <div className={`flex items-center gap-1 mt-1 ${isMine ? "justify-end" : ""}`}>
                  <span
                    className={`text-[10px] ${
                      isMine ? "text-white/50" : "text-foreground/30"
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {isMine && (
                    <span className={`text-[10px] ${msg.read ? "text-neon-blue" : "text-white/30"}`} aria-label={msg.read ? "Read" : "Sent"}>
                      {msg.read ? "\u2713\u2713" : "\u2713"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-surface border border-border rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1" aria-label="User is typing">
                <div className="w-2 h-2 rounded-full bg-foreground/30 animate-bounce [animation-delay:0ms]" />
                <div className="w-2 h-2 rounded-full bg-foreground/30 animate-bounce [animation-delay:150ms]" />
                <div className="w-2 h-2 rounded-full bg-foreground/30 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="flex gap-2 py-3 border-t border-border">
        <label htmlFor="chat-input" className="sr-only">Type a message</label>
        <input
          id="chat-input"
          ref={inputRef}
          type="text"
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping();
          }}
          placeholder="Type a message..."
          className="flex-1 bg-surface border border-border rounded-full px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-neon-purple transition-colors"
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          aria-label="Send message"
          className="gradient-bg text-white w-10 h-10 rounded-full flex items-center justify-center glow-button disabled:opacity-50"
        >
          <span aria-hidden="true">{"\u27A4"}</span>
        </button>
      </form>
    </div>
  );
}
