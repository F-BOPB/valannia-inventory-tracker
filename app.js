const SOLANA_RPC_URL = "https://solana-mainnet.g.alchemy.com/v2/etYPr5YIk-NByShZmO7l0Pna6SnOtNwt";

let trackedWallets = JSON.parse(localStorage.getItem("trackedWallets")) || [];// Initialize trackedWallets from localStorage or as an empty array
let valanniaTokens = [];// Global variable to store Valannia tokens

// Function to load valanniaTokens.json
async function loadValanniaTokens() {
    try {
        let response = await fetch("data/valanniaTokens.json"); // Fetch JSON file
        valanniaTokens = await response.json(); // Convert response to JavaScript object
    } catch (error) {
    }
}

// Run this function when the page loads
window.onload = async function () {
    console.log("🚀 Valannia Inventory Tracker Loaded!");
    await loadValanniaTokens(); 
    loadWallets();
    await fetchAllSolBalances(); 
    // ✅ Fetch SPL balances and display them immediately
    const solBalances = await fetchAllSolBalances(); // Fetch and display SOL balances  
    const filteredBalances = await fetchAllSplBalances(); // Fetch and display SPL balances  
    displayFilteredTokenBalances(filteredBalances);
};

//////////////////////////////// FETCHING BALANCE ///////////////////////
// ✅ Fetch SOL Balances for a Specific Wallet
async function getSolBalance(walletAddress) {
    try {
        let response = await fetch(SOLANA_RPC_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method: "getBalance",
                params: [walletAddress]
            })
        });

        let data = await response.json();

        if (data.result && data.result.value !== undefined) {
            let solBalance = (data.result.value / 1_000_000_000).toFixed(5); // Convert and limit to 5 decimals
            return solBalance;
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
}

// ✅ Function to fetch SOL balances for all tracked wallets
async function fetchAllSolBalances() {
    let balances = {}; // Create an object to store balances

    for (let wallet of trackedWallets) {
        let solBalance = await getSolBalance(wallet); // Fetch balance
        balances[wallet] = solBalance !== null ? solBalance : "⚠️ Error"; // Store result
    }

        return balances; // Return the balance object
}

// ✅ Fetch SPL Token Balances for a Specific Wallet
async function getSplBalances(walletAddress) {
    try {
        let response = await fetch(SOLANA_RPC_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method: "getTokenAccountsByOwner",
                params: [
                    walletAddress,
                    { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
                    { encoding: "jsonParsed" }
                ]
            })
        });

        let data = await response.json();

        if (!data.result || !data.result.value) {
            return {};
        }

        let balances = {};
        for (let account of data.result.value) {
            let mintAddress = account.account.data.parsed.info.mint;
            let amount = account.account.data.parsed.info.tokenAmount.uiAmount;

            // ✅ Check if the token is in valanniaTokens.json
            if (valanniaTokens.some(token => token.mint === mintAddress)) {
                balances[mintAddress] = amount;
            }
        }

        return balances;
    } catch (error) {       
        return {};
    }
}

// ✅ Function to filter out non-Valannia tokens
function filterValanniaTokens(allBalances) {
    let filtered = {};

    for (const mintAddress in allBalances) {
        // ✅ Check if the token exists in valanniaTokens list
        let tokenData = valanniaTokens.find(token => token.mint === mintAddress);
        
        if (tokenData) {
            // Ensure that the balances for each wallet exist, even if 0
            let walletBalances = {};
            for (const wallet of trackedWallets) {
            walletBalances[wallet] = allBalances[mintAddress].balances[wallet] || 0; // Default to 0 if undefined
            }
            
            // ✅ Include only Valannia tokens and attach metadata
            filtered[mintAddress] = {
                name: tokenData.name,
                icon: tokenData.icon,
                category: tokenData.category,
                balances: allBalances[mintAddress].balances
            };
        }
    }

    return filtered;
}

// ✅ Fetch SPL token balances for all tracked wallets
async function fetchAllSplBalances() {
    let allBalances = {}; 

    for (const wallet of trackedWallets) {  
        let walletBalances = await getSplBalances(wallet);

        for (const mintAddress in walletBalances) {
            if (!allBalances[mintAddress]) {
                allBalances[mintAddress] = { balances: {} };
            }
            // ✅ Store actual balance
            allBalances[mintAddress].balances[wallet] = walletBalances[mintAddress] || 0;
        }
    }

    // ✅ Ensure every token has an entry for all wallets, even if they hold 0
    for (const mintAddress in allBalances) {
        for (const wallet of trackedWallets) {
            if (!allBalances[mintAddress].balances[wallet]) {
                allBalances[mintAddress].balances[wallet] = 0;
            }
        }
    }
      
    let filteredBalances = filterValanniaTokens(allBalances); // ✅ Apply filtering mechanism (only show Valannia tokens)
     
    return filteredBalances; // ✅ Return the filteredBalances
}

// ✅ Function to load wallets from localStorage when the page loads
function loadWallets() {
    let storedWallets = localStorage.getItem("trackedWallets"); // Get saved wallets
    trackedWallets = storedWallets ? JSON.parse(storedWallets) : []; // Convert to an array

    if (!Array.isArray(trackedWallets)) {
        trackedWallets = []; // ✅ Ensure it's an array
    }

    displayWallets(); // ✅ Update the UI with loaded wallets
        // ✅ Disable Add Wallet button if 10 wallets are already added
        let addWalletBtn = document.getElementById("addWalletBtn");
        if (trackedWallets.length >= 10) {
            addWalletBtn.disabled = true;
            addWalletBtn.classList.add("opacity-50", "cursor-not-allowed");
        }
    
}

//////////////////////////////// TRACKED WALLET  ///////////////////////
// ✅ Function to add new wallets
async function addWallet() {
    let walletInput = document.getElementById("walletInput"); // Get input field
    let walletAddress = walletInput.value.trim(); // Get entered address and remove extra spaces
    let addWalletBtn = document.getElementById("addWalletBtn"); // Get Add Wallet button
// Condition:
    if (!walletAddress) {alert("⚠️ Please enter a wallet address!"); return;}
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(walletAddress)) {alert("❌ Invalid Solana wallet address!"); return;}

     // Show loading message while adding wallet
     document.getElementById("loadingMessage").classList.remove("hidden");

    // ✅ Ensure we have an up-to-date array of wallets
    let wallets = JSON.parse(localStorage.getItem("trackedWallets")) || [];

    if (wallets.length >= 10) {return;}// Do nothing if 10 wallets are already added

    if (!wallets.includes(walletAddress)) {
        wallets.push(walletAddress); // ✅ Add to the array
        localStorage.setItem("trackedWallets", JSON.stringify(wallets)); // ✅ Save to localStorage  
        trackedWallets = wallets; // ✅ Update the global `trackedWallets` array
        displayWallets(); // ✅ Update UI immediately
        
        // ✅ After adding the wallet, fetch all SPL balances again to update the table
        await fetchAllSplBalances(); // Fetch new balances for all wallets
        const filteredBalances = await fetchAllSplBalances(); // Ensure the balances are freshly updated
        displayFilteredTokenBalances(filteredBalances); // Update table with all wallets' balances
    } else {
        alert(`⚠️ Wallet ${walletAddress} is already being tracked!`);
    }

    walletInput.value = ""; // ✅ Clear input field

    // ✅ Disable Add Wallet button if limit is reached
    if (wallets.length >= 10) {
        addWalletBtn.disabled = true;
        addWalletBtn.classList.add("opacity-50", "cursor-not-allowed"); // Add styling for disabled button
    }
     // Hide loading message after the operation
     document.getElementById("loadingMessage").classList.add("hidden");
}

// ✅ Function to display wallets in the Tracked Wallet Section (address & remove button)
function displayWallets() {
    let walletList = document.getElementById("wallets");  // Get the <ul> where wallets are displayed
    walletList.innerHTML = ""; // Clear the list to avoid duplicates

    for (let wallet of trackedWallets) {
        let listItem = document.createElement("li"); // Create a new list item <li>
        listItem.style.fontSize = "0.875rem"; // Smaller font size (14px)

        // ✅ Create a span for the wallet address
        let walletSpan = document.createElement("span");
        walletSpan.textContent = wallet;

        // ✅ Create a Remove button
        let removeButton = document.createElement("button");
        removeButton.textContent = "❌ Remove";
        removeButton.style.fontSize = "0.7rem";
        removeButton.className = "ml-2 text-red-500"; // Small red button
        removeButton.onclick = function () { removeWallet(wallet); };

        // ✅ Append elements
        listItem.appendChild(walletSpan);
        listItem.appendChild(removeButton);
        walletList.appendChild(listItem);
    }
}

// ✅ Function to remove a wallet
function removeWallet(walletAddress) {
    // Show loading message while removing wallet
    document.getElementById("loadingMessage").classList.remove("hidden");

    // Remove the wallet from the trackedWallets array
    trackedWallets = trackedWallets.filter(wallet => wallet !== walletAddress);
    localStorage.setItem("trackedWallets", JSON.stringify(trackedWallets)); // Save updated list to localStorage
    displayWallets(); // Update the UI

    // Fetch updated balances after removing a wallet
    fetchAllSolBalances().then(async () => {
        const filteredBalances = await fetchAllSplBalances(); // Fetch SPL balances again after removing the wallet
        displayFilteredTokenBalances(filteredBalances); // Update the table with the new filtered balances
    });

    // Enable Add Wallet button if the wallet count is below 10
    let addWalletBtn = document.getElementById("addWalletBtn");
    if (trackedWallets.length < 10) {
        addWalletBtn.disabled = false;
        addWalletBtn.classList.remove("opacity-50", "cursor-not-allowed");
    }
    // Hide loading message after the operation
    document.getElementById("loadingMessage").classList.add("hidden");
}

///////////////////////////////// DYNAMIC TABLE /////////////////////////
// Function to shorten wallet address to the first 4 and last 4 characters
function shortenAddress(address) {
    if (!address) return '';
    return address.slice(0, 4) + "...";
}

// Table
async function displayFilteredTokenBalances(filteredBalances) {
    let inventoryTable = document.getElementById("inventoryTable"); // ✅ Get the table body
    inventoryTable.innerHTML = ""; // ✅ Clear clears any existing rows in the table before adding new ones.

    // Check if filteredBalances is empty or undefined
    if (!filteredBalances || Object.keys(filteredBalances).length === 0) {
        let noDataRow = document.createElement("tr");
        let noDataCell = document.createElement("td");
        noDataCell.colSpan = 5; // Span across all columns
        noDataCell.textContent = "No Valannia tokens found.";
        noDataRow.appendChild(noDataCell);
        inventoryTable.appendChild(noDataRow);
        return; // Exit the function early if no tokens
    }

    // Get the list of wallets dynamically from the first token
    const wallets = Object.keys(filteredBalances[Object.keys(filteredBalances)[0]].balances);

    // Ensure we have a valid list of wallets to display
    if (wallets.length === 0) {
        let noWalletsRow = document.createElement("tr");
        let noWalletsCell = document.createElement("td");
        noWalletsCell.colSpan = 5; // Span across all columns
        noWalletsCell.textContent = "No wallets found.";
        noWalletsRow.appendChild(noWalletsCell);
        inventoryTable.appendChild(noWalletsRow);
        return;
    }

    // Create the header row with wallet addresses as columns
    let headerRow = document.createElement("tr");
    headerRow.className = "border-b border-gray-700"; // Styling for header row

    // Create a placeholder column for token names
    let nameHeaderCell = document.createElement("th");
    nameHeaderCell.className = "p-3 text-center";
    nameHeaderCell.textContent = "Items"; // Column for token names
    headerRow.appendChild(nameHeaderCell);

    // Create the "Total" header column
    let totalHeaderCell = document.createElement("th");
    totalHeaderCell.className = "p-3 text-center";
    totalHeaderCell.textContent = "Total"; // Column for total quantity
    headerRow.appendChild(totalHeaderCell);

    // Create wallet header columns
    for (const wallet of wallets) {
        let shortenedWalletAddress = shortenAddress(wallet);  // Shorten the wallet address
        let walletHeaderCell = document.createElement("th");
        walletHeaderCell.className = "p-3 text-center";
        walletHeaderCell.textContent = shortenedWalletAddress; // Set shortened address in header
        headerRow.appendChild(walletHeaderCell);
    }

    // Append the header row to the table
    inventoryTable.appendChild(headerRow);

    let headers = inventoryTable.rows[0].cells;
    for (let i = 0; i < headers.length; i++) {
    headers[i].addEventListener("click", function () {
        let isNumeric = i !== 0; // ✅ Items column is text, others are numbers
        sortTable(i, isNumeric);
    });
    }



    // ✅ Create the SOL balance row at the top
    let solRow = document.createElement("tr");
    solRow.className = "border-b border-gray-700";
    
    let solLabelCell = document.createElement("td");
    solLabelCell.className = "p-3 text-center";
    solLabelCell.textContent = "SOL Balance"; // Label for the SOL row
    solRow.appendChild(solLabelCell);

    // Add "SOL" for each wallet column in the header
    let totalSolCell = document.createElement("td");
    totalSolCell.className = "p-3 text-center";
    totalSolCell.textContent = ""; // Empty space for Total column in SOL row
    solRow.appendChild(totalSolCell);

    // Loop over wallets to fetch and display SOL balance in this row
    for (const wallet of wallets) {
        let solBalance = await getSolBalance(wallet); // Fetch the SOL balance (assuming async function)
        let solBalanceCell = document.createElement("td");
        solBalanceCell.className = "p-3 text-center";
        solBalanceCell.textContent = solBalance.toLocaleString(); // Display SOL balance
        solRow.appendChild(solBalanceCell);
    }

    // Append the SOL balance row to the table
    inventoryTable.appendChild(solRow);


    // Loop through each token in the filtered balances
    for (const mintAddress in filteredBalances) {
        let tokenData = filteredBalances[mintAddress]; // ✅ Get token data

        // ✅ Calculate total quantity across all wallets
        let totalQuantity = Object.values(tokenData.balances).reduce((sum, balance) => sum + balance, 0);

        // ✅ Only proceed if totalQuantity is greater than 0
        if (totalQuantity <= 0) {
            continue; // Skip this token if the total balance is 0
        }

        // ✅ Create the row for each token
        let row = document.createElement("tr");
        row.className = "border-b border-gray-700";

        // ✅ Create the first column: Token Name (with Solscan link and icon)
        let nameCell = document.createElement("td");
        nameCell.className = "p-3 flex items-center gap-2";

        let icon = document.createElement("img"); // Token icon
        icon.src = tokenData.icon;
        icon.alt = tokenData.name;
        icon.className = "w-6 h-6 rounded";

        let link = document.createElement("a"); // Solscan link
        link.href = `https://solscan.io/token/${mintAddress}`;
        link.target = "_blank";
        link.className = "text-blue-400 hover:underline";
        link.textContent = tokenData.name;

        nameCell.appendChild(icon);
        nameCell.appendChild(link);
        row.appendChild(nameCell);

        // ✅ Create the second column: Total Quantity
        let totalCell = document.createElement("td");
        totalCell.className = "p-3 text-center";
        totalCell.textContent = totalQuantity.toLocaleString(); // Format for readability
        row.appendChild(totalCell);

        // ✅ Create wallet balance columns dynamically for each wallet
        // Loop over wallets and display the token balances
        for (const wallet of wallets) {
            let walletCell = document.createElement("td");
            walletCell.className = "p-3 text-center";
            // Check if the wallet has a balance for this token, else show 0 or "No balance"
            let walletBalance = tokenData.balances[wallet] || 0; // Default to 0 if not found
            walletCell.textContent = walletBalance.toLocaleString(); // Format for readability
            row.appendChild(walletCell);
        }

        // Append the row to the table
        inventoryTable.appendChild(row);
    }

    // Reinitialize header sorting event listeners
    setupSorting();

}


// ===========================
// Sorting Functionality
// ===========================
// Adds click event listeners to table headers to enable sorting.
//Determines if the column contains text or numbers for correct sorting.

function setupSorting() {
    let inventoryTable = document.getElementById("inventoryTable");
    if (!inventoryTable) return; // Ensure table exists
    
    let headers = inventoryTable.rows[0].cells;

    for (let i = 0; i < headers.length; i++) {
        headers[i].addEventListener("click", function () {
            let isNumeric = i !== 0; // ✅ Items column is text, others are numbers
            sortTable(i, isNumeric);
        });
    }
}
// Sorts the table when a column header is clicked.
function sortTable(columnIndex, isNumeric) {
    let inventoryTable = document.getElementById("inventoryTable");
    if (!inventoryTable) return; // Ensure table exists
    
    let tbody = inventoryTable.getElementsByTagName("tbody")[0];
    if (!tbody) return; // Ensure tbody exists
    
    let rows = Array.from(tbody.getElementsByTagName("tr")).filter(row => row instanceof HTMLTableRowElement); // Ensure valid rows

    // Check the current sorting order and toggle it
    let ascending = inventoryTable.dataset.sortColumn == columnIndex && inventoryTable.dataset.sortOrder == "asc";
    inventoryTable.dataset.sortColumn = columnIndex;
    inventoryTable.dataset.sortOrder = ascending ? "desc" : "asc";

    // Perform sorting
    rows.sort((rowA, rowB) => {
        let cellA = rowA.cells[columnIndex]?.textContent.trim() || "";
        let cellB = rowB.cells[columnIndex]?.textContent.trim() || "";

        if (isNumeric) {
            return (parseFloat(cellA) - parseFloat(cellB)) * (ascending ? 1 : -1);
        } else {
            return cellA.localeCompare(cellB) * (ascending ? 1 : -1);
        }
    });

    // Clear and re-append sorted rows to tbody
    tbody.innerHTML = "";
    for (let row of rows) {
        if (row instanceof HTMLTableRowElement) {
            tbody.appendChild(row);
        }
    }
}


////////////////////////////// REFRESH BUTTON ////////////////////////////////
async function refreshBalances() {
    console.log("🔄 Refreshing all balances...");

    // Disable button and show loading state
    const refreshButton = document.getElementById("refreshButton");
    refreshButton.disabled = true;
    refreshButton.style.opacity = "0.6";
    refreshButton.innerHTML = `<span id="refreshIcon" class="spin">🔄</span> Refreshing...`;

    try {
        let solBalances = await fetchAllSolBalances(); // Refresh SOL balances
        let splBalances = await fetchAllSplBalances(); // Refresh SPL token balances
        let filteredBalances = filterValanniaTokens(splBalances); // Apply filtering to SPL tokens
        displayFilteredTokenBalances(filteredBalances); // Update table with new data
    } catch (error) {
        console.error("Error refreshing balances:", error);
    }

    // Re-enable button and restore text after completion
    refreshButton.disabled = false;
    refreshButton.style.opacity = "1";
    refreshButton.innerHTML = `<span id="refreshIcon">🔄</span> Refresh Balances`;
}

// Attach event listener on DOM load
document.addEventListener("DOMContentLoaded", () => {
    const refreshButton = document.getElementById("refreshButton");
    if (refreshButton) {
        refreshButton.addEventListener("click", refreshBalances);
    }
});
