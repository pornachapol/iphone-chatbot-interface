"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Package,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Target,
  Clock,
  Activity,
} from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeSanitize from "rehype-sanitize"

interface Message {
  role: "user" | "assistant"
  content: string
  sql?: string
  data?: any[]
  timestamp: Date
}

interface QuestionItem {
  text: string
  icon?: string
}

interface CategoryData {
  id: string
  title: string
  icon: React.ComponentType<any>
  gradient: string
  questions: QuestionItem[]
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [expandedSql, setExpandedSql] = useState<Set<number>>(new Set())
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  )
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const categories: CategoryData[] = [
    {
      id: "demand",
      title: "Registrations (Contract Demands)",
      icon: BarChart3,
      gradient: "from-blue-500 to-cyan-500",
      questions: [
        { text: "มีลูกค้าลงทะเบียนรอทำสัญญา iPhone กี่คน" },
        { text: "iPhone รุ่นใดมีลูกค้ารอทำสัญญามากที่สุด" },
        { text: "สาขาใดมีลูกค้าลงทะเบียนมากที่สุด" },
        { text: "iPhone 17 Series มีลูกค้ารอกี่คน" },
        { text: "การกระจายตัวของ Demand ตาม Region" },
        { text: "Demand เฉลี่ยต่อวันในเดือนนี้" },
        { text: "สัปดาห์ใดมี Demand สูงสุด" },
        { text: "เปรียบเทียบ Demand ปีนี้กับปีก่อน" },
      ],
    },
    {
      id: "supply",
      title: "Inventory (Stock)",
      icon: Package,
      gradient: "from-emerald-500 to-teal-500",
      questions: [
        { text: "มีสต็อค iPhone พร้อมส่งมอบกี่เครื่อง" },
        { text: "สาขาใดมีสต็อคต่ำกว่าเกณฑ์" },
        { text: "การกระจายสต็อคระหว่างคลังกับสาขา" },
        { text: "สต็อค iPhone แต่ละรุ่นที่พร้อมส่งมอบ" },
        { text: "สต็อคเฉลี่ยต่อสาขา" },
        { text: "รุ่นใดมีสต็อคเกินความต้องการ" },
        { text: "สาขาใดต้องเติมสต็อคด่วน" },
        { text: "มูลค่าสต็อค iPhone ทั้งหมด" },
      ],
    },
    {
      id: "performance",
      title: "Customer Contracts (Performance)",
      icon: TrendingUp,
      gradient: "from-purple-500 to-pink-500",
      questions: [
        { text: "Conversion Rate: Registration → Contract" },
        { text: "จำนวนสัญญาที่ทำได้เดือนนี้" },
        { text: "รายได้จากสัญญา iPhone เดือนนี้" },
        { text: "iPhone รุ่นใดทำสัญญาได้มากที่สุด" },
        { text: "Average Contract Value" },
        { text: "Branch Performance Ranking" },
      ],
    },
    {
      id: "cross",
      title: "Cross-Category Analysis",
      icon: Target,
      gradient: "from-orange-500 to-amber-500",
      questions: [
        { text: "รุ่นใดมี Demand สูงแต่ Stock ต่ำ - Gap Analysis" },
        { text: "สาขาใดมีลูกค้ารอเยอะแต่สต็อคไม่พอ" },
        { text: "Demand vs Supply Ratio รายรุ่น" },
        { text: "สต็อคคงเหลือเทียบกับลูกค้ารอซื้อ" },
        { text: "Conversion Rate เทียบกับ Stock Availability" },
        { text: "รุ่นใดควร Order เพิ่มตาม Demand" },
        { text: "ประสิทธิภาพการจับคู่ Demand-Supply" },
        { text: "Lost Sales จากสต็อคไม่เพียงพอ" },
      ],
    },
  ]

  const handleSendMessage = async (question: string) => {
    if (!question.trim() || isLoading) return

    const userMessage: Message = { role: "user", content: question, timestamp: new Date() }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("https://iphone-chatbot-i7j6.onrender.com/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      })

      const result = await response.json()

      const assistantMessage: Message = {
        role: "assistant",
        content: result.answer || "ไม่สามารถประมวลผลคำถามได้",
        sql: result.sql,
        data: result.data,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error fetching response:", error)
      const errorMessage: Message = {
        role: "assistant",
        content: "เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSendMessage(input)
  }

  const toggleSql = (index: number) => {
    setExpandedSql((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  const clearConversation = () => {
    setMessages([])
    setExpandedSql(new Set())
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <aside className="fixed left-0 top-0 flex h-screen w-80 flex-col border-r border-white/10 bg-slate-950/50 backdrop-blur-xl">
        {/* Header */}
        <div className="border-b border-white/10 px-6 py-6">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/30">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-balance text-lg font-bold text-transparent">
                iContract Analytics
              </h1>
              <p className="text-pretty text-xs text-slate-400">AI-Powered Insights</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-3">
            {categories.map((category) => {
              const Icon = category.icon
              const isExpanded = expandedCategories.has(category.id)

              return (
                <div
                  key={category.id}
                  className="overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:bg-white/10"
                >
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="flex w-full items-center justify-between p-4 text-left transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${category.gradient}`}
                      >
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{category.title}</h3>
                        <p className="text-xs text-slate-400">{category.questions.length} questions</p>
                      </div>
                    </div>
                    <ChevronRight
                      className={`h-4 w-4 text-slate-400 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                    />
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="space-y-1.5 px-3 pb-3">
                      {category.questions.map((question, index) => (
                        <button
                          key={index}
                          onClick={() => handleSendMessage(question.text)}
                          className="group flex w-full items-center gap-2 rounded-lg bg-white/5 px-3 py-2.5 text-left text-xs text-slate-300 transition-all hover:bg-white/10 hover:text-white hover:shadow-lg"
                        >
                          <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-500 transition-all group-hover:bg-blue-400" />
                          <span className="flex-1 leading-snug">{question.text}</span>
                          <ArrowRight className="h-3 w-3 shrink-0 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="border-t border-white/10 bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Data Connection</span>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                <span className="font-semibold text-emerald-400">Live</span>
              </div>
            </div>
            <div className="text-xs text-slate-500">Powered by Gemini 2.5 Flash</div>
          </div>
        </div>
      </aside>

      <div className="ml-80 flex min-h-screen flex-1 flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/50 backdrop-blur-xl">
          <div className="mx-auto max-w-5xl px-8 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-balance text-xl font-bold text-white">AI-Powered Contract Analytics</h1>
                <p className="mt-0.5 text-pretty text-sm text-slate-400">
                  Real-time insights for iPhone contract business
                </p>
              </div>
              <div className="flex items-center gap-3">
                {messages.length > 0 && (
                  <Button
                    onClick={clearConversation}
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-white"
                  >
                    Clear Chat
                  </Button>
                )}
                <Badge className="animate-pulse border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-500/20">
                  <Activity className="mr-1.5 h-3 w-3" />
                  Live Data
                </Badge>
              </div>
            </div>
          </div>
        </header>

        <main className="flex flex-1 flex-col overflow-hidden">
          <div className="mx-auto w-full max-w-5xl flex-1 overflow-y-auto px-8 py-8">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-8 py-16">
                <div className="relative">
                  <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 blur-3xl" />
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-2xl shadow-purple-500/50">
                    <Sparkles className="h-12 w-12 text-white" />
                  </div>
                </div>
                <div className="text-center">
                  <h2 className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-balance text-3xl font-bold text-transparent">
                    AI-Powered Contract Analytics
                  </h2>
                  <p className="mt-3 text-pretty text-lg text-slate-300">วิเคราะห์ข้อมูลธุรกิจ iPhone Contract ด้วย AI</p>
                  <p className="mt-2 text-pretty text-sm text-slate-500">เลือกคำถามจาก Sidebar หรือพิมพ์คำถามของคุณเอง</p>
                </div>

                <div className="mt-8 grid w-full max-w-3xl gap-4 sm:grid-cols-2">
                  {[
                    { q: "มีลูกค้ารอทำสัญญากี่คน", icon: BarChart3, color: "blue" },
                    { q: "สต็อค iPhone พร้อมส่งมอบกี่เครื่อง", icon: Package, color: "emerald" },
                    { q: "Conversion Rate ทำสัญญา", icon: TrendingUp, color: "purple" },
                    { q: "รุ่นใดมี Demand สูงแต่ Stock ต่ำ", icon: Target, color: "orange" },
                  ].map((item, index) => {
                    const Icon = item.icon
                    return (
                      <Card
                        key={index}
                        onClick={() => handleSendMessage(item.q)}
                        className="group cursor-pointer border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:scale-105 hover:border-white/20 hover:bg-white/10 hover:shadow-2xl hover:shadow-blue-500/20"
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 shadow-lg shadow-${item.color}-500/30`}
                          >
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-pretty font-medium leading-snug text-white">{item.q}</p>
                            <div className="mt-2 flex items-center gap-1 text-xs text-slate-400 group-hover:text-blue-400">
                              <span>Ask now</span>
                              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                            </div>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`flex max-w-[85%] flex-col gap-3 ${message.role === "user" ? "items-end" : "items-start"}`}
                    >
                      {/* Message bubble */}
                      <div
                        className={`rounded-2xl px-6 py-4 shadow-xl ${
                          message.role === "user"
                            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-500/30"
                            : "border border-white/10 bg-white/5 text-slate-100 backdrop-blur-xl"
                        }`}
                      >
                        {message.role === "user" ? (
                          <p className="text-pretty leading-relaxed">{message.content}</p>
                        ) : (
                          <div
                            className="prose prose-invert prose-sm max-w-none
                                        prose-headings:text-slate-100 
                                        prose-strong:text-blue-400 
                                        prose-strong:font-semibold
                                        prose-p:text-slate-300 
                                        prose-p:leading-relaxed
                                        prose-p:mb-3
                                        prose-ul:list-disc 
                                        prose-ul:ml-6 
                                        prose-ul:my-3
                                        prose-ul:space-y-1
                                        prose-li:text-slate-300
                                        prose-code:bg-slate-900 
                                        prose-code:px-2 
                                        prose-code:py-1 
                                        prose-code:rounded 
                                        prose-code:text-sm
                                        prose-code:text-blue-300
                                        prose-code:before:content-none
                                        prose-code:after:content-none"
                          >
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              rehypePlugins={[rehypeSanitize]}
                              components={{
                                p: ({ node, children }) => <p className="mb-3 last:mb-0">{children}</p>,
                                ul: ({ node, children }) => <ul className="my-3 space-y-1">{children}</ul>,
                                strong: ({ node, children }) => (
                                  <strong className="font-semibold text-blue-400">{children}</strong>
                                ),
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        )}
                        <div className="mt-2 flex items-center gap-2 text-xs opacity-70">
                          <Clock className="h-3 w-3" />
                          <span>{message.timestamp.toLocaleTimeString("th-TH")}</span>
                        </div>
                      </div>

                      {message.sql && (
                        <div className="w-full space-y-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSql(index)}
                            className="h-7 text-xs text-slate-400 hover:text-white"
                          >
                            {expandedSql.has(index) ? (
                              <>
                                <ChevronDown className="mr-1 h-3 w-3" />
                                Hide SQL Query
                              </>
                            ) : (
                              <>
                                <ChevronRight className="mr-1 h-3 w-3" />
                                Show SQL Query
                              </>
                            )}
                          </Button>
                          {expandedSql.has(index) && (
                            <Card className="overflow-hidden border-white/10 bg-slate-950 p-4 shadow-2xl backdrop-blur-xl">
                              <pre className="overflow-x-auto text-xs leading-relaxed text-emerald-400">
                                <code>{message.sql}</code>
                              </pre>
                            </Card>
                          )}
                        </div>
                      )}

                      {message.data && message.data.length > 0 && (
                        <Card className="w-full overflow-hidden border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="border-b border-white/10 bg-white/5">
                                <tr>
                                  {Object.keys(message.data[0]).map((key) => (
                                    <th key={key} className="px-4 py-3 text-left font-semibold text-slate-300">
                                      {key}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {message.data.map((row, rowIndex) => (
                                  <tr
                                    key={rowIndex}
                                    className="border-b border-white/5 last:border-0 transition-colors hover:bg-white/5"
                                  >
                                    {Object.values(row).map((value, cellIndex) => (
                                      <td key={cellIndex} className="px-4 py-3 text-slate-200">
                                        {String(value)}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </Card>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 shadow-xl backdrop-blur-xl">
                      <div className="flex items-center gap-3 text-slate-300">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                        <p className="text-sm">กำลังวิเคราะห์ข้อมูล...</p>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="sticky bottom-0 border-t border-white/10 bg-slate-950/50 backdrop-blur-xl">
            <div className="mx-auto max-w-5xl px-8 py-6">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50 blur transition-opacity group-focus-within:opacity-100" />
                  <div className="relative flex gap-3 rounded-2xl border border-white/20 bg-slate-900/90 p-2 backdrop-blur-xl">
                    <div className="relative flex-1">
                      <Sparkles className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask anything about iPhone contract business..."
                        disabled={isLoading}
                        className="h-12 border-0 bg-transparent pl-12 pr-4 text-white placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className="h-12 bg-gradient-to-r from-blue-500 to-purple-600 px-8 font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          Analyze
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                  <span>Secure & Private</span>
                  <span>•</span>
                  <span>Real-time Analytics</span>
                  <span>•</span>
                  <span>Powered by AI</span>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
