"use client";

import { useState, useEffect, useRef } from "react";
import type { JobModel, CompanyModel } from "../models/types";

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
    createdAt: string | Date;
};

interface JobChatProps {
    jobId: string;
    jobTitle: string;
}

export default function JobChat({ jobId, jobTitle }: JobChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (messagesEndRef.current && chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Load conversation history
        fetch(`/api/jobs/${jobId}/chat`)
            .then((res) => res.json())
            .then((data) => {
                if (data.messages) {
                    setMessages(data.messages);
                }
                setIsLoadingHistory(false);
            })
            .catch((error) => {
                console.error("Error loading chat history:", error);
                setIsLoadingHistory(false);
            });
    }, [jobId]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");
        setIsLoading(true);

        // Optimistically add user message
        const tempUserMessage: Message = {
            id: `temp-${Date.now()}`,
            role: "user",
            content: userMessage,
            createdAt: new Date(),
        };
        setMessages((prev) => [...prev, tempUserMessage]);

        try {
            const response = await fetch(`/api/jobs/${jobId}/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: userMessage }),
            });

            if (!response.ok) {
                throw new Error("Failed to send message");
            }

            const data = await response.json();

            // Remove temp message and add both user and assistant messages
            setMessages((prev) => {
                const withoutTemp = prev.filter((msg) => !msg.id.startsWith("temp"));
                return [
                    ...withoutTemp,
                    tempUserMessage,
                    {
                        id: data.message.id,
                        role: data.message.role,
                        content: data.message.content,
                        createdAt: data.message.createdAt,
                    },
                ];
            });
        } catch (error) {
            console.error("Error sending message:", error);
            // Remove temp message on error
            setMessages((prev) => prev.filter((msg) => !msg.id.startsWith("temp")));
            alert("Failed to send message. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoadingHistory) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-stone-300">Loading chat...</div>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col text-stone-200">
            <div className="border-b border-stone-600/50 p-4">
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 p-2.5 shadow-lg shadow-emerald-900/40">
                        <svg
                            className="h-5 w-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-stone-100">
                            Ask about {jobTitle}
                        </h3>
                        <p className="mt-1 text-sm text-stone-300">
                            Get answers about this position
                        </p>
                    </div>
                </div>
            </div>

            <div
                ref={chatContainerRef}
                className="flex-1 space-y-4 overflow-y-auto p-4"
            >
                {messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                        <p className="text-center text-stone-300">
                            No messages yet. Ask a question about this job to get started!
                        </p>
                    </div>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"
                                }`}
                        >
                            <div
                                className={`max-w-[80%] px-4 py-2 ${message.role === "user"
                                    ? "bg-stone-700/70 text-stone-50"
                                    : "bg-stone-600/50 text-stone-100"
                                    }`}
                            >
                                <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                                <p
                                    className={`mt-1 text-xs ${message.role === "user"
                                        ? "text-stone-300"
                                        : "text-stone-400"
                                        }`}
                                >
                                    {new Date(message.createdAt).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                            </div>
                        </div>
                    ))
                )}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-stone-600/50 px-4 py-2">
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1">
                                    <div className="h-2 w-2 animate-bounce rounded-full bg-stone-400 [animation-delay:-0.3s]"></div>
                                    <div className="h-2 w-2 animate-bounce rounded-full bg-stone-400 [animation-delay:-0.15s]"></div>
                                    <div className="h-2 w-2 animate-bounce rounded-full bg-stone-400"></div>
                                </div>
                                <span className="text-xs text-stone-300">
                                    Thinking...
                                </span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form
                onSubmit={sendMessage}
                className="border-t border-stone-600/50 p-4"
            >
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a question about this job..."
                        disabled={isLoading}
                        className="flex-1 border border-stone-600/50 bg-stone-700/50 px-4 py-2 text-sm text-stone-100 placeholder:text-stone-400 focus:border-stone-500/70 focus:outline-none focus:ring-1 focus:ring-stone-500/50 disabled:bg-stone-800/30 disabled:text-stone-500"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-md shadow-emerald-900/30 hover:shadow-lg hover:shadow-emerald-900/40 transition-all duration-200 rounded disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-md disabled:hover:shadow-emerald-900/30"
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
}

