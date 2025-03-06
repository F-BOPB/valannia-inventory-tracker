// Global object to persist sort order per column
let sortOrder = {};

// Function to set up sorting event listeners on table headers
function setupSorting() {
    const tableHeaders = document.querySelectorAll("#inventoryTable th");
    tableHeaders.forEach((header, index) => {
        header.style.cursor = "pointer"; // Indicate clickable headers

        // Initialize sort order for this column if not already set
        if (!sortOrder.hasOwnProperty(index)) {
            sortOrder[index] = "asc"; // default is ascending
        }

        header.addEventListener("click", () => {
            // Toggle sort order for this column
            sortOrder[index] = sortOrder[index] === "asc" ? "desc" : "asc";
            const ascending = sortOrder[index] === "asc";
            sortTable(index, index !== 0, ascending);
            updateSortingIndicator(header, ascending);
        });
    });

    // On first load, sort by the "Total" column (assumed index 1) in descending order:
    const totalColumnIndex = 1; // Change if needed
    sortOrder[totalColumnIndex] = "desc";
    sortTable(totalColumnIndex, true, false); // false means descending
    // Also update the indicator on that header:
    const headers = document.querySelectorAll("#inventoryTable th");
    if (headers[totalColumnIndex]) {
        updateSortingIndicator(headers[totalColumnIndex], false);
    }
}

// Function to sort the table by the selected column
function sortTable(columnIndex, isNumeric, ascending) {
    const tableBody = document.getElementById("inventoryTable");
    if (!tableBody) {
        console.error("Error: inventoryTable not found!");
        return;
    }
    
    // Get all rows from the table body
    const rows = Array.from(tableBody.querySelectorAll("tr"));
    
    // Extract the header row (assumed to be the first row)
    const headerRow = rows.shift();
    
    // Identify the SOL Balance row by checking if its first cell text equals "sol balance" (case-insensitive)
    const solRow = rows.find(row => {
        const text = row.children[0]?.textContent.trim().toLowerCase();
        return text === "sol balance";
    });
    
    // Exclude the SOL row from sorting; sort only the token rows
    const tokenRows = rows.filter(row => row !== solRow);
    
    // Sorting logic: If sorting the first column ("Items"), do alphabetical; otherwise, do numerical
    tokenRows.sort((a, b) => {
        const cellA = a.children[columnIndex]?.textContent.trim() || "";
        const cellB = b.children[columnIndex]?.textContent.trim() || "";
        
        if (columnIndex === 0) {
            return ascending ? cellA.localeCompare(cellB) : cellB.localeCompare(cellA);
        }
        
        const numA = parseFloat(cellA.replace(/,/g, "")) || 0;
        const numB = parseFloat(cellB.replace(/,/g, "")) || 0;
        return ascending ? numA - numB : numB - numA;
    });
    
    // Clear the table body and re-add rows in order:
    tableBody.innerHTML = "";
    if (headerRow) tableBody.appendChild(headerRow);
    if (solRow) tableBody.appendChild(solRow);
    tokenRows.forEach(row => {
        if (row instanceof Node) {
            tableBody.appendChild(row);
        } else {
            console.error("Invalid node:", row);
        }
    });
}

// Function to update the sorting indicator (arrows) in the header
function updateSortingIndicator(activeHeader, ascending) {
    // Remove existing arrows from all headers and restore original text
    document.querySelectorAll("#inventoryTable th").forEach(th => {
        let originalText = th.getAttribute("data-name") || th.textContent.replace(" ▲", "").replace(" ▼", "");
        th.textContent = originalText;
    });

    // Add arrow to the active header
    activeHeader.textContent += ascending ? " ▲" : " ▼";
}

// Initialize sorting (this should be called after the dynamic table is built)
setupSorting();
