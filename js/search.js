// Search Configuration
const searchConfig = {
  // Add all your website pages here with their titles
  pages: [
    { url: "academic-programmes.html", title: "academic programmes" },
    { url: "bachelor-of-nursing.html", title: "Bachelor of Nursing" },
    {
      url: "ScienceInManagementAndInformatics.html",
      title: "Science in Health Management and Informatics",
    },
    // Add more pages as needed
  ],
  // Search in these HTML tags
  searchTags: [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "p",
    "span",
    "li",
    "td",
    "th",
    "a",
  ],
  // Minimum characters to start search
  minChars: 2,
  // Maximum results to show
  maxResults: 50,
  // Elements to exclude from search
  excludeSelectors: [
    "header",
    "nav",
    "footer",
    ".topbar",
    ".navbar",
    ".footer",
    ".copyright",
    "[class*='top-bar']",
    "[class*='nav-bar']",
    "[class*='footer']",
    "[class*='copyright']",
    "[class*='menu']",
    "[class*='header']",
  ],
};

// DOM Elements
const searchIcon = document.querySelector(".search");
const searchOverlay = document.getElementById("searchOverlay");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const closeButton = document.getElementById("closeSearch");
const searchResults = document.getElementById("searchResults");

// Open Search Overlay
searchIcon.addEventListener("click", () => {
  searchOverlay.classList.add("active");
  searchInput.focus();
});

// Close Search Overlay
closeButton.addEventListener("click", () => {
  searchOverlay.classList.remove("active");
  searchInput.value = "";
  searchResults.innerHTML = "";
});

// Close on ESC key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    searchOverlay.classList.remove("active");
    searchInput.value = "";
    searchResults.innerHTML = "";
  }
});

// Helper function to check if element should be excluded from search
function isElementExcluded(element) {
  // Check if element is inside excluded sections
  for (const selector of searchConfig.excludeSelectors) {
    if (element.closest(selector)) {
      return true;
    }
  }

  // Additional exclusion logic
  const elementClass = element.className || "";
  const elementId = element.id || "";

  // Check for excluded class patterns
  const excludedPatterns = [
    /topbar/i,
    /navbar/i,
    /footer/i,
    /copyright/i,
    /menu/i,
    /header/i,
    /banner/i,
  ];

  for (const pattern of excludedPatterns) {
    if (pattern.test(elementClass) || pattern.test(elementId)) {
      return true;
    }
  }

  return false;
}

// Search function (updated to exclude sections)
async function performSearch(searchTerm) {
  if (searchTerm.length < searchConfig.minChars) {
    searchResults.innerHTML =
      '<div class="no-results">اكتب على الأقل ' +
      searchConfig.minChars +
      " أحرف للبحث</div>";
    return;
  }

  searchResults.innerHTML = '<div class="text-center p-3">جاري البحث...</div>';

  const results = [];
  const lowerSearchTerm = searchTerm.toLowerCase();

  try {
    for (const page of searchConfig.pages) {
      try {
        const response = await fetch(page.url);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        // Remove script and style tags
        doc.querySelectorAll("script, style").forEach((el) => el.remove());

        // Search in specified tags
        searchConfig.searchTags.forEach((tag) => {
          doc.querySelectorAll(tag).forEach((element) => {
            // Skip if element is inside excluded sections
            if (isElementExcluded(element)) {
              return;
            }

            const text = element.textContent.trim();
            const innerHTML = element.innerHTML;

            if (
              text.toLowerCase().includes(lowerSearchTerm) &&
              text.length > 10
            ) {
              // Create excerpt (first 150 chars)
              const excerpt =
                text.length > 150 ? text.substring(0, 150) + "..." : text;

              // Highlight search term in excerpt
              const highlightedExcerpt = excerpt.replace(
                new RegExp(`(${searchTerm})`, "gi"),
                '<span class="highlight">$1</span>'
              );

              // Get the nearest heading for context
              let heading = element.closest("h1, h2, h3, h4, h5, h6");
              let headingText = heading ? heading.textContent : page.title;

              // Skip if heading is in excluded sections
              if (heading && isElementExcluded(heading)) {
                headingText = page.title;
              }

              results.push({
                pageTitle: page.title,
                pageUrl: page.url,
                heading: headingText,
                excerpt: highlightedExcerpt,
                fullText: text,
                element: element.tagName,
              });
            }
          });
        });
      } catch (error) {
        console.warn(`Cannot load page: ${page.url}`, error);
      }

      // Stop if we have enough results
      if (results.length >= searchConfig.maxResults) break;
    }

    displayResults(results, searchTerm);
  } catch (error) {
    console.error("Search error:", error);
    searchResults.innerHTML =
      '<div class="no-results">حدث خطأ أثناء البحث. حاول مرة أخرى.</div>';
  }
}

// Alternative: More efficient search function that clones and removes excluded sections first
async function performSearchOptimized(searchTerm) {
  if (searchTerm.length < searchConfig.minChars) {
    searchResults.innerHTML =
      '<div class="no-results">اكتب على الأقل ' +
      searchConfig.minChars +
      " أحرف للبحث</div>";
    return;
  }

  searchResults.innerHTML = '<div class="text-center p-3">جاري البحث...</div>';

  const results = [];
  const lowerSearchTerm = searchTerm.toLowerCase();

  try {
    for (const page of searchConfig.pages) {
      try {
        const response = await fetch(page.url);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        // Clone the document to avoid modifying the original
        const searchDoc = doc.cloneNode(true);

        // Remove script and style tags
        searchDoc
          .querySelectorAll("script, style")
          .forEach((el) => el.remove());

        // Remove excluded sections from the cloned document
        searchConfig.excludeSelectors.forEach((selector) => {
          searchDoc.querySelectorAll(selector).forEach((el) => el.remove());
        });

        // Remove elements with excluded class patterns
        searchDoc.querySelectorAll("*").forEach((el) => {
          const className = el.className || "";
          if (typeof className === "string") {
            const lowerClassName = className.toLowerCase();
            if (
              lowerClassName.includes("topbar") ||
              lowerClassName.includes("navbar") ||
              lowerClassName.includes("footer") ||
              lowerClassName.includes("copyright") ||
              lowerClassName.includes("menu") ||
              lowerClassName.includes("header")
            ) {
              el.remove();
            }
          }
        });

        // Search in specified tags
        searchConfig.searchTags.forEach((tag) => {
          searchDoc.querySelectorAll(tag).forEach((element) => {
            const text = element.textContent.trim();

            // Skip if text is too short or too long (likely not content)
            if (text.length < 10 || text.length > 5000) {
              return;
            }

            if (text.toLowerCase().includes(lowerSearchTerm)) {
              // Create excerpt (first 150 chars)
              const excerpt =
                text.length > 150 ? text.substring(0, 150) + "..." : text;

              // Highlight search term in excerpt
              const highlightedExcerpt = excerpt.replace(
                new RegExp(`(${searchTerm})`, "gi"),
                '<span class="highlight">$1</span>'
              );

              // Get the nearest heading for context
              let heading = element.closest("h1, h2, h3, h4, h5, h6");
              let headingText = heading ? heading.textContent : page.title;

              results.push({
                pageTitle: page.title,
                pageUrl: page.url,
                heading: headingText,
                excerpt: highlightedExcerpt,
                fullText: text,
                element: element.tagName,
              });
            }
          });
        });
      } catch (error) {
        console.warn(`Cannot load page: ${page.url}`, error);
      }

      // Stop if we have enough results
      if (results.length >= searchConfig.maxResults) break;
    }

    // Remove duplicate results
    const uniqueResults = [];
    const seen = new Set();

    results.forEach((result) => {
      const key =
        result.pageUrl + result.heading + result.excerpt.substring(0, 50);
      if (!seen.has(key)) {
        seen.add(key);
        uniqueResults.push(result);
      }
    });

    displayResults(uniqueResults, searchTerm);
  } catch (error) {
    console.error("Search error:", error);
    searchResults.innerHTML =
      '<div class="no-results">حدث خطأ أثناء البحث. حاول مرة أخرى.</div>';
  }
}

// Display results
function displayResults(results, searchTerm) {
  if (results.length === 0) {
    searchResults.innerHTML = `
      <div class="no-results">
        <i class="fas fa-search fa-2x mb-3"></i>
        <p>لم يتم العثور على نتائج لـ "${searchTerm}"</p>
        <p class="small">حاول استخدام كلمات أخرى أو مصطلحات بحث مختلفة</p>
      </div>
    `;
    return;
  }

  let resultsHTML = "";

  results.forEach((result, index) => {
    resultsHTML += `
      <div class="search-result-item">
        <h4>
          <a href="${result.pageUrl}" onclick="closeSearch()">
            ${result.heading}
          </a>
        </h4>
        <p>${result.excerpt}</p>
        <div class="page-url">
          <i class="fas fa-file-alt"></i> ${result.pageTitle}
        </div>
      </div>
    `;
  });

  searchResults.innerHTML = resultsHTML;
}

// Function to close search (for use in onclick)
function closeSearch() {
  searchOverlay.classList.remove("active");
  searchInput.value = "";
  searchResults.innerHTML = "";
}

// Event Listeners for search - Use the optimized version
searchButton.addEventListener("click", () => {
  const searchTerm = searchInput.value.trim();
  if (searchTerm) {
    performSearchOptimized(searchTerm); // Use optimized version
  }
});

searchInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    const searchTerm = searchInput.value.trim();
    if (searchTerm) {
      performSearchOptimized(searchTerm); // Use optimized version
    }
  }
});

// Debounced search for real-time typing
let searchTimeout;
searchInput.addEventListener("input", (e) => {
  const searchTerm = e.target.value.trim();

  clearTimeout(searchTimeout);

  if (searchTerm.length >= searchConfig.minChars) {
    searchTimeout = setTimeout(() => {
      performSearchOptimized(searchTerm); // Use optimized version
    }, 500); // Delay search by 500ms after typing stops
  } else if (searchTerm.length === 0) {
    searchResults.innerHTML = "";
  } else {
    searchResults.innerHTML = `<div class="no-results">اكتب على الأقل ${searchConfig.minChars} أحرف للبحث</div>`;
  }
});

// Prevent overlay click from closing
searchOverlay.addEventListener("click", (e) => {
  if (e.target === searchOverlay) {
    searchOverlay.classList.remove("active");
    searchInput.value = "";
    searchResults.innerHTML = "";
  }
});

// Initialize search on page load (if search term in URL)
document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get("q");

  if (searchParam) {
    searchOverlay.classList.add("active");
    searchInput.value = decodeURIComponent(searchParam);
    performSearchOptimized(decodeURIComponent(searchParam)); // Use optimized version
  }
});

// Add CSS for highlights if not already present
if (!document.querySelector("#search-highlight-style")) {
  const style = document.createElement("style");
  style.id = "search-highlight-style";
  style.textContent = `
    .highlight {
      background-color: #ffeb3b;
      padding: 0 2px;
      border-radius: 2px;
      font-weight: bold;
    }
    .search-result-item {
      border-bottom: 1px solid #eee;
      padding: 15px 0;
    }
    .search-result-item:last-child {
      border-bottom: none;
    }
    .search-result-item h4 {
      margin-bottom: 8px;
    }
    .search-result-item h4 a {
      color: #007bff;
      text-decoration: none;
    }
    .search-result-item h4 a:hover {
      text-decoration: underline;
    }
    .page-url {
      color: #666;
      font-size: 14px;
      margin-top: 5px;
    }
  `;
  document.head.appendChild(style);
}
