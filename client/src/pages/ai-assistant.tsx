import { useState, useRef, useEffect } from "react";
import { SendIcon, User, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

// Types for messages
type MessageType = "user" | "assistant";

interface Message {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
}

// Example suggested questions
const suggestedQuestions = [
  "How can I improve my study habits?",
  "What's the best way to prepare for my upcoming exams?",
  "Can you recommend a study schedule for my courses?",
  "How much time should I spend studying each day?",
  "What are effective note-taking techniques?",
  "How can I stay motivated during long study sessions?"
];

const AIAssistant = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "assistant",
      content: "Hi there! I'm Neura, your AI study assistant. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Focus input when component loads
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      // Simulate AI response delay
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: "This is a placeholder response. The AI functionality will be implemented in the future. I'd be happy to help with your study plans once I'm fully operational!",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsTyping(false);
      }, 1500);

      // In the future, this would be replaced with a real API call
      // const response = await apiRequest("POST", "/api/ai/chat", { message: inputValue });
      // const data = await response.json();
      // setMessages(prev => [...prev, { id: Date.now() + 1, type: "assistant", content: data.response, timestamp: new Date() }]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get a response from Neura. Please try again later.",
        variant: "destructive",
      });
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <div className="flex flex-col space-y-4 h-[calc(100vh-120px)]">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Neura AI Assistant</h1>
          <p className="text-muted-foreground">
            Your personal AI study companion to help optimize your learning experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
          {/* Suggested Questions Sidebar */}
          <Card className="col-span-1 hidden md:block">
            <CardHeader>
              <CardTitle>Suggested Questions</CardTitle>
              <CardDescription>
                Click on any question to ask Neura
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-2">
                {suggestedQuestions.map((question, index) => (
                  <Button 
                    key={index} 
                    variant="outline" 
                    className="justify-start text-left h-auto py-2" 
                    onClick={() => handleSuggestedQuestion(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="col-span-1 md:col-span-3 flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/neura-avatar.png" alt="Neura" />
                  <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
                </Avatar>
                <span>Chat with Neura</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-hidden pb-0">
              <ScrollArea className="h-[calc(100vh-300px)] pr-4">
                <div className="flex flex-col space-y-4">
                  {messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] px-4 py-2 rounded-lg ${
                          message.type === 'user' 
                            ? 'bg-primary text-primary-foreground ml-auto' 
                            : 'bg-muted'
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-muted px-4 py-2 rounded-lg max-w-[80%] flex items-center space-x-1">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-0"></div>
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-150"></div>
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-300"></div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>
            
            <CardFooter className="pt-4">
              <div className="flex w-full items-center space-x-2">
                <Textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Neura anything about studying..."
                  className="flex-1 resize-none"
                  rows={2}
                />
                <Button 
                  size="icon" 
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                >
                  <SendIcon className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Mobile Suggested Questions */}
        <div className="md:hidden">
          <ScrollArea className="whitespace-nowrap rounded-lg border">
            <div className="flex w-max space-x-2 p-2">
              {suggestedQuestions.map((question, index) => (
                <Button 
                  key={index} 
                  variant="outline" 
                  className="text-sm"
                  onClick={() => handleSuggestedQuestion(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;