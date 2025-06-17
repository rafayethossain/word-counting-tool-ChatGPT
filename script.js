// Modern JavaScript for Word Counting Tool

document.addEventListener("DOMContentLoaded", () => {
  const textArea = document.querySelector("#text-area");
  const wordCountEl = document.querySelector("#word-count");
  const charCountEl = document.querySelector("#character-count");
  const charCountNoSpaceEl = document.querySelector("#character-count-without-spaces");
  const topKeywordsList = document.querySelector("#top-keywords-list");
  const clearBtn = document.querySelector("#clear-btn");
  const fileUpload = document.getElementById("file-upload");
  const downloadBtn = document.getElementById("download-btn");

  // Debounce helper
  let debounceTimer;
  const debounce = (fn, delay = 120) => {
    return (...args) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => fn(...args), delay);
    };
  };

  // Accurate word count
  const countWords = (text) => {
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  };

  // Character count
  const countCharacters = (text) => text.length;
  const countCharactersWithoutSpaces = (text) => text.replace(/\s/g, "").length;

  // Top keywords (excluding common stopwords)
  const stopwords = new Set(["the","and","a","to","of","in","is","it","for","on","with","as","at","by","an","be","this","that","from","or","are","was","but","not","have","has","had","they","you","we","he","she","his","her","their","our","my","your","so","if","can","will","just"]);
  const countTopKeywords = (text, topN = 5) => {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const freq = {};
    words.forEach(word => {
      if (!stopwords.has(word)) freq[word] = (freq[word] || 0) + 1;
    });
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN);
  };

  // Placeholder for better UX
  textArea.placeholder = "Paste or type your text here...";

  // Show a message when textarea is empty
  const emptyMsgId = "empty-message";
  const showEmptyMessage = () => {
    let msg = document.getElementById(emptyMsgId);
    if (!msg) {
      msg = document.createElement("div");
      msg.id = emptyMsgId;
      msg.textContent = "Start typing or paste your text above to see word and character counts.";
      msg.style.cssText = "color:#888;margin:18px 0 0 0;font-size:1.08em;";
      textArea.parentNode.appendChild(msg);
    }
  };
  const hideEmptyMessage = () => {
    const msg = document.getElementById(emptyMsgId);
    if (msg) msg.remove();
  };

  // Animate count changes for a dynamic feel
  const animateCount = (el) => {
    el.classList.add("animated");
    setTimeout(() => el.classList.remove("animated"), 250);
  };

  // Update all counts (with empty message and animation)
  const updateCounts = () => {
    const text = textArea.value;
    const prevWord = wordCountEl.textContent;
    const prevChar = charCountEl.textContent;
    const prevCharNoSpace = charCountNoSpaceEl.textContent;
    const newWord = countWords(text);
    const newChar = countCharacters(text);
    const newCharNoSpace = countCharactersWithoutSpaces(text);
    if (prevWord != newWord) animateCount(wordCountEl);
    if (prevChar != newChar) animateCount(charCountEl);
    if (prevCharNoSpace != newCharNoSpace) animateCount(charCountNoSpaceEl);
    wordCountEl.textContent = newWord;
    charCountEl.textContent = newChar;
    charCountNoSpaceEl.textContent = newCharNoSpace;
    // Top keywords
    const top = countTopKeywords(text);
    topKeywordsList.innerHTML = top.length
      ? top.map(([word, freq]) => `<span>${word} (${freq})</span>`).join("")
      : '<span style="color:#aaa">None</span>';
    if (!text.trim()) {
      showEmptyMessage();
    } else {
      hideEmptyMessage();
    }
  };

  // Debounced input handler
  textArea.addEventListener("input", debounce(updateCounts, 100));

  // Clear button
  clearBtn.addEventListener("click", () => {
    textArea.value = "";
    updateCounts();
    textArea.focus();
  });

  // File upload handler (improved for all browsers)
  fileUpload.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "text/plain" || file.name.endsWith('.txt'))) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        textArea.value = evt.target.result;
        updateCounts();
      };
      reader.onerror = () => {
        alert("Error reading file. Please try again.");
      };
      reader.readAsText(file);
    } else {
      alert("Please upload a valid .txt file.");
    }
    e.target.value = null; // Reset input for re-upload
  });

  // Download text as file
  downloadBtn.addEventListener("click", () => {
    const text = textArea.value;
    if (!text.trim()) {
      alert("Nothing to download. Please enter some text.");
      return;
    }
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "word-count-text.txt";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  });

  // Tooltip for metrics
  const addTooltip = (selector, text) => {
    const el = document.querySelector(selector);
    if (el) {
      el.style.position = "relative";
      el.title = text;
    }
  };
  addTooltip("#word-count", "Total number of words");
  addTooltip("#character-count", "Total number of characters including spaces");
  addTooltip("#character-count-without-spaces", "Total number of characters excluding spaces");
  addTooltip("#top-keywords-title", "Most frequent non-common words");

  // Initial update
  updateCounts();
});


