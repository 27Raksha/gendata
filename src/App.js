import React, { useState, useEffect } from "react";
import axios from "axios";
import { MessageSquare, Plus, Trash } from "lucide-react";

const ChatInterface = () => {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [responses, setResponses] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedResponseIndex, setSelectedResponseIndex] = useState(null);

  const backendURL = "http://127.0.0.1:5000";

  useEffect(() => {
    document.title = "GEN DATA";
    const fetchPrompts = async () => {
      try {
        setIsThinking(true);
        const response = await axios.get(`${backendURL}/prompts`);
        setPrompts(response.data.prompts.map((prompt) => prompt.content));
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
      const response = await axios.get(`${backendURL}/prompts`);
      const fetchedPrompts = response.data.prompts || [];
      setPrompts(fetchedPrompts.map((prompt) => prompt.content));
      
    } catch (error) {
      console.error("Error fetching prompts:", error);
    } finally {
      setIsThinking(true);
    }
  };

  const handleAddPrompt = () => {
    setPrompts([...prompts, ""]); 
  };

  const handleSaveNewPrompt = async (index) => {
    try {
      const content = prompts[index];
      if (!content.trim()) return;

      
      setIsThinking(true); 
      const response = await axios.post(`${backendURL}/prompts`, { content });
      const savedPrompt = response.data.prompt.content;

      
      const updatedPrompts = [...prompts];
      updatedPrompts[index] = savedPrompt;
      setPrompts(updatedPrompts);

      
      await handleGetResponses();
    } catch (error) {
      console.error("Error saving new prompt:", error);
    }
  };

  const handleDeletePromptBackend = async (index) => {
    try {
      const promptId = index + 1; 
      await axios.delete(`${backendURL}/prompts/${promptId}`);
      setPrompts(prompts.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error deleting prompt:", error);
    }
  };

  const handleUpdatePrompt = async (index) => {
    try {
      const promptId = index + 1; 
      const updatedContent = prompts[index];
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
    updatedPrompts[index] = value;
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
        system_prompts: prompts,
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
    } catch (error) {
      console.error("Error hitting stop API:", error);
    }
  };

  return (
    <div className="flex justify-center w-full min-h-screen bg-gray-70 text-xl">
      <div className="w-[80%] relative bg-gray-70">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-8 border-b">
          <div className="flex items-center space-x-4">
            <MessageSquare className="h-10 w-10" />
            <span className="text-3xl font-medium">GEN DATA</span>
          </div>
        </div>

        
        <div className="overflow-y-auto h-[calc(100vh-160px)] p-6 space-y-6 pb-36">
          
          <div className="space-y-6">
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
                      ? "bg-blue-400 text-white"
                      : message.type === "bot"
                      ? "bg-gray-100"
                      : "bg-green-50 text-green-700"
                  } rounded-2xl py-4 px-8 max-w-[80%] text-2xl`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex justify-end">
                <div className="bg-gray-100 rounded-2xl py-4 px-8 max-w-[80%] text-2xl">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          
          {showPrompts && (
            <div className="px-6 py-6">
              <h2 className="text-3xl font-semibold mb-6">System Prompts</h2>
              {prompts.map((prompt, index) => (
                <div key={index} className="flex items-center mb-6">
                  <input
                    type="text"
                    className="flex-1 p-4 text-2xl border border-gray-300 rounded-lg"
                    value={prompt}
                    onChange={(e) => handlePromptChange(index, e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleSaveNewPrompt(index)
                    }
                  />
                  {prompt && (
                    <button
                      className="ml-4 text-blue-500"
                      onClick={() => handleUpdatePrompt(index)}
                    >
                      Update
                    </button>
                  )}
                  <button
                    className="ml-4 text-red-500"
                    onClick={() => handleDeletePromptBackend(index)}
                  >
                    <Trash className="h-8 w-8" />
                  </button>
                </div>
              ))}
              <button
                className="flex items-center space-x-3 text-blue-500 mt-6 text-2xl"
                onClick={handleAddPrompt}
              >
                <Plus className="h-8 w-8" />
                <span>Add New Prompt</span>
              </button>
              <button
                className="mt-6 px-4 py-3 bg-blue-500 text-white text-xl rounded-lg inline-block"
                onClick={handleGetResponses}
              >
                Get Response
              </button>
            </div>
          )}

          
          {responses.length > 0 && (
            <div className="px-6 py-6">
              <h2 className="text-3xl font-semibold mb-6">Response Options</h2>
              <form className="space-y-4">
                {responses.map((response, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 border rounded-lg ${
                      selectedResponseIndex === index ? "bg-blue-100 border-blue-400" : "border-gray-300"
                    }`}
                    onClick={() => setSelectedResponseIndex(index)}
                  >
                    <label
                      htmlFor={`response-${index}`}
                      className="text-2xl text-gray-700 cursor-pointer flex-grow"
                    >
                      {response}
                    </label>
                    <input
                      type="radio"
                      id={`response-${index}`}
                      name="response"
                      value={index}
                      className="w-6 h-6 text-blue-500 cursor-pointer"
                      checked={selectedResponseIndex === index}
                      onChange={() => setSelectedResponseIndex(index)}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  className="mt-6 px-4 py-3 bg-blue-500 text-white text-xl rounded-lg inline-block"
                  onClick={() => handleResponseSelect(responses[selectedResponseIndex], selectedResponseIndex)}
                  disabled={selectedResponseIndex === null}
                >
                  Select
                </button>
              </form>
            </div>
          )}

          
          {showOptions && (
            <div className="flex justify-center space-x-6 mt-6">
              <button
                className="px-8 py-3 bg-blue-500 text-white text-2xl rounded-lg"
                onClick={handleContinue}
              >
                Continue
              </button>
              <button
                className="px-8 py-3 bg-red-500 text-white text-2xl rounded-lg"
                onClick={handleDone}
              >
                Done
              </button>
            </div>
          )}
        </div>

        
        <div className="fixed bottom-0 w-[80%] bg-white border-t">
          <div className="p-6">
            <div className="flex items-center bg-gray-50 rounded-full px-6 py-4">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 bg-transparent outline-none text-2xl"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendQuery()}
              />
              <button
                className="ml-4 text-gray-500"
                onClick={handleSendQuery}
              >
                <MessageSquare className="h-8 w-8" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
