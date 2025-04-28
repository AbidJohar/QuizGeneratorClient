import React, { useContext, useState } from "react";
import axios from "axios";
import { ThemeContext } from "../context/ThemeContext";
function App() {
  const { darkMode, setDarkMode } = useContext(ThemeContext);
  const [prompt, setPrompt] = useState("");
  const [mcqs, setMcqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const url = import.meta.env.VITE_BACKEND_URL // Your backend URL

  const toggleTheme = () => {
    setDarkMode((prev) => {
      console.log("Toggling theme to:", !prev); // Debug toggle
      return !prev;
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
  
    if (!prompt.trim()) {
      setError("Please enter a topic.");
      return;
    }
  
    setLoading(true);
    setError(""); // clear previous error
    setMcqs([]);  // clear previous MCQs
  
    try {
      const response = await axios.post(`${url}/generate-mcqs`, { prompt });
  
      if (response.data.success) {
        const mcqBlocks = response.data.text
          .split("#")
          .filter((block) => block.trim() !== "");
  
        const formattedMcqs = mcqBlocks.map((block) => {
          const lines = block.trim().split("\n").filter(Boolean);
          const questionLine = lines[0]?.trim() || "";
          const options = lines.slice(1, -1).map((line) => line.trim());
          const answerLine = lines[5]?.trim() || "";
  
          return {
            question: questionLine.replace(/^\d+\.\s*/, ""),
            options,
            answer: answerLine
              ? answerLine.replace(/^\s*answer:\s*/i, "").replace("**", "").trim()
              : "No answer found",
          };
        });
  
        setMcqs(formattedMcqs);
        setPrompt(""); // now clear only if success
      } else {
        // Server sent success: false (likely Joi validation error)
        setError(response.data.text);
      }
    } catch (error) {
      console.error("Error generating MCQs:", error);
      setError(
        error.response?.data?.text ||
        "Failed to generate MCQs. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <header className="w-full max-w-3xl flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
          MCQ Generator
        </h1>
        <button
          onClick={toggleTheme}
          className={`px-3 py-2 rounded-full ${
            darkMode ? "border-2 border-white" : "border-2 border-gray-800"
          }  bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200`}
          aria-label="Toggle theme"
        >
          {darkMode ? " Light ☀️ " : " Dark 🌙 "}
        </button>
      </header>

      <main className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <form onSubmit={submitHandler} className="space-y-4">
          <div>
            <label
              htmlFor="prompt"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Enter a Topic name to generate <span className=" font-bold text-lg">15 most important</span> mcqs:
            </label>
            <input
              id="prompt"
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., About python programming"
              className="mt-1 w-full p-3 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Generating...
              </span>
            ) : (
              "Generate MCQs"
            )}
          </button>
        </form>

        {mcqs.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Generated MCQs
            </h2>
            <div className="space-y-6">
              {mcqs.map((mcq, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-200 dark:bg-gray-700 rounded-md"
                >
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {index + 1}. {mcq.question}
                  </p>
                  <ul className="mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                    {mcq.options.map((option, i) => (
                      <li key={i} className="flex items-start">
                        {option}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <strong>Answer:</strong> {mcq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="mt-8 text-gray-500 dark:text-gray-400 text-sm text-center">
        © 2025 MCQ Generator. All rights reserved.
        <br />
        Creator: Abid Johar
      </footer>
    </div>
  );
}

export default App;
