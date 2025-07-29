'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { validateSQLSchema, type ValidationResult } from "@/lib/schema-validator";
import { generateSQLQuery } from "@/lib/gemini";
import { 
  saveChatSession, 
  getUserChatSessions, 
  deleteChatSession,
  checkUserAccess,
  incrementQueryUsage,
  type ChatMessage,
  type ChatSession,
  type UserAccess
} from "@/lib/database";
import SubscriptionStatus from "@/components/SubscriptionStatus";
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [schema, setSchema] = useState('');
  const [isSchemaLocked, setIsSchemaLocked] = useState(false);
  const [schemaValidation, setSchemaValidation] = useState<ValidationResult | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState<{[key: string]: boolean}>({});
  const [subscriptionData, setSubscriptionData] = useState<UserAccess | null>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  // Redirect to home if not authenticated and load user data
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      window.location.href = '/';
    } else if (isLoaded && user) {
      loadUserData();
    }
  }, [isLoaded, isSignedIn, user]);

  // Validate schema whenever it changes
  useEffect(() => {
    if (schema.trim()) {
      const validation = validateSQLSchema(schema);
      setSchemaValidation(validation);
    } else {
      setSchemaValidation(null);
    }
  }, [schema]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatHistory, isLoading]);

  // Load user's saved data
  const loadUserData = async () => {
    if (!user) return;

    try {
      console.log('👤 Loading data for user:', user.id);
      
      // Check subscription status first
      const accessData = await checkUserAccess(user.id);
      setSubscriptionData(accessData);
      
      // If user doesn't have access, redirect to pricing
      if (!accessData.has_access) {
        console.log('🚫 User access denied, redirecting to pricing');
        router.push('/#pricing');
        return;
      }

      // Load user's chat sessions
      const { data: sessions, error } = await getUserChatSessions(user.id);
      
      if (error) {
        console.error('❌ Database error:', error);
        // Still set empty array to prevent infinite loading
        setChatSessions([]);
      } else {
        console.log('✅ Loaded sessions:', sessions.length);
        setChatSessions(sessions);
      }
    } catch (error) {
      console.error('❌ Error loading user data:', error);
      setChatSessions([]);
    }
  };

  const handleAccessDenied = () => {
    router.push('/#pricing');
  };

  const handleSchemaLock = () => {
    if (!schema.trim()) return;
    
    // Validate schema before locking
    const validation = validateSQLSchema(schema);
    if (!validation.isValid) {
      alert(`Cannot lock schema due to validation errors:\n${validation.errors.join('\n')}`);
      return;
    }

    setIsSchemaLocked(true);
  };

  const handleSchemaUnlock = () => {
    setIsSchemaLocked(false);
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion.trim() || !isSchemaLocked || !user || !schema.trim()) return;

    // Check if user can use more queries
    const canUseQuery = await incrementQueryUsage(user.id);
    if (!canUseQuery) {
      alert('You have reached your query limit. Please upgrade your plan to continue.');
      router.push('/#pricing');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🚀 Generating SQL query with Gemini...');
      const { sqlQuery, explanation } = await generateSQLQuery(currentQuestion, schema);
      
      const response: ChatMessage = {
        id: Date.now().toString(),
        question: currentQuestion,
        sqlQuery,
        explanation,
        timestamp: new Date()
      };

      const newChatHistory = [...chatHistory, response];
      setChatHistory(newChatHistory);
      
      // Update or create session
      if (currentSessionId) {
        // Update existing session
        const updatedSession = {
          id: currentSessionId,
          title: chatSessions.find(s => s.id === currentSessionId)?.title || currentQuestion.slice(0, 50) + (currentQuestion.length > 50 ? '...' : ''),
          messages: newChatHistory,
          timestamp: new Date(),
          schema_content: schema,
          is_schema_locked: isSchemaLocked
        };
        
        // Save to database
        await saveChatSession(updatedSession, user.id);
        
        setChatSessions(prev => prev.map(session => 
          session.id === currentSessionId 
            ? { ...session, messages: newChatHistory }
            : session
        ));
      } else {
        // Create new session
        const newSession = {
          id: Date.now().toString(),
          title: currentQuestion.slice(0, 50) + (currentQuestion.length > 50 ? '...' : ''),
          messages: newChatHistory,
          timestamp: new Date(),
          schema_content: schema,
          is_schema_locked: isSchemaLocked
        };
        
        // Save to database
        await saveChatSession(newSession, user.id);
        
        const newSessionWithUserId: ChatSession = {
          ...newSession,
          user_id: user.id
        };
        
        setChatSessions(prev => [newSessionWithUserId, ...prev]);
        setCurrentSessionId(newSession.id);
      }
      
      setCurrentQuestion('');
    } catch (error: any) {
      console.error('❌ Error generating SQL:', error);
      // Add error message to chat
      const errorResponse: ChatMessage = {
        id: Date.now().toString(),
        question: currentQuestion,
        sqlQuery: '-- Error generating SQL query',
        explanation: `Sorry, I encountered an error: ${error.message || 'Unknown error'}. Please try again or rephrase your question.`,
        timestamp: new Date()
      };
      setChatHistory(prev => [...prev, errorResponse]);
      setCurrentQuestion('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySQL = async (sqlQuery: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(sqlQuery);
      setCopySuccess(prev => ({ ...prev, [messageId]: true }));
      setTimeout(() => {
        setCopySuccess(prev => ({ ...prev, [messageId]: false }));
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };



  const startNewChat = () => {
    setChatHistory([]);
    setCurrentSessionId(null);
    setCurrentQuestion('');
    setSchema('');
    setIsSchemaLocked(false);
    setSchemaValidation(null);
    setIsSidebarOpen(false);
  };

  const loadChatSession = (session: ChatSession) => {
    setChatHistory(session.messages);
    setCurrentSessionId(session.id);
    const sessionSchema = session.schema_content || '';
    setSchema(sessionSchema);
    setIsSchemaLocked(session.is_schema_locked || false);
    
    // Validate the loaded schema
    if (sessionSchema.trim()) {
      const validation = validateSQLSchema(sessionSchema);
      setSchemaValidation(validation);
    } else {
      setSchemaValidation(null);
    }
    
    setIsSidebarOpen(false);
  };

  const handleDeleteChatSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    try {
      await deleteChatSession(sessionId, user.id);
      setChatSessions(prev => prev.filter(session => session.id !== sessionId));
      
      // If we're deleting the current session, clear the chat
      if (currentSessionId === sessionId) {
        setChatHistory([]);
        setCurrentSessionId(null);
      }
    } catch (error) {
      console.error('Error deleting chat session:', error);
    }
  };

  const handleSchemaChange = (newSchema: string) => {
    setSchema(newSchema);
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#212121]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#10a37f] border-t-transparent"></div>
      </div>
    );
  }

  if (!isSignedIn || !user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex h-screen bg-[#212121] text-white overflow-hidden">
      {/* Modern Collapsible Sidebar */}
      <div className={`${isSidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-[#171717] border-r border-[#2f2f2f] flex flex-col overflow-hidden`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#2f2f2f]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#10a37f] flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 12a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <h2 className="text-sm font-medium text-white">SqlGPT</h2>
            </div>
            <Button 
              onClick={() => setIsSidebarOpen(false)}
              variant="ghost" 
              size="sm"
              className="p-1.5 hover:bg-[#2f2f2f] text-[#9ca3af] hover:text-white rounded-md"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </Button>
          </div>
          <Button 
            onClick={startNewChat}
            className="w-full bg-transparent border border-[#4f4f4f] hover:bg-[#2f2f2f] text-white rounded-md text-sm py-2 font-normal transition-all duration-200"
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 4v16m8-8H4"/>
              </svg>
              <span>New chat</span>
            </div>
          </Button>
        </div>
        
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-2">
          {chatSessions.length === 0 ? (
            <div className="text-center text-[#9ca3af] mt-8">
              <p className="text-xs">No conversations yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {chatSessions.map((session) => (
                <div
                  key={session.id}
                  className={`w-full text-left p-2 rounded-md hover:bg-[#2f2f2f] transition-all duration-200 group cursor-pointer ${
                    currentSessionId === session.id ? 'bg-[#2f2f2f]' : ''
                  }`}
                  onClick={() => loadChatSession(session)}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-3 h-3 text-[#9ca3af] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                    </svg>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-[#f5f5f5] truncate font-normal">
                        {session.title}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteChatSession(session.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#4f4f4f] text-[#9ca3af] hover:text-[#f5f5f5] transition-all duration-200"
                      title="Delete conversation"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subscription Status */}
        {subscriptionData && (
          <div className="p-2 border-t border-[#2f2f2f]">
            <SubscriptionStatus onAccessDenied={handleAccessDenied} />
          </div>
        )}

        {/* User Profile & Logout */}
        <div className="p-2 border-t border-[#2f2f2f]">
          <div className="flex items-center gap-2 p-2 rounded-md hover:bg-[#2f2f2f] cursor-pointer">
            <img 
              src={user.imageUrl || 'https://via.placeholder.com/24'} 
              alt={user.fullName || user.firstName || 'User'}
              className="w-6 h-6 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-normal text-white truncate">{user.fullName || user.firstName || user.emailAddresses[0]?.emailAddress}</p>
            </div>
            <Button
              onClick={() => signOut()}
              variant="ghost"
              size="sm"
              className="p-1 hover:bg-[#4f4f4f] text-[#9ca3af] hover:text-white rounded-sm"
              title="Logout"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 17v-3H9v-4h7V7l5 5-5 5M14 2a2 2 0 012 2v2h-2V4H5v16h9v-2h2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V4a2 2 0 012-2h9z"/>
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Schema Panel - 30% */}
      <div className="w-[30%] border-r border-[#2f2f2f] bg-[#171717] flex flex-col">
        {/* Schema Header */}
        <div className="p-3 border-b border-[#2f2f2f]">
          <div className="flex items-center justify-between mb-4">
            <Button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              variant="ghost" 
              size="sm"
              className="p-2 hover:bg-[#2f2f2f] text-[#9ca3af] hover:text-white rounded-md"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
              </svg>
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-3">
            <Button 
              onClick={handleSchemaLock}
              disabled={!schema.trim() || isSchemaLocked || (schemaValidation?.isValid === false)}
              size="sm"
              className="bg-[#10a37f] hover:bg-[#0d8f70] text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-xs font-normal py-1.5 transition-all duration-200"
            >
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z"/>
              </svg>
              Lock
            </Button>
            <Button 
              onClick={handleSchemaUnlock}
              disabled={!isSchemaLocked}
              size="sm"
              variant="outline"
              className="border-[#4f4f4f] text-white hover:bg-[#2f2f2f] hover:border-[#6f6f6f] disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-xs font-normal py-1.5 transition-all duration-200"
            >
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h2c0-1.66 1.34-3 3-3s3 1.34 3 3v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z"/>
              </svg>
              Unlock
            </Button>
          </div>



          {/* Schema Validation Feedback */}
          {schemaValidation && (
            <div className="mb-3 space-y-2">
              {schemaValidation.errors.length > 0 && (
                <div className="px-2 py-1.5 bg-red-500/10 border border-red-500/20 rounded-md">
                  <div className="flex items-center gap-1 text-red-400 text-xs mb-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    Errors
                  </div>
                  {schemaValidation.errors.map((error, index) => (
                    <div key={index} className="text-xs text-red-300 ml-4">• {error}</div>
                  ))}
                </div>
              )}
              
              {schemaValidation.isValid && schemaValidation.errors.length === 0 && (
                <div className="px-2 py-1.5 bg-green-500/10 border border-green-500/20 rounded-md">
                  <div className="flex items-center gap-1 text-green-400 text-xs">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Valid schema
                  </div>
                </div>
              )}
            </div>
          )}
          
          {isSchemaLocked && (
            <div className="mt-3 px-2 py-1.5 bg-green-500/10 border border-green-500/20 rounded-md">
              <div className="flex items-center gap-1 text-green-400 text-xs">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Schema locked
              </div>
            </div>
          )}
        </div>
        
        {/* Schema Input */}
        <div className="flex-1 p-3">
          <div className="h-full">
            <Textarea
              value={schema}
              onChange={(e) => handleSchemaChange(e.target.value)}
              readOnly={isSchemaLocked}
              placeholder="Paste your SQL schema here..."
              className={`h-full bg-[#212121] border-[#4f4f4f] text-white placeholder:text-[#9ca3af] font-mono text-xs resize-none focus:border-[#10a37f] focus:ring-1 focus:ring-[#10a37f]/50 rounded-md transition-all duration-200 ${
                isSchemaLocked ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            />
          </div>
        </div>
      </div>

      {/* Chat Panel - 70% */}
      <div className="w-[70%] flex flex-col bg-[#212121]">
        {/* Chat Messages */}
        <div ref={chatMessagesRef} className="flex-1 overflow-y-auto scroll-smooth">
          {chatHistory.length === 0 ? (
            <div className="flex items-center justify-center h-full p-4">
              <div className="text-center max-w-md">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-[#10a37f] flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2 text-white">Ready to Query Your Database</h3>
                <p className="text-[#9ca3af] text-sm leading-relaxed">
                  {isSchemaLocked 
                    ? "Ask questions about your database in natural language and get SQL queries instantly." 
                    : "Please lock your schema first to start asking questions about your database."
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4">
              <div className="max-w-none space-y-6">
                {chatHistory.map((message, index) => (
                  <div key={message.id} className="space-y-4">
                    {/* User Question */}
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-md bg-[#565869] flex-shrink-0 flex items-center justify-center">
                        <span className="text-white text-xs font-medium">U</span>
                      </div>
                      <div className="flex-1">
                        <div className="bg-[#2f2f2f] rounded-lg p-3">
                          <p className="text-white text-base leading-relaxed">{message.question}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* AI Response */}
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-md bg-[#10a37f] flex-shrink-0 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 12a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                        </svg>
                      </div>
                      <div className="flex-1 space-y-3">
                        {/* SQL Query Block */}
                        <div className="bg-[#171717] border border-[#4f4f4f] rounded-lg overflow-hidden">
                          <div className="px-3 py-2 bg-[#2f2f2f] border-b border-[#4f4f4f] flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <svg className="w-3 h-3 text-[#10a37f]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
                              </svg>
                              <span className="text-sm font-medium text-white">SQL Query</span>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-[#9ca3af] hover:text-white hover:bg-[#4f4f4f] h-6 px-2"
                              onClick={() => handleCopySQL(message.sqlQuery, message.id)}
                              title={copySuccess[message.id] ? "Copied!" : "Copy SQL"}
                            >
                              {copySuccess[message.id] ? (
                                <svg className="w-3 h-3 text-[#10a37f]" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                              ) : (
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                                </svg>
                              )}
                            </Button>
                          </div>
                          <div className="p-3">
                            <pre className="text-[#10a37f] text-sm font-mono leading-relaxed overflow-x-auto">
                              <code>{message.sqlQuery}</code>
                            </pre>
                          </div>
                        </div>
                        
                        {/* Explanation Block */}
                        <div className="bg-[#171717] border border-[#4f4f4f] rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="w-3 h-3 text-[#9ca3af]" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                            <span className="text-sm font-medium text-white">Explanation</span>
                          </div>
                          <p className="text-[#9ca3af] text-sm leading-relaxed">{message.explanation}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Loading State */}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-md bg-[#10a37f] flex-shrink-0 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 12a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-[#9ca3af]">
                        <div className="animate-spin rounded-full h-3 w-3 border border-[#10a37f] border-t-transparent"></div>
                        <span className="text-sm">Generating SQL query...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-[#2f2f2f] bg-[#171717] p-4">
          <form onSubmit={handleQuestionSubmit} className="max-w-none">
            <div className="relative">
              <Textarea
                value={currentQuestion}
                onChange={(e) => setCurrentQuestion(e.target.value)}
                placeholder="Message SqlGPT..."
                disabled={!isSchemaLocked || isLoading}
                className="w-full bg-[#212121] border-[#4f4f4f] text-white placeholder:text-[#9ca3af] focus:border-[#10a37f] focus:ring-1 focus:ring-[#10a37f]/50 rounded-lg min-h-[80px] resize-none pr-12 text-base leading-relaxed transition-all duration-200"
                rows={4}
              />
              <div className="absolute bottom-2 right-2">
                {isLoading ? (
                  <div className="flex items-center gap-2 text-[#9ca3af]">
                    <div className="animate-spin rounded-full h-3 w-3 border border-[#10a37f] border-t-transparent"></div>
                  </div>
                ) : (
                  <Button 
                    type="submit"
                    disabled={!currentQuestion.trim() || !isSchemaLocked}
                    size="sm"
                    className="bg-[#10a37f] hover:bg-[#0d8f70] text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-md p-2 transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 