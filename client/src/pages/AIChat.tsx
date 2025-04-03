import React, { useState, useRef, useEffect } from 'react';
import { BrainCircuit, Send, User, Bot, ChevronDown, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface Message {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      content: 'Hallo! Ich bin dein IHK-Prüfungs-Assistent. Stelle mir Fragen zu IT-Themen, und ich werde dir helfen.',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scrollt zum Ende der Nachrichtenliste
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    // Nachricht des Benutzers hinzufügen
    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    try {
      // KI-Antwort generieren
      const response = await generateAIResponse(inputMessage);
      
      // KI-Nachricht hinzufügen
      const aiMessage: Message = {
        role: 'ai',
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Fehler bei der KI-Anfrage:', error);
      toast({
        title: 'Fehler',
        description: 'Es gab ein Problem bei der Kommunikation mit der KI.',
        variant: 'destructive',
      });
      
      // Fehlernachricht anzeigen
      const errorMessage: Message = {
        role: 'ai',
        content: 'Entschuldigung, ich konnte deine Anfrage nicht verarbeiten. Bitte versuche es später noch einmal.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const generateAIResponse = async (userQuery: string): Promise<string> => {
    try {
      // API-Anfrage senden
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userQuery }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
        
        // Check for Gemini API related errors
        if (errorMessage.includes('API key') || errorMessage.includes('GEMINI_API_KEY')) {
          throw new Error('Der Google Gemini API-Schlüssel wurde nicht konfiguriert. Bitte wende dich an den Administrator.');
        } else if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
          throw new Error('Das API-Limit wurde erreicht. Bitte versuche es später noch einmal.');
        } else {
          throw new Error(`Fehler: ${errorMessage}`);
        }
      }
      
      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Fehler bei der KI-Generierung:', error);
      throw error;
    }
  };
  
  const formatTimestamp = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const clearChat = () => {
    setMessages([
      {
        role: 'ai',
        content: 'Hallo! Ich bin dein IHK-Prüfungs-Assistent. Stelle mir Fragen zu IT-Themen, und ich werde dir helfen.',
        timestamp: new Date()
      }
    ]);
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-neutral-900 mb-2 flex items-center gap-2">
        <BrainCircuit className="h-8 w-8 text-primary" /> KI-Lernassistent
      </h1>
      <p className="text-lg text-neutral-600 mb-8">
        Stelle deine Fragen zur IHK-Prüfung und erhalte Hilfestellung
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          <Card className="h-[calc(100vh-250px)] flex flex-col">
            <CardHeader className="p-4 border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5 text-primary" /> IHK-Assistent
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={clearChat} title="Chat zurücksetzen">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="flex-grow p-0 relative">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {messages.map((message, index) => (
                    <div 
                      key={index} 
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === 'user' 
                            ? 'bg-primary text-white' 
                            : 'bg-neutral-100 text-neutral-800'
                        }`}
                      >
                        <div className="flex items-center mb-1">
                          {message.role === 'user' ? (
                            <>
                              <span className="text-xs opacity-75">
                                {formatTimestamp(message.timestamp)}
                              </span>
                              <span className="ml-2 font-medium text-sm flex items-center">
                                Du <User className="h-3 w-3 ml-1" />
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="font-medium text-sm flex items-center">
                                <Bot className="h-3 w-3 mr-1" /> Assistent
                              </span>
                              <span className="ml-2 text-xs opacity-75">
                                {formatTimestamp(message.timestamp)}
                              </span>
                            </>
                          )}
                        </div>
                        <div className="whitespace-pre-wrap text-sm">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-lg p-3 bg-neutral-100">
                        <div className="flex items-center mb-1">
                          <span className="font-medium text-sm flex items-center">
                            <Bot className="h-3 w-3 mr-1" /> Assistent
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
                          <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>
            
            <CardFooter className="p-4 border-t">
              <div className="w-full flex space-x-2">
                <Textarea 
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Stelle eine Frage zu IHK-Prüfungsthemen..."
                  className="min-h-10 flex-grow"
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!inputMessage.trim() || isLoading}
                  className="shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
        
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hilfreiche Themen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div 
                className="p-2 border rounded hover:border-primary hover:bg-primary/5 cursor-pointer transition-colors"
                onClick={() => setInputMessage('Was sind wichtige OOP-Konzepte für die IHK-Prüfung?')}
              >
                <div className="text-sm font-medium">OOP-Konzepte</div>
                <div className="text-xs text-neutral-500">Vererbung, Kapselung, Polymorphie</div>
              </div>
              
              <div 
                className="p-2 border rounded hover:border-primary hover:bg-primary/5 cursor-pointer transition-colors"
                onClick={() => setInputMessage('Erkläre die wichtigsten SQL-Befehle mit Beispielen.')}
              >
                <div className="text-sm font-medium">SQL-Grundlagen</div>
                <div className="text-xs text-neutral-500">SELECT, INSERT, UPDATE, DELETE</div>
              </div>
              
              <div 
                className="p-2 border rounded hover:border-primary hover:bg-primary/5 cursor-pointer transition-colors"
                onClick={() => setInputMessage('Was sind die ACID-Eigenschaften bei Datenbanken?')}
              >
                <div className="text-sm font-medium">Datenbank-Eigenschaften</div>
                <div className="text-xs text-neutral-500">ACID, Normalisierung, Indices</div>
              </div>
              
              <div 
                className="p-2 border rounded hover:border-primary hover:bg-primary/5 cursor-pointer transition-colors"
                onClick={() => setInputMessage('Erkläre die wichtigsten Design Patterns mit einfachen Beispielen.')}
              >
                <div className="text-sm font-medium">Design Patterns</div>
                <div className="text-xs text-neutral-500">Singleton, Factory, Observer</div>
              </div>
              
              <div 
                className="p-2 border rounded hover:border-primary hover:bg-primary/5 cursor-pointer transition-colors"
                onClick={() => setInputMessage('Wie bereite ich mich am besten auf die IHK-Prüfung vor?')}
              >
                <div className="text-sm font-medium">Prüfungsvorbereitung</div>
                <div className="text-xs text-neutral-500">Tipps und Strategien</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIChat;