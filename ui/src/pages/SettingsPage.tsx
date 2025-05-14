import React, { useState, useEffect } from 'react';

// Placeholder for service functions, we will implement these later
// import { getAiConfig, updateAiConfig } from '../services/aiService';

const SettingsPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('');
  const [availableModels, setAvailableModels] = useState<string[]>(['gpt-3.5-turbo', 'gpt-4', 'claude-2']); // Example models

  useEffect(() => {
    // In a real scenario, you would fetch the current config from a backend
    // For now, we'll use placeholder values
    // const fetchConfig = async () => {
    //   try {
    //     // const config = await getAiConfig();
    //     // setPrompt(config.prompt);
    //     // setModel(config.model);
    //     // if (config.availableModels) {
    //     //   setAvailableModels(config.availableModels);
    //     // }
    //     setPrompt("Current LLM Prompt placeholder...");
    //     setModel("gpt-3.5-turbo");
    //   } catch (error) {
    //     console.error("Failed to fetch AI config:", error);
    //     setPrompt("Error loading prompt.");
    //     setModel(availableModels[0] || '');
    //   }
    // };
    // fetchConfig();

    // Using placeholder data for now
    setPrompt("Translate the user's product search query into a concise and effective keyword list for a database lookup. Focus on extracting key product names, attributes, and categories. For example, if the user asks for 'red running shoes size 10', the keywords could be 'red, running shoes, size 10'.");
    setModel("gpt-3.5-turbo");
    console.log("SettingsPage component mounted");
  }, []);

  const handleSaveChanges = async () => {
    // In a real scenario, you would send the updated config to a backend
    // try {
    //   // await updateAiConfig({ prompt, model });
    //   alert('Settings saved successfully!');
    // } catch (error) {
    //   console.error("Failed to save AI config:", error);
    //   alert('Failed to save settings.');
    // }
    console.log("Saving changes:", { prompt, model });
    alert('Settings saved (this is a placeholder)!');
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">AI Settings</h1>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <label htmlFor="llmPrompt" className="block text-lg font-medium text-gray-700 mb-2">
          LLM Prompt
        </label>
        <textarea
          id="llmPrompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={8}
          className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          placeholder="Enter your LLM prompt here..."
        />
        <p className="mt-2 text-sm text-gray-500">
          This prompt will be used for the AI product search feature. Customize it to optimize search results.
        </p>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <label htmlFor="llmModel" className="block text-lg font-medium text-gray-700 mb-2">
          AI Model
        </label>
        <select
          id="llmModel"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
        >
          {availableModels.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <p className="mt-2 text-sm text-gray-500">
          Select the AI model to be used for processing search queries.
        </p>
      </div>

      <button
        onClick={handleSaveChanges}
        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
      >
        Save Changes
      </button>
    </div>
  );
};

export default SettingsPage;
