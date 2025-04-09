// DOM Elements
const sourceSelect = document.getElementById("sourceSelect");
const fileSelect = document.getElementById("fileSelect");
const loadFileBtn = document.getElementById("loadFileBtn");
const loadFilesBtn = document.getElementById("loadFilesBtn");
const loadingStatus = document.getElementById("loadingStatus");
const tableContainer = document.getElementById("tableContainer");
const fileInfo = document.getElementById("fileInfo");
const defaultColWidthInput = document.getElementById("defaultColWidth");
const rowHeightInput = document.getElementById("rowHeight");
const headerScroll = document.getElementById('headerScroll');
const tableWrapper = document.getElementById('tableWrapper');
const headerScrollInner = document.getElementById('headerScrollInner');
const tableControls = document.getElementById('tableControls');
const applyWidthBtn = document.getElementById("applyWidthBtn");
const applyHeightBtn = document.getElementById("applyHeightBtn");
const resetLayoutBtn = document.getElementById("resetLayoutBtn");

// GitHub API base URL
const GITHUB_API_BASE = 'https://api.github.com/repos/ZBZFirst/file/contents/ScrapeDescriptions';
let currentFiles = [];
let currentTable = null;
let isResizing = false;
let currentResizeColumn = null;
let startX = 0;
let startWidth = 0;

// Table data state
let tableState = {
    hiddenColumns: [],
    sortPrimary: { column: '', order: 'asc' },
    sortSecondary: { column: '', order: 'asc' },
    currentFilter: { column: '', value: '' },
    originalData: [],
    headers: []
};

// Event Listeners
loadFilesBtn.addEventListener('click', loadFiles);
loadFileBtn.addEventListener('click', loadSelectedFile);
applyWidthBtn.addEventListener('click', applyDefaultColumnWidth);
applyHeightBtn.addEventListener('click', applyRowHeight);
resetLayoutBtn.addEventListener('click', resetTableLayout);
fileSelect.addEventListener('change', function() {
    loadFileBtn.disabled = !this.value;
});

// Load files from selected source
async function loadFiles() {
    const source = sourceSelect.value;
    if (!source) {
        alert("Please select a source first");
        return;
    }

    loadingStatus.textContent = "Loading file list...";
    fileSelect.disabled = true;
    loadFileBtn.disabled = true;
    tableContainer.innerHTML = "";
    fileInfo.textContent = "";
    tableControls.style.display = 'none';
    
    try {
        const url = `${GITHUB_API_BASE}/${source}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        currentFiles = data.filter(item => 
            item.type === "file" && item.name.endsWith('.xlsx')
        ).sort((a, b) => b.name.localeCompare(a.name));

        populateFileDropdown(currentFiles);
        loadingStatus.textContent = `Loaded ${currentFiles.length} files`;
    } catch (error) {
        console.error("Error loading files:", error);
        loadingStatus.textContent = "Error loading file list";
        loadingStatus.className = "error";
        fileSelect.innerHTML = '<option value="">-- Select a file --</option>';
    } finally {
        fileSelect.disabled = false;
        loadFileBtn.disabled = false;
    }
}

// Populate file dropdown
function populateFileDropdown(files) {
    fileSelect.innerHTML = '<option value="">-- Select a file --</option>';
    files.forEach(file => {
        const option = document.createElement("option");
        option.value = file.download_url;
        option.textContent = file.name;
        fileSelect.appendChild(option);
    });
}

// Load selected file
async function loadSelectedFile() {
    const selectedUrl = fileSelect.value;
    if (!selectedUrl) {
        alert("Please select a file first");
        return;
    }

    const fileName = fileSelect.options[fileSelect.selectedIndex].text;
    loadingStatus.textContent = `Loading ${fileName}...`;
    tableContainer.innerHTML = "";
    fileInfo.textContent = "";
    
    try {
        const response = await fetch(selectedUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        
        // Process the first sheet
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        if (jsonData.length === 0) {
            throw new Error("Empty sheet");
        }
        
        // Store original data and headers
        tableState.headers = jsonData[0].map((header, index) => header || `Column ${index + 1}`);
        tableState.originalData = jsonData.slice(1).map(row => {
            const obj = {};
            tableState.headers.forEach((header, i) => {
                obj[header] = row[i] || '';
            });
            return obj;
        });
        
        // Reset table state
        tableState.hiddenColumns = [];
        tableState.sortPrimary = { column: '', order: 'asc' };
        tableState.sortSecondary = { column: '', order: 'asc' };
        tableState.currentFilter = { column: '', value: '' };
        
        // Display file info
        fileInfo.textContent = `File: ${fileName} | Sheets: ${workbook.SheetNames.length} | Rows: ${jsonData.length - 1} | Columns: ${jsonData[0].length}`;
        
        // Show table controls
        tableControls.style.display = 'block';
        
        // Initialize controls
        initializeTableControls();
        
        // Render the table
        renderTable();
        
        loadingStatus.textContent = "";
        
    } catch (error) {
        console.error("Error loading file:", error);
        loadingStatus.textContent = `Error loading ${fileName}: ${error.message}`;
        loadingStatus.className = "error";
        tableContainer.innerHTML = "";
        tableControls.style.display = 'none';
    }
}

// Initialize table controls
function initializeTableControls() {
    // Populate sort dropdowns
    populateDropdown('primarySort', tableState.headers);
    populateDropdown('secondarySort', tableState.headers);
    
    // Populate hide dropdown
    updateHideDropdown();
    
    // Populate filter column dropdown
    populateDropdown('filterColumn', tableState.headers);
    
    // Set up event listeners
    document.getElementById('applySort').addEventListener('click', applySorting);
    document.getElementById('hideColumn').addEventListener('click', hideColumn);
    document.getElementById('showAllColumns').addEventListener('click', showAllColumns);
    document.getElementById('applyFilter').addEventListener('click', applyFilter);
    document.getElementById('clearFilter').addEventListener('click', clearFilter);
}

// Helper function to populate dropdowns
function populateDropdown(id, options) {
    const dropdown = document.getElementById(id);
    dropdown.innerHTML = `<option value="">-- ${id.includes('Sort') ? 'None' : 'Select'} --</option>`;
    
    options.forEach(option => {
        if (!tableState.hiddenColumns.includes(option)) {
            const optElement = document.createElement('option');
            optElement.value = option;
            optElement.textContent = option;
            dropdown.appendChild(optElement);
        }
    });
}

// Update hide dropdown with only visible columns
function updateHideDropdown() {
    const visibleColumns = tableState.headers.filter(
        col => !tableState.hiddenColumns.includes(col)
    );
    populateDropdown('columnToHide', visibleColumns);
}

// Sorting functionality
function applySorting() {
    tableState.sortPrimary = {
        column: document.getElementById('primarySort').value,
        order: document.getElementById('primaryOrder').value
    };
    
    tableState.sortSecondary = {
        column: document.getElementById('secondarySort').value,
        order: document.getElementById('secondaryOrder').value
    };
    
    renderTable();
}

function sortData(data) {
    return data.sort((a, b) => {
        // Primary sort
        if (tableState.sortPrimary.column) {
            const primaryCompare = compareValues(
                a[tableState.sortPrimary.column],
                b[tableState.sortPrimary.column],
                tableState.sortPrimary.order
            );
            if (primaryCompare !== 0) return primaryCompare;
        }
        
        // Secondary sort (only if primary is equal)
        if (tableState.sortSecondary.column) {
            return compareValues(
                a[tableState.sortSecondary.column],
                b[tableState.sortSecondary.column],
                tableState.sortSecondary.order
            );
        }
        
        return 0;
    });
}

function compareValues(a, b, order) {
    // Handle empty values
    if (a === undefined || a === null) a = '';
    if (b === undefined || b === null) b = '';
    
    // Convert to string for comparison
    const strA = String(a).toLowerCase();
    const strB = String(b).toLowerCase();
    
    if (strA < strB) return order === 'asc' ? -1 : 1;
    if (strA > strB) return order === 'asc' ? 1 : -1;
    return 0;
}

// Column visibility
function hideColumn() {
    const column = document.getElementById('columnToHide').value;
    if (column && !tableState.hiddenColumns.includes(column)) {
        tableState.hiddenColumns.push(column);
        updateHideDropdown();
        renderTable();
    }
}

function showAllColumns() {
    tableState.hiddenColumns = [];
    updateHideDropdown();
    renderTable();
}

// Row filtering
function applyFilter() {
    tableState.currentFilter = {
        column: document.getElementById('filterColumn').value,
        value: document.getElementById('filterValue').value.toLowerCase()
    };
    renderTable();
}

function clearFilter() {
    tableState.currentFilter = { column: '', value: '' };
    document.getElementById('filterValue').value = '';
    renderTable();
}

function filterData(data) {
    if (!tableState.currentFilter.column || !tableState.currentFilter.value) {
        return data;
    }
    
    return data.filter(row => {
        const cellValue = String(row[tableState.currentFilter.column]).toLowerCase();
        return cellValue.includes(tableState.currentFilter.value);
    });
}

// Main table rendering function
function renderTable() {
    // Filter data first
    let displayData = filterData([...tableState.originalData]);
    
    // Sort data
    displayData = sortData(displayData);
    
    // Get visible columns
    const visibleColumns = tableState.headers.filter(
        col => !tableState.hiddenColumns.includes(col)
    );
    
    // Clear existing table
    tableContainer.innerHTML = '';
    
    // Create new table
    currentTable = document.createElement("table");
    
    // Create header row
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    
    visibleColumns.forEach(header => {
        const th = document.createElement("th");
        th.textContent = header;
        
        // Add resize handle
        const resizeHandle = document.createElement("div");
        resizeHandle.className = "resize-handle";
        resizeHandle.addEventListener('mousedown', initResize);
        th.appendChild(resizeHandle);
        
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    currentTable.appendChild(thead);
    
    // Create data rows
    const tbody = document.createElement("tbody");
    
    displayData.forEach(row => {
        const tr = document.createElement("tr");
        
        visibleColumns.forEach(column => {
            const td = document.createElement("td");
            const contentDiv = document.createElement("div");
            contentDiv.className = "cell-content";
            contentDiv.textContent = row[column] || '';
            td.appendChild(contentDiv);
            tr.appendChild(td);
        });
        
        tbody.appendChild(tr);
    });
    
    currentTable.appendChild(tbody);
    tableContainer.appendChild(currentTable);
    
    // Apply default settings
    applyDefaultColumnWidth();
    applyRowHeight();
    
    // Setup synchronized scrolling
    setupSyncScroll();
}

// Setup synchronized scrolling between header and table
function setupSyncScroll() {
    // Set the scroll width to match the table width
    headerScrollInner.style.width = `${tableContainer.scrollWidth}px`;
    
    // Synchronize scrolling
    headerScroll.addEventListener('scroll', function() {
        tableWrapper.scrollLeft = this.scrollLeft;
    });
    
    tableWrapper.addEventListener('scroll', function() {
        headerScroll.scrollLeft = this.scrollLeft;
    });
    
    // Update scroll width when columns are resized
    const observer = new MutationObserver(() => {
        headerScrollInner.style.width = `${tableContainer.scrollWidth}px`;
    });
    
    observer.observe(tableContainer, {
        childList: true,
        subtree: true,
        attributes: true
    });
}

// Column resizing functionality
function initResize(e) {
    isResizing = true;
    currentResizeColumn = e.target.parentElement;
    startX = e.clientX;
    startWidth = currentResizeColumn.offsetWidth;
    
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', stopResize);
    
    e.preventDefault();
}

function handleResize(e) {
    if (!isResizing) return;
    
    const width = startWidth + (e.clientX - startX);
    currentResizeColumn.style.width = `${width}px`;
    
    // Update all cells in this column
    const columnIndex = currentResizeColumn.cellIndex;
    const rows = currentTable.querySelectorAll('tr');
    
    rows.forEach(row => {
        const cell = row.cells[columnIndex];
        if (cell) {
            cell.style.width = `${width}px`;
        }
    });
    
    // Update scroll width
    headerScrollInner.style.width = `${tableContainer.scrollWidth}px`;
}

function stopResize() {
    isResizing = false;
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', stopResize);
}

// Apply default column width
function applyDefaultColumnWidth() {
    if (!currentTable) return;
    
    const width = defaultColWidthInput.value + 'px';
    const headers = currentTable.querySelectorAll('th');
    const rows = currentTable.querySelectorAll('tr');
    
    headers.forEach((header, index) => {
        header.style.width = width;
        
        rows.forEach(row => {
            const cell = row.cells[index];
            if (cell) {
                cell.style.width = width;
            }
        });
    });
    
    // Update scroll width
    headerScrollInner.style.width = `${tableContainer.scrollWidth}px`;
}

// Apply row height
function applyRowHeight() {
    if (!currentTable) return;
    
    const height = rowHeightInput.value + 'px';
    const rows = currentTable.querySelectorAll('tr');
    
    rows.forEach(row => {
        row.style.height = height;
    });
}

// Reset table layout
function resetTableLayout() {
    defaultColWidthInput.value = 150;
    rowHeightInput.value = 30;
    applyDefaultColumnWidth();
    applyRowHeight();
}
