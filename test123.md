---
layout: default
title: PubMed Network Visualizer
---

# PubMed Network Visualizer

<div class="container">
    <div id="input-container">
        <h2>Search Parameters</h2>
        <form id="search-form">
            <div class="form-group">
                <label for="api-key">NCBI API Key:</label>
                <input type="text" id="api-key" placeholder="Enter your API key">
                <small>Default key will be used if left blank</small>
            </div>
            <div class="form-group">
                <label for="search-term">Search Term:</label>
                <input type="text" id="search-term" placeholder="e.g., Liquid Mechanical Ventilation">
            </div>
            <button type="submit" id="search-button">Search PubMed</button>
        </form>
        <div id="status-message"></div>
    </div>

    <div id="data-container" style="display:none;">
        <h2>Article Data</h2>
        <div id="data-table"></div>
    </div>

    <div id="visualization-container">
        <div id="2d-graph"></div>
        <div id="3d-graph"></div>
    </div>
</div>

<style>
.container {
    font-family: Arial, sans-serif;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

#input-container {
    background: #f5f5f5;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
}

.form-group {
    margin-bottom: 15px;
}

label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
}

input[type="text"] {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

button {
    background-color: #4CAF50;
    color: white;
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

button:hover {
    background-color: #45a049;
}

#status-message {
    margin-top: 15px;
    padding: 10px;
    border-radius: 4px;
}

#data-table {
    max-height: 400px;
    overflow-y: auto;
    margin-bottom: 20px;
    border: 1px solid #ddd;
}

#2d-graph, #3d-graph {
    width: 100%;
    height: 600px;
    margin-bottom: 30px;
    border: 1px solid #ddd;
    border-radius: 4px;
}
</style>

<script src="https://d3js.org/d3.v7.min.js"></script>
<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>

<script>
// Configuration
const DEFAULT_API_KEY = '3834945c08440921ade60d29a8bdd9553808';
const DEFAULT_SEARCH_TERM = 'Liquid Mechanical Ventilation Life Support Humans';
const BATCH_SIZE = 50;
const BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/';

// DOM Elements
const searchForm = document.getElementById('search-form');
const apiKeyInput = document.getElementById('api-key');
const searchTermInput = document.getElementById('search-term');
const searchButton = document.getElementById('search-button');
const statusMessage = document.getElementById('status-message');
const dataContainer = document.getElementById('data-container');
const dataTable = document.getElementById('data-table');
const graph2d = document.getElementById('2d-graph');
const graph3d = document.getElementById('3d-graph');

// Form submission handler
searchForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const apiKey = apiKeyInput.value.trim() || DEFAULT_API_KEY;
    const searchTerm = searchTermInput.value.trim() || DEFAULT_SEARCH_TERM;
    
    searchButton.disabled = true;
    statusMessage.textContent = `Searching PubMed for: "${searchTerm}"...`;
    statusMessage.style.backgroundColor = '#fff3cd';
    
    try {
        // Execute the search workflow
        const pmids = await searchPmids(apiKey, searchTerm);
        statusMessage.textContent = `Found ${pmids.length} articles. Fetching metadata...`;
        
        const metadata = await fetchMetadata(apiKey, pmids);
        statusMessage.textContent = `Fetching detailed article data...`;
        
        const tagData = await fetchMeshKeywords(apiKey, pmids);
        
        // Prepare data for display
        const df = prepareDataframe(metadata, tagData);
        
        // Display data
        displayDataTable(df);
        
        // Create visualizations
        const G = createNetworkGraph(df);
        visualizeInteractive(G);
        visualizeInteractive3d(G);
        
        statusMessage.textContent = `Successfully processed ${pmids.length} articles.`;
        statusMessage.style.backgroundColor = '#d4edda';
        dataContainer.style.display = 'block';
    } catch (error) {
        console.error('Error:', error);
        statusMessage.textContent = `Error: ${error.message}`;
        statusMessage.style.backgroundColor = '#f8d7da';
    } finally {
        searchButton.disabled = false;
    }
});

// PubMed API functions
async function searchPmids(apiKey, searchTerm) {
    const url = `${BASE_URL}esearch.fcgi?db=pubmed&term=${encodeURIComponent(searchTerm)}&retmax=100000&retmode=json&api_key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.esearchresult.idlist;
}

async function fetchMetadata(apiKey, pmids) {
    const allData = {};
    
    for (let i = 0; i < pmids.length; i += BATCH_SIZE) {
        const batch = pmids.slice(i, i + BATCH_SIZE);
        const ids = batch.join(',');
        
        const url = `${BASE_URL}esummary.fcgi?db=pubmed&id=${ids}&retmode=json&api_key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        
        batch.forEach(pid => {
            if (data.result[pid]) {
                allData[pid] = data.result[pid];
            }
        });
        
        // Update status periodically
        if (Math.floor(i / BATCH_SIZE) % 5 === 0) {
            statusMessage.textContent = `Processed ${Math.min(i + BATCH_SIZE, pmids.length)}/${pmids.length} records...`;
            await new Promise(resolve => setTimeout(resolve, 400));
        }
    }
    
    return allData;
}

async function fetchMeshKeywords(apiKey, pmids) {
    const tagData = {};
    
    for (let i = 0; i < pmids.length; i += BATCH_SIZE) {
        const batch = pmids.slice(i, i + BATCH_SIZE);
        const ids = batch.join(',');
        
        const url = `${BASE_URL}efetch.fcgi?db=pubmed&id=${ids}&retmode=xml&api_key=${apiKey}`;
        const response = await fetch(url);
        const text = await response.text();
        
        // Parse XML (simplified - in a real app you'd use a proper XML parser)
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "text/xml");
        const articles = xmlDoc.getElementsByTagName('PubmedArticle');
        
        for (let article of articles) {
            const pmid = article.getElementsByTagName('PMID')[0]?.textContent;
            if (!pmid) continue;
            
            // Extract abstract
            let abstract = '';
            const abstractTexts = article.getElementsByTagName('AbstractText');
            for (let abstractText of abstractTexts) {
                if (abstractText.textContent) {
                    const label = abstractText.getAttribute('Label');
                    abstract += label ? `${label}: ${abstractText.textContent} ` : `${abstractText.textContent} `;
                }
            }
            
            // Extract identifiers
            const doi = Array.from(article.getElementsByTagName('ArticleId'))
                .find(el => el.getAttribute('IdType') === 'doi')?.textContent || '';
                
            const pmcId = Array.from(article.getElementsByTagName('ArticleId'))
                .find(el => el.getAttribute('IdType') === 'pmc')?.textContent || '';
            
            // Extract MeSH terms and keywords
            const meshTerms = Array.from(article.getElementsByTagName('DescriptorName'))
                .map(el => el.textContent).slice(0, 30);
                
            const keywords = Array.from(article.getElementsByTagName('Keyword'))
                .map(el => el.textContent).slice(0, 30);
            
            tagData[pmid] = {
                'Abstract': abstract.trim(),
                'DOI': doi,
                'PMC_ID': pmcId,
                'MeSH_Terms': meshTerms,
                'Keywords': keywords
            };
        }
        
        // Update status periodically
        if (Math.floor(i / BATCH_SIZE) % 5 === 0) {
            statusMessage.textContent = `Processed ${Math.min(i + BATCH_SIZE, pmids.length)}/${pmids.length} records...`;
            await new Promise(resolve => setTimeout(resolve, 400));
        }
    }
    
    return tagData;
}

// Data preparation
function prepareDataframe(metadata, tagData) {
    const records = [];
    
    for (const [pmid, meta] of Object.entries(metadata)) {
        const row = {PMID: pmid};
        
        // Basic fields
        ['title', 'source', 'doi'].forEach(k => {
            row[k.charAt(0).toUpperCase() + k.slice(1)] = meta[k] || '';
        });
        
        // Authors
        let authorsList = [];
        try {
            authorsList = typeof meta.authors === 'string' ? JSON.parse(meta.authors) : meta.authors || [];
        } catch (e) {
            authorsList = [];
        }
        
        const individualAuthors = authorsList
            .filter(a => a.authtype === 'Author')
            .map(a => a.name || '');
            
        const collectiveNames = authorsList
            .filter(a => a.authtype === 'CollectiveName')
            .map(a => a.name || '');
        
        // Add authors
        for (let i = 0; i < 20; i++) {
            row[`Author_${i+1}`] = individualAuthors[i] || '';
        }
        row['Collective_Name'] = collectiveNames.join('; ');
        
        // Publication date
        const pubdate = meta.pubdate || '';
        let year = '', month = '', day = '';
        
        if (pubdate) {
            const dateParts = pubdate.split(' ');
            // Find year (first 4-digit number)
            for (const part of dateParts) {
                if (/^\d{4}$/.test(part)) {
                    year = part;
                    break;
                }
            }
            
            // Find month (first alphabetic part)
            const monthCandidate = dateParts.find(p => /[a-zA-Z]/.test(p));
            if (monthCandidate) {
                month = monthCandidate.split('-')[0];
            }
            
            // Find day (last 1-2 digit number that's not the year)
            for (let i = dateParts.length - 1; i >= 0; i--) {
                if (/^\d{1,2}$/.test(dateParts[i]) && dateParts[i] !== year) {
                    day = dateParts[i];
                    break;
                }
            }
        }
        
        row['PubYear'] = year;
        row['PubMonth'] = month;
        row['PubDay'] = day;
        row['OriginalPubDate'] = pubdate;
        
        // Add tag data
        const tags = tagData[pmid] || {
            Abstract: '',
            DOI: '',
            PMC_ID: '',
            MeSH_Terms: [],
            Keywords: []
        };
        
        row['Abstract'] = tags.Abstract || '';
        row['DOI'] = tags.DOI || '';
        row['DOI_Link'] = tags.DOI ? `https://doi.org/${tags.DOI}` : '';
        row['PMC_ID'] = tags.PMC_ID || '';
        row['PMC_Link'] = tags.PMC_ID ? `https://www.ncbi.nlm.nih.gov/pmc/articles/${tags.PMC_ID}/` : '';
        
        // Add MeSH and Keywords
        for (let i = 0; i < 30; i++) {
            row[`MeSH_${i+1}`] = tags.MeSH_Terms[i] || '';
            row[`Keyword_${i+1}`] = tags.Keywords[i] || '';
        }
        
        records.push(row);
    }
    
    return records;
}

// Data display
function displayDataTable(data) {
    // Create a simple table display (for large datasets you might want to use a library like DataTables)
    if (data.length === 0) {
        dataTable.innerHTML = '<p>No data to display</p>';
        return;
    }
    
    const columns = Object.keys(data[0]);
    let html = '<table class="data-table"><thead><tr>';
    
    // Header row
    columns.forEach(col => {
        html += `<th>${col}</th>`;
    });
    html += '</tr></thead><tbody>';
    
    // Data rows (limit to first 50 for display)
    data.slice(0, 50).forEach(row => {
        html += '<tr>';
        columns.forEach(col => {
            let value = row[col];
            if (Array.isArray(value)) value = value.join(', ');
            if (value === null || value === undefined) value = '';
            html += `<td>${value}</td>`;
        });
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    
    if (data.length > 50) {
        html += `<p>Showing 50 of ${data.length} records</p>`;
    }
    
    dataTable.innerHTML = html;
}

// Network graph functions
function createNetworkGraph(df) {
    const G = {
        nodes: [],
        edges: [],
        getNode: function(id) {
            return this.nodes.find(n => n.id === id);
        },
        addNode: function(id, properties = {}) {
            if (!this.getNode(id)) {
                this.nodes.push({id, ...properties});
            }
        },
        addEdge: function(source, target, properties = {}) {
            this.edges.push({source, target, ...properties});
        }
    };
    
    // Add year nodes
    const yearCounts = {};
    df.forEach(row => {
        const year = row.PubYear;
        if (year) yearCounts[year] = (yearCounts[year] || 0) + 1;
    });
    
    for (const [year, count] of Object.entries(yearCounts)) {
        G.addNode(`Year_${year}`, {
            size: 15 + count,
            type: 'year',
            year: year,
            count: count
        });
    }
    
    // Add article nodes and edges
    df.forEach(row => {
        const articleId = `Article_${row.PMID}`;
        G.addNode(articleId, {
            size: 10,
            type: 'article',
            title: row.Title || '',
            year: row.PubYear || '',
            abstract: row.Abstract || ''
        });
        
        // Connect article to its year
        if (row.PubYear) {
            G.addEdge(articleId, `Year_${row.PubYear}`, {weight: 1});
        }
        
        // Add keywords and connect to articles
        const allTerms = new Set();
        
        // Collect all keywords and MeSH terms
        for (let i = 1; i <= 30; i++) {
            const kw = row[`Keyword_${i}`];
            const mesh = row[`MeSH_${i}`];
            
            if (kw) allTerms.add(kw);
            if (mesh) allTerms.add(mesh);
        }
        
        // Add term nodes and edges
        allTerms.forEach(term => {
            if (term) {
                G.addNode(term, {
                    size: 5,
                    type: 'keyword'
                });
                G.addEdge(articleId, term, {weight: 0.5});
            }
        });
    });
    
    return G;
}

function visualizeInteractive(G) {
    // Simple force-directed layout simulation
    const nodes = G.nodes.map(node => ({
        ...node,
        x: Math.random() * 100,
        y: Math.random() * 100
    }));
    
    const edges = G.edges.map(edge => ({
        ...edge,
        source: nodes.findIndex(n => n.id === edge.source),
        target: nodes.findIndex(n => n.id === edge.target)
    }));
    
    // Prepare node traces
    const nodeGroups = {
        year: {x: [], y: [], text: [], size: [], color: []},
        article: {x: [], y: [], text: [], size: [], color: []},
        keyword: {x: [], y: [], text: [], size: [], color: []}
    };
    
    nodes.forEach(node => {
        const group = nodeGroups[node.type];
        group.x.push(node.x);
        group.y.push(node.y);
        group.size.push(node.size);
        
        if (node.type === 'article') {
            group.text.push(`<b>${node.title}</b><br>Year: ${node.year}`);
            group.color.push('lightblue');
        } else if (node.type === 'year') {
            group.text.push(`<b>Year: ${node.year}</b><br>Papers: ${node.count}`);
            group.color.push('red');
        } else {
            group.text.push(node.id);
            group.color.push('lightgreen');
        }
    });
    
    // Create edge trace
    const edgeTrace = {
        x: [],
        y: [],
        mode: 'lines',
        line: {width: 0.5, color: '#888'},
        hoverinfo: 'none',
        type: 'scatter'
    };
    
    edges.forEach(edge => {
        const source = nodes[edge.source];
        const target = nodes[edge.target];
        
        edgeTrace.x.push(source.x, target.x, null);
        edgeTrace.y.push(source.y, target.y, null);
    });
    
    // Create node traces
    const nodeTraces = Object.entries(nodeGroups).map(([type, data]) => ({
        x: data.x,
        y: data.y,
        text: data.text,
        mode: 'markers+text',
        marker: {
            size: data.size,
            color: data.color,
            line: {width: 2, color: 'DarkSlateGrey'}
        },
        hoverinfo: 'text',
        name: type,
        type: 'scatter'
    }));
    
    // Combine all traces
    const data = [edgeTrace, ...nodeTraces];
    
    // Layout
    const layout = {
        showlegend: false,
        hovermode: 'closest',
        margin: {b: 0, l: 0, r: 0, t: 0},
        xaxis: {showgrid: false, zeroline: false, showticklabels: false},
        yaxis: {showgrid: false, zeroline: false, showticklabels: false},
        title: "PubMed Literature Network Graph"
    };
    
    // Create the plot
    Plotly.newPlot(graph2d, data, layout);
}

function visualizeInteractive3d(G) {
    // Simple 3D layout with years on Z-axis
    const nodes = G.nodes.map(node => ({
        ...node,
        x: Math.random() * 100,
        y: Math.random() * 100,
        z: 0
    }));
    
    // Assign Z positions based on year
    const years = [...new Set(
        nodes.filter(n => n.type === 'year').map(n => n.year)
    )].sort();
    
    const yearZ = {};
    years.forEach((year, i) => {
        yearZ[year] = i * 2;
    });
    
    nodes.forEach(node => {
        if (node.type === 'year') {
            node.z = yearZ[node.year] || 0;
        } else if (node.type === 'article') {
            const yearNode = nodes.find(n => n.type === 'year' && n.year === node.year);
            node.z = yearNode ? yearNode.z + (Math.random() * 0.6 - 0.3) : 0;
        } else {
            // Average z of connected nodes
            const connectedNodes = G.edges
                .filter(e => e.source === node.id || e.target === node.id)
                .map(e => e.source === node.id ? e.target : e.source)
                .map(id => nodes.find(n => n.id === id))
                .filter(n => n);
                
            if (connectedNodes.length > 0) {
                node.z = connectedNodes.reduce((sum, n) => sum + n.z, 0) / connectedNodes.length;
            }
        }
    });
    
    const edges = G.edges.map(edge => ({
        ...edge,
        source: nodes.findIndex(n => n.id === edge.source),
        target: nodes.findIndex(n => n.id === edge.target)
    }));
    
    // Prepare node traces
    const nodeGroups = {
        year: {x: [], y: [], z: [], text: [], size: [], color: []},
        article: {x: [], y: [], z: [], text: [], size: [], color: []},
        keyword: {x: [], y: [], z: [], text: [], size: [], color: []}
    };
    
    nodes.forEach(node => {
        const group = nodeGroups[node.type];
        group.x.push(node.x);
        group.y.push(node.y);
        group.z.push(node.z);
        group.size.push(node.size);
        
        if (node.type === 'article') {
            group.text.push(`<b>${node.title}</b><br>Year: ${node.year}`);
            group.color.push('lightblue');
        } else if (node.type === 'year') {
            group.text.push(`<b>Year: ${node.year}</b><br>Papers: ${node.count}`);
            group.color.push('red');
        } else {
            group.text.push(node.id);
            group.color.push('lightgreen');
        }
    });
    
    // Create edge trace
    const edgeTrace = {
        x: [],
        y: [],
        z: [],
        mode: 'lines',
        line: {width: 0.5, color: '#888'},
        hoverinfo: 'none',
        type: 'scatter3d'
    };
    
    edges.forEach(edge => {
        const source = nodes[edge.source];
        const target = nodes[edge.target];
        
        edgeTrace.x.push(source.x, target.x, null);
        edgeTrace.y.push(source.y, target.y, null);
        edgeTrace.z.push(source.z, target.z, null);
    });
    
    // Create node traces
    const nodeTraces = Object.entries(nodeGroups).map(([type, data]) => ({
        x: data.x,
        y: data.y,
        z: data.z,
        text: data.text,
        mode: 'markers',
        marker: {
            size: data.size,
            color: data.color,
            line: {width: 2, color: 'DarkSlateGrey'},
            opacity: 0.8
        },
        hoverinfo: 'text',
        name: type,
        type: 'scatter3d'
    }));
    
    // Combine all traces
    const data = [edgeTrace, ...nodeTraces];
    
    // Layout
    const layout = {
        scene: {
            xaxis: {showbackground: false, showticklabels: false, title: ''},
            yaxis: {showbackground: false, showticklabels: false, title: ''},
            zaxis: {
                showbackground: false,
                showticklabels: true,
                title: 'Year',
                tickvals: years.map((_, i) => i * 2),
                ticktext: years
            }
        },
        margin: {l: 0, r: 0, b: 0, t: 0},
        title: "3D PubMed Literature Network by Year"
    };
    
    // Create the plot
    Plotly.newPlot(graph3d, data, layout);
}
</script>
