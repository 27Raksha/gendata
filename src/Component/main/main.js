import React, { useState, useEffect } from "react";
import axios from "axios";
import { MessageSquare, Plus, Trash } from "lucide-react";

export const ChatInterface = () => {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [responses, setResponses] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedResponseIndex, setSelectedResponseIndex] = useState(null);
  const [showNewConversationButton, setShowNewConversationButton] = useState(false);

  const backendURL = "https://gendata-spbs.onrender.com";

  useEffect(() => {
    document.title = "GEN DATA";
    const fetchPrompts = async () => {
      try {
        setIsThinking(true);
        const response = await axios.get(`${backendURL}/prompts`);
        setPrompts(response.data.prompts); 
      } catch (error) {
        console.error("Error fetching prompts:", error);
      } finally {
        setIsThinking(false);
      }
    };
    fetchPrompts();
  }, []);

  const handleSendQuery = async () => {
    if (!query.trim()) return;

    setMessages([...messages, { text: query, type: "user" }]);
    setQuery("");
    setIsThinking(true);
    setShowPrompts(true);

    try {
      // setIsThinking(true);
      const response = await axios.get(`${backendURL}/prompts`);
      setPrompts(response.data.prompts); 
    } catch (error) {
      console.error("Error fetching prompts:", error);
    } finally {
      setIsThinking(true);
    }
  
  };

  const handleAddPrompt = () => {
    setPrompts([...prompts, { _id: null, content: "" }]); 
  };

  const handleSaveNewPrompt = async (index) => {
    try {
      const content = prompts[index].content;
      if (!content.trim()) return;

      setIsThinking(true);
      const response = await axios.post(`${backendURL}/prompts`, { content });
      const savedPrompt = response.data.prompt;

      const updatedPrompts = [...prompts];
      updatedPrompts[index] = savedPrompt; 
      setPrompts(updatedPrompts);
    } catch (error) {
      console.error("Error saving new prompt:", error);
    } finally {
      setIsThinking(false);
    }
  };

  const handleDeletePromptBackend = async (index) => {
    try {
      const promptId = prompts[index]._id; 
      if (!promptId) throw new Error("Prompt ID not found");

      await axios.delete(`${backendURL}/prompts/${promptId}`);
      setPrompts(prompts.filter((_, i) => i !== index)); 
    } catch (error) {
      console.error("Error deleting prompt:", error);
    }
  };

  const handleUpdatePrompt = async (index) => {
    try {
      const promptId = prompts[index]._id; 
      const updatedContent = prompts[index].content;
      if (!promptId || !updatedContent.trim()) throw new Error("Invalid data");

      await axios.put(`${backendURL}/prompts/${promptId}`, {
        content: updatedContent,
      });
      alert("Prompt updated successfully!");
    } catch (error) {
      console.error("Error updating prompt:", error);
    }
  };

  const handlePromptChange = (index, value) => {
    const updatedPrompts = [...prompts];
    updatedPrompts[index].content = value; 
    setPrompts(updatedPrompts);
  };

  const handleGetResponses = async () => {
    if (prompts.length === 0) {
      alert("Please add at least one prompt!");
      return;
    }

    try {
      const response = await axios.post(`${backendURL}/start`, {
        user_input: messages[messages.length - 1]?.text,
        system_prompts: prompts.map((prompt) => prompt.content), 
      });

      setResponses(response.data.responses);
      setIsThinking(false);
    } catch (error) {
      console.error("Error fetching responses:", error);
      setIsThinking(false);
    }
  };

  const handleResponseSelect = async (response, index) => {
    try {
      await axios.post(`${backendURL}/select`, { selected_index: index });

      setMessages([...messages, { text: response, type: "bot" }]);
      setResponses([]);
      setPrompts([]);
      setShowPrompts(false);
      setShowOptions(true);
    } catch (error) {
      console.error("Error selecting response:", error);
    }
  };

  const handleContinue = async () => {
    try {
      await axios.post(`${backendURL}/continue`);
      setMessages([
        ...messages,
        { text: "You can ask another query.", type: "info" },
      ]);
      setShowOptions(false);
    } catch (error) {
      console.error("Error hitting continue API:", error);
    }
  };

  const handleDone = async () => {
    try {
      await axios.post(`${backendURL}/stop`);
      setMessages([
        ...messages,
        { text: "Thank you! Have a nice day.", type: "info" },
      ]);
      setShowOptions(false);
      setShowNewConversationButton(true);
    } catch (error) {
      console.error("Error hitting stop API:", error);
    }
  };
  const handleNewConversation = () => {
    setMessages([]); 
    setResponses([]); 
    setPrompts([]); 
    setQuery(""); 
    setShowPrompts(false); 
    setShowOptions(false);
    setIsThinking(false);
    setSelectedResponseIndex(null); 
    setShowNewConversationButton(false);
  };
  
  return (
    <div className="flex justify-center w-full min-h-screen bg-gray-100 text-sm">
      <div className="w-full max-w-3xl relative bg-gray-100">
        
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-2 border-b">
          <div className="flex items-center space-x-1">
            <MessageSquare className="h-5 w-5" />
            <span className="text-lg font-medium">GEN DATA</span>
          </div>
        </div>
  
        {/* Messages Container */}
        <div className="overflow-y-auto h-[calc(100vh-140px)] p-2 space-y-2 pb-16">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.type === "user"
                  ? "justify-start"
                  : message.type === "bot"
                  ? "justify-end"
                  : "justify-center"
              }`}
            >
              <div
                className={`${
                  message.type === "user"
                    ? "bg-blue-500 text-white"
                    : message.type === "bot"
                    ? "bg-gray-200"
                    : "bg-green-100 text-green-700"
                } rounded-lg py-1 px-3 max-w-[85%] text-sm`}
              >
                {message.text}
              </div>
            </div>
          ))}
          {isThinking && (
            <div className="flex justify-end">
              <div className="bg-gray-200 rounded-lg py-1 px-3 max-w-[85%] text-sm">
                Thinking...
              </div>
            </div>
          )}
  
          {/* Prompts */}
          {showPrompts && (
            <div className="px-2 py-3">
              <h2 className="text-lg font-semibold mb-2">System Prompts</h2>
              {prompts.map((prompt, index) => (
                <div key={prompt._id || index} className="flex items-center mb-2">
                  <input
                    type="text"
                    className="flex-1 p-1 text-sm border border-gray-300 rounded-md  break-words text-wrap"
                    value={prompt.content}
                    onChange={(e) => handlePromptChange(index, e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleSaveNewPrompt(index)
                    }
                    placeholder="Type a prompt..."
                  />
                  {prompt._id && (
                    <button
                      className="ml-1 text-blue-500 text-xs"
                      onClick={() => handleUpdatePrompt(index)}
                    >
                      Update
                    </button>
                  )}
                  <button
                    className="ml-1 text-red-500 text-xs"
                    onClick={() => handleDeletePromptBackend(index)}
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                className="flex items-center space-x-1 text-blue-500 mt-2 text-xs"
                onClick={handleAddPrompt}
              >
                <Plus className="h-4 w-4" />
                <span>Add Prompt</span>
              </button>
              <button
                className="mt-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-md inline-block"
                onClick={handleGetResponses}
              >
                Get Response
              </button>
            </div>
          )}
  
          {/* Responses */}
          {responses.length > 0 && (
            <div className="px-2 py-3">
              <h2 className="text-lg font-semibold mb-2">Response Options</h2>
              <form className="space-y-2">
                {responses.map((response, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-2 border rounded-md ${
                      selectedResponseIndex === index
                        ? "bg-blue-100 border-blue-400"
                        : "border-gray-300"
                    }`}
                    onClick={() => setSelectedResponseIndex(index)}
                  >
                    <label
                      htmlFor={`response-${index}`}
                      className="text-xs text-gray-700 cursor-pointer flex-grow"
                    >
                      {response}
                    </label>
                    <input
                      type="radio"
                      id={`response-${index}`}
                      name="response"
                      value={index}
                      className="w-4 h-4 text-blue-500 cursor-pointer"
                      checked={selectedResponseIndex === index}
                      onChange={() => setSelectedResponseIndex(index)}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded-md inline-block"
                  onClick={() =>
                    handleResponseSelect(
                      responses[selectedResponseIndex],
                      selectedResponseIndex
                    )
                  }
                  disabled={selectedResponseIndex === null}
                >
                  Select
                </button>
              </form>
            </div>
          )}
  
          {/* Options */}
          {showOptions && (
            <div className="flex justify-center space-x-2 mt-2">
              <button
                className="px-4 py-1 bg-blue-500 text-white text-xs rounded-md"
                onClick={handleContinue}
              >
                Continue
              </button>
              <button
                className="px-4 py-1 bg-red-500 text-white text-xs rounded-md"
                onClick={handleDone}
              >
                Done
              </button>
            </div>
          )}
          {showNewConversationButton && (
            <div className="flex justify-center mt-2">
              <button
                className="px-4 py-1 bg-green-500 text-white text-xs rounded-md"
                onClick={handleNewConversation}
              >
                Start New Conversation
              </button>
            </div>
          )}
        </div>
  
        {/* Input Box */}
        <div className="fixed bottom-0 w-full max-w-3xl bg-white border-t">
          <div className="p-2">
            <div className="flex items-center bg-gray-50 rounded-full px-2 py-1">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 bg-transparent outline-none text-xs"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendQuery()}
              />
              <button className="ml-2 text-gray-500" onClick={handleSendQuery}>
                <MessageSquare className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}  