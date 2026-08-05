import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  Loader2,
  SendHorizontal,
  Sparkles,
  TrendingUp,
  Boxes,
  Users,
  Wallet,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/formatCurrency";
import { toast } from "@/utils/notify";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {ChatMessage , Snapshot,ChatRole} from "../../../types/businessassistant.types"
const API_BASE = import.meta.env.VITE_API_URL||"";



const starterMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Ask about today's earnings, inventory status, customer dues, team health, investments, or how to improve profit. I answer from live business data.",
  },
];

const quickPrompts = [
  "Act as my AI CFO",
  "How much do I earn today?",
  "How long will my cash last?",
  "What stock should I buy?",
  "Predict stock shortages",
  "Find slow-moving inventory",
];

const metricCardClass =
  "rounded-2xl border border-white/10 bg-white/5 p-3 text-white/90 shadow-[0_18px_50px_rgba(15,23,42,0.22)]";

const formatValue = (value?: number, currency = false) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "0";
  return currency ? formatCurrency(value) : new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
};

const metricTiles = (snapshot?: Snapshot) => [
  {
    label: "Today revenue",
    value: formatValue(snapshot?.finance?.todayRevenue, true),
    icon: <TrendingUp className="h-4 w-4 text-emerald-300" />,
  },
  {
    label: "Inventory value",
    value: formatValue(snapshot?.inventory?.inventoryValue, true),
    icon: <Boxes className="h-4 w-4 text-amber-300" />,
  },
  {
    label: "Customer dues",
    value: formatValue(snapshot?.customers?.totalDueAmount, true),
    icon: <Wallet className="h-4 w-4 text-sky-300" />,
  },
  {
    label: "Team size",
    value: formatValue(snapshot?.employees?.totalEmployees),
    icon: <Users className="h-4 w-4 text-violet-300" />,
  },
];

// Distance (px) from the bottom of the scroll container within which
// we still consider the user "at the bottom" and safe to auto-scroll.
const AUTO_SCROLL_THRESHOLD = 80;

export function BusinessAssistant() {
  const [open, setOpen] = useState(false);
  const [loadingSnapshot, setLoadingSnapshot] = useState(false);
  const [sending, setSending] = useState(false);
  const sendingRef = useRef(false);
  const [streamStarted, setStreamStarted] = useState(false); // Track if streaming has begun
  const [input, setInput] = useState("");
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(starterMessages);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);

  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);
  // Direct ref to the native scrollable element -- no querySelector,
  // no dependency on Radix's internal viewport markup or mount timing.
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const shouldAutoScrollRef = useRef(true);
  const snapshotLoadedRef = useRef(false);

  const latestSnapshotLabel = useMemo(() => {
    if (!snapshot?.generatedAt) return "Waiting for live data";
    return `Updated ${new Date(snapshot.generatedAt).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })}`;
  }, [snapshot]);

  // Only auto-scroll to the bottom when the user is already near it.
  // This runs on every message update (including streamed chunks), but
  // it won't yank the view down if the user has scrolled up to read
  // earlier messages.
  useEffect(() => {
    if (shouldAutoScrollRef.current) {
      viewportRef.current?.scrollTo({
        top: viewportRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, open]);

  const handleViewportScroll = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const distanceFromBottom =
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
    const atBottom = distanceFromBottom < AUTO_SCROLL_THRESHOLD;
    shouldAutoScrollRef.current = atBottom;
    setShowJumpToLatest(!atBottom);
  };

  const jumpToLatest = () => {
    shouldAutoScrollRef.current = true;
    setShowJumpToLatest(false);
    viewportRef.current?.scrollTo({
      top: viewportRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  const loadSnapshot = async () => {
    if (snapshotLoadedRef.current) return;

    setLoadingSnapshot(true);
    try {
      const summaryResponse = await fetch(`${API_BASE}/api/insights/summary`, {
        method: "GET",
        credentials: "include",
      });

      if (!summaryResponse.ok) {
        throw new Error("Failed to load business snapshot");
      }

      const data = await summaryResponse.json();
      setSnapshot(data.snapshot || null);
      
      // Fetch chat history so messages persist even if they close the sidebar or refresh
      try {
        const historyResponse = await fetch(`${API_BASE}/api/insights/messages?limit=50`, {
          method: "GET",
          credentials: "include",
        });
        
        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          if (historyData.success && historyData.messages?.length > 0) {
            const formattedMessages = historyData.messages.map((m) => ({
              id: m._id || crypto.randomUUID(),
              role: m.role as ChatRole,
              content: m.content || "",
              createdAt: m.createdAt,
            }));
            setMessages([...starterMessages, ...formattedMessages]);
          } else {
            // Only reset to starter if we didn't already have messages
            setMessages((prev) => prev.length > starterMessages.length ? prev : starterMessages);
          }
        }
      } catch (err) {
        console.error("Failed to fetch history:", err);
      }

      snapshotLoadedRef.current = true;
    } catch (error) {
      toast.error("Unable to load business snapshot");
    } finally {
      setLoadingSnapshot(false);
    }
  };

  // Load the snapshot only when the sheet is opened.
  // Reset the "loaded" flag on close so reopening fetches fresh data.
  useEffect(() => {
    if (open) {
      shouldAutoScrollRef.current = true;
      setShowJumpToLatest(false);
      loadSnapshot();
    } else {
      snapshotLoadedRef.current = false;
    }
  }, [open]);

  const sendMessage = async (prompt?: string) => {
    const content = (prompt ?? input).trim();
    if (!content || sendingRef.current) return;

    sendingRef.current = true;
    setSending(true);
    // own message and the streaming reply are visible by default.
    shouldAutoScrollRef.current = true;
    setShowJumpToLatest(false);

    setInput("");
    const userMessageId = crypto.randomUUID();
    const assistantMessageId = crypto.randomUUID();

    setMessages((current) => [
      ...current,
      { id: userMessageId, role: "user", content },
    ]);

    // Add empty assistant message that will be streamed into
    setMessages((current) => [
      ...current,
      { id: assistantMessageId, role: "assistant", content: "" },
    ]);

    setSending(true);
    setStreamStarted(false); // Reset stream flag
    try {
      const response = await fetch(`${API_BASE}/api/insights/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: content }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate insight");
      }

      // Handle streaming response with typing effect
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      if (!reader) throw new Error("Response body is not readable");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "chunk") {
                // Mark stream as started once we receive first chunk
                if (!streamStarted) {
                  setStreamStarted(true);
                }

                // Add the chunk to the message
                setMessages((current) => {
                  const updated = [...current];
                  const lastMessage = updated[updated.length - 1];
                  if (lastMessage && lastMessage.role === "assistant") {
                    lastMessage.content += data.content;
                  }
                  return updated;
                });
              } else if (data.type === "complete") {
                // Stream finished, update snapshot
                setSnapshot(data.snapshot || snapshot);
                snapshotLoadedRef.current = true;
              } else if (data.type === "error") {
                toast.error(data.error || "Stream error");
              }
            } catch (parseError) {
              // Ignore JSON parse errors
            }
          }
        }
      }
    } catch (error) {
      toast.error("Chatbot could not reach business data");
      setMessages((current) => {
        const updated = [...current];
        const lastMessage = updated[updated.length - 1];
        if (lastMessage && lastMessage.role === "assistant") {
          lastMessage.content = "I could not load live business data just now. Please try again.";
        }
        return updated;
      });
    } finally {
      sendingRef.current = false;
      setSending(false);
      setStreamStarted(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className=" z-[60] h-10 rounded-full bg-slate-950 px-2 text-white shadow-[0_20px_60px_rgba(15,23,42,0.35)] hover:bg-slate-800">
          <Bot className="h-5 w-5" />
          Ask AI
          <Sparkles className="h-4 w-4 text-amber-300" />
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full overflow-hidden border-slate-800 bg-slate-950 p-0 text-white sm:max-w-2xl">
        <div className="flex h-full flex-col bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_34%),radial-gradient(circle_at_90%_10%,_rgba(168,85,247,0.12),_transparent_28%),linear-gradient(180deg,#020617_0%,#0f172a_100%)]">
          <SheetHeader className="border-b border-white/10 px-6 py-2 text-left">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-300">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                  Live business assistant
                </div>
                {/* <SheetTitle className="text-2xl font-semibold tracking-tight text-white">Ask the numbers</SheetTitle> */}
              </div>
            </div>
          </SheetHeader>

          <div className="relative flex-1 overflow-hidden px-2 py-2 sm:px-3">
            {/* Plain native scroll container -- we own scrollTop directly via
                viewportRef, so there's no dependency on Radix's internal
                viewport element or mount timing. */}
            <div
              ref={viewportRef}
              onScroll={handleViewportScroll}
              className="h-full overflow-y-auto pr-3 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.15)_transparent]"
            >
              <div className="space-y-4 pb-6">
                {messages.map((message) => {
                  const isLastAssistant =
                    message.role === "assistant" &&
                    message.id === messages[messages.length - 1]?.id;
                  const isStreaming = sending && streamStarted && isLastAssistant;

                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "max-w-[92%] rounded-3xl px-4 py-3 text-sm leading-6 shadow-sm transition-all duration-300",
                        message.role === "user"
                          ? "ml-auto bg-sky-500 text-white"
                          : "bg-white/6 border border-white/10 text-slate-100"
                      )}
                    >
                      <div className="relative">
                        <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:p-0">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              table: ({node, ...props}) => <div className="overflow-x-auto my-4"><table className="w-full text-left border-collapse border border-slate-700" {...props} /></div>,
                              th: ({node, ...props}) => <th className="border border-slate-700 px-4 py-2 bg-slate-800 font-semibold" {...props} />,
                              td: ({node, ...props}) => <td className="border border-slate-700 px-4 py-2" {...props} />
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                        {isStreaming && (
                          <span className="inline-block h-4 w-1.5 animate-pulse bg-amber-300 align-text-bottom ml-0.5 rounded-sm" />
                        )}
                      </div>
                    </div>
                  );
                })}

                {sending && !streamStarted && (
                  <div className="max-w-[92%] rounded-3xl border border-white/10 bg-white/5 px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
                        <Sparkles className="h-4 w-4 animate-pulse text-amber-300" />
                      </div>
                      <div className="flex flex-col">
                        {/* <span className="text-xs font-medium text-slate-200">
                          Analyzing live data...
                        </span> */}
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={scrollAnchorRef} />
              </div>
            </div>

            {showJumpToLatest && (
              <Button
                type="button"
                onClick={jumpToLatest}
                className="absolute bottom-4 left-1/2 z-10 h-9 -translate-x-1/2 rounded-full border border-white/10 bg-slate-900/90 px-4 text-xs text-white shadow-[0_10px_30px_rgba(15,23,42,0.4)] hover:bg-slate-800"
              >
                <ArrowDown className="mr-1.5 h-3.5 w-3.5" />
                Jump to latest
              </Button>
            )}
          </div>

          <div className="border-t border-white/10 bg-slate-950/70 px-4 py-4 backdrop-blur sm:px-6">
            <div className="mb-3 flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <Button
                  key={prompt}
                  type="button"
                  variant="outline"
                  className="h-auto rounded-full border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200 hover:bg-white/10 hover:text-white"
                  onClick={() => void sendMessage(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>

            <div className="space-y-3">
              <Textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
                placeholder="Ask a question like: How much do I earn today?"
                className="min-h-[92px] resize-none border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus-visible:ring-emerald-400"
              />
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] text-slate-400">
                  Answers are generated from your live company data, not generic guesses.
                </p>
                <Button
                  onClick={() => void sendMessage()}
                  disabled={sending || !input.trim()}
                  className="rounded-full bg-white px-4 text-slate-950 hover:bg-slate-200"
                >
                  <SendHorizontal className="h-4 w-4" />
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
