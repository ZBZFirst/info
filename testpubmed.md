---
layout: default
title: "PubMed Search Tool"
---

<div id="pubmed-search-app">
  <h2>PubMed Literature Search</h2>
  
  <div class="input-section">
    <div class="input-group">
      <label for="search-term">Search Term:</label>
      <input type="text" id="search-term" value="Liquid Mechanical Ventilation Life Support Humans">
    </div>
    
    <div class="input-group">
      <label for="api-key">API Key (optional):</label>
      <input type="password" id="api-key" placeholder="Leave blank to use default">
    </div>
    
    <button id="search-button">Search PubMed</button>
  </div>
  
  <div id="results-container" style="display:none;">
    <h3>Search Results</h3>
    <div id="progress-bar"></div>
    <div id="results-table" class="table-responsive"></div>
  </div>
</div>

<script>
// Default configuration
const DEFAULT_API_KEY = '3834945c08440921ade60d29a8bdd9553808';
const BATCH_SIZE = 50;
const BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/';

// Main search function
async function searchPubMed() {
  const searchTerm = document.getElementById('search-term').value.trim();
  let apiKey = document.getElementById('api-key').value.trim();
  
  if (!apiKey) {
    apiKey = DEFAULT_API_KEY;
    console.log("Using default API key");
  }
  
  if (!searchTerm) {
    alert("Please enter a search term");
    return;
  }
  
  // Show loading state
  const resultsContainer = document.getElementById('results-container');
  const progressBar = document.getElementById('progress-bar');
  const resultsTable = document.getElementById('results-table');
  
  resultsContainer.style.display = 'block';
  progressBar.innerHTML = '<p>Searching PubMed...</p>';
  resultsTable.innerHTML = '';
  
  try {
    // Step 1: Search for PMIDs
    progressBar.innerHTML = '<p>Finding articles...</p>';
    const pmids = await searchPMIDs(apiKey, searchTerm);
    
    if (pmids.length === 0) {
      progressBar.innerHTML = '<p>No articles found for this search term.</p>';
      return;
    }
    
    // Step 2: Fetch metadata
    progressBar.innerHTML = `<p>Fetching details for ${pmids.length} articles...</p>`;
    const metadata = await fetchMetadata(apiKey, pmids);
    
    // Step 3: Display results
    displayResults(metadata);
    progressBar.innerHTML = `<p>Found ${Object.keys(metadata).length} articles</p>`;
    
  } catch (error) {
    progressBar.innerHTML = `<p class="error">Error: ${error.message}</p>`;
    console.error(error);
  }
}

// API functions
async function searchPMIDs(apiKey, searchTerm) {
  const params = new URLSearchParams({
    db: 'pubmed',
    term: searchTerm,
    retmax: 100000,
    retmode: 'json',
    api_key: apiKey
  });
  
  const response = await fetch(`${BASE_URL}esearch.fcgi?${params}`);
  const data = await response.json();
  return data.esearchresult.idlist || [];
}

async function fetchMetadata(apiKey, pmids) {
  const allData = {};
  
  for (let i = 0; i < pmids.length; i += BATCH_SIZE) {
    const batch = pmids.slice(i, i + BATCH_SIZE);
    const ids = batch.join(',');
    
    const params = new URLSearchParams({
      db: 'pubmed',
      id: ids,
      retmode: 'json',
      api_key: apiKey
    });
    
    const response = await fetch(`${BASE_URL}esummary.fcgi?${params}`);
    const data = await response.json();
    
    for (const pid of batch) {
      if (data.result[pid]) {
        allData[pid] = data.result[pid];
      }
    }
    
    // Update progress
    const progress = Math.min(i + BATCH_SIZE, pmids.length);
    document.getElementById('progress-bar').innerHTML = 
      `<p>Processed ${progress}/${pmids.length} records...</p>`;
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 400));
  }
  
  return allData;
}

// Display results in HTML table
function displayResults(metadata) {
  const resultsTable = document.getElementById('results-table');
  let html = `
    <table class="table table-striped">
      <thead>
        <tr>
          <th>PMID</th>
          <th>Title</th>
          <th>Authors</th>
          <th>Year</th>
          <th>Journal</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  Object.entries(metadata).forEach(([pmid, meta]) => {
    // Format authors
    let authors = [];
    try {
      const authorsList = typeof meta.authors === 'string' ? 
        JSON.parse(meta.authors) : meta.authors || [];
      authors = authorsList
        .filter(a => a.authtype === 'Author')
        .map(a => a.name)
        .slice(0, 3);
    } catch (e) {
      console.error("Error parsing authors", e);
    }
    
    // Format year
    let year = '';
    if (meta.pubdate) {
      const yearMatch = meta.pubdate.match(/\d{4}/);
      year = yearMatch ? yearMatch[0] : '';
    }
    
    html += `
      <tr>
        <td><a href="https://pubmed.ncbi.nlm.nih.gov/${pmid}/" target="_blank">${pmid}</a></td>
        <td>${meta.title || ''}</td>
        <td>${authors.join(', ')}${authors.length > 3 ? '...' : ''}</td>
        <td>${year}</td>
        <td>${meta.source || ''}</td>
      </tr>
    `;
  });
  
  html += `</tbody></table>`;
  resultsTable.innerHTML = html;
}

// Event listener
document.getElementById('search-button').addEventListener('click', searchPubMed);
</script>

<style>
#pubmed-search-app {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.input-section {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 5px;
  margin-bottom: 20px;
}

.input-group {
  margin-bottom: 15px;
}

.input-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.input-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

#search-button {
  background: #2c82c9;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

#search-button:hover {
  background: #1a6cb3;
}

.table-responsive {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 8px 12px;
  border: 1px solid #ddd;
  text-align: left;
}

th {
  background: #f0f0f0;
}

.error {
  color: #d9534f;
}
</style>
