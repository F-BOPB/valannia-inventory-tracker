const SOLANA_RPC_URL = "https://solana-mainnet.g.alchemy.com/v2/etYPr5YIk-NByShZmO7l0Pna6SnOtNwt";

let walletGroups = JSON.parse(localStorage.getItem("walletGroups")) || {
    "group-1": {
        name: "Default",
        wallets: []
    }
};
let activeWalletGroup = localStorage.getItem("activeWalletGroup") || "group-1";
let valanniaTokens = [];// Global variable to store Valannia tokens
let isEditMode = false;

// Function to load valanniaTokens.json
async function loadValanniaTokens() {
    try {
        let response = await fetch("data/valanniaTokens.json"); // Fetch JSON file
        valanniaTokens = await response.json(); // Convert response to JavaScript object
    } catch (error) {
    }
}

// Populate Filter Dropdowns Dynamically
function populateDropdownFilters() {
    const categories = new Set();
    const tiers = new Set();
    const professions = new Set();

    for (const token of valanniaTokens) {
        if (token.category) categories.add(token.category.trim());
        if (token.tier) tiers.add(token.tier.trim());
        if (token.profession) professions.add(token.profession.trim());
    }

    // Helper to populate a select element
    function fillDropdown(selectId, values) {
        const select = document.getElementById(selectId);
        if (!select) return;

        // Remove any previous options except the first (e.g., "All Categories")
        select.innerHTML = select.innerHTML.split('</option>')[0] + '</option>';

        [...values].sort().forEach(value => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    fillDropdown("categoryFilter", categories);
    fillDropdown("tierFilter", tiers);
    fillDropdown("professionFilter", professions);

        // Populate Recipe Filter
        const recipeSelect = document.getElementById("recipeFilter");
        if (recipeSelect && typeof tyxenMachineRecipes !== "undefined") {
            // Remove any previous options except the first ("All Recipes")
            recipeSelect.innerHTML = recipeSelect.innerHTML.split('</option>')[0] + '</option>';
    
            for (const recipe of tyxenMachineRecipes) {
                const option = document.createElement("option");
                option.value = recipe.name;
                option.textContent = recipe.name;
                recipeSelect.appendChild(option);
            }
        }
    
}

function setupFilterPersistence() {
    const categoryFilter = document.getElementById("categoryFilter");
    const tierFilter = document.getElementById("tierFilter");
    const professionFilter = document.getElementById("professionFilter");
    const recipeFilter = document.getElementById("recipeFilter");
    const favoritesOnlyCheckbox = document.getElementById("favoritesOnly");

    if (categoryFilter) {
        categoryFilter.addEventListener("change", () => {
            localStorage.setItem("selectedCategory", categoryFilter.value);
            filterTable(); // ✅ Just re-filter
        });
    }

    if (tierFilter) {
        tierFilter.addEventListener("change", () => {
            localStorage.setItem("selectedTier", tierFilter.value);
            filterTable(); // ✅ Just re-filter
        });
    }

    if (professionFilter) {
        professionFilter.addEventListener("change", () => {
            localStorage.setItem("selectedProfession", professionFilter.value);
            filterTable(); // ✅ Just re-filter
        });
    }

    if (favoritesOnlyCheckbox) {
        favoritesOnlyCheckbox.addEventListener("change", () => {
            localStorage.setItem("favoritesOnly", favoritesOnlyCheckbox.checked ? "true" : "false");
            filterTable(); // ✅ Just re-filter
        });
    }

    if (recipeFilter) {
        recipeFilter.addEventListener("change", () => {
            localStorage.setItem("selectedRecipe", recipeFilter.value);
            filterTable(); // ✅ Recipe still needs a refresh for now
        });
    }
}

function applySavedFilters() {
    const savedCategory = localStorage.getItem("selectedCategory");
    const savedTier = localStorage.getItem("selectedTier");
    const savedProfession = localStorage.getItem("selectedProfession");
    const savedRecipe = localStorage.getItem("selectedRecipe");
    const savedFavoritesOnly = localStorage.getItem("favoritesOnly");

    if (savedCategory) {
        const categoryFilter = document.getElementById("categoryFilter");
        if (categoryFilter) categoryFilter.value = savedCategory;
    }

    if (savedTier) {
        const tierFilter = document.getElementById("tierFilter");
        if (tierFilter) tierFilter.value = savedTier;
    }

    if (savedProfession) {
        const professionFilter = document.getElementById("professionFilter");
        if (professionFilter) professionFilter.value = savedProfession;
    }

    if (savedRecipe) {
        const recipeFilter = document.getElementById("recipeFilter");
        if (recipeFilter) recipeFilter.value = savedRecipe;
    }

    if (savedFavoritesOnly) {
        const favoritesOnlyCheckbox = document.getElementById("favoritesOnly");
        if (favoritesOnlyCheckbox) favoritesOnlyCheckbox.checked = savedFavoritesOnly === "true";
    }
}

async function refreshInventory() {
    const solBalances = await fetchAllSolBalances();
    const splBalances = await fetchAllSplBalances();
    const filteredBalances = filterValanniaTokens(splBalances);

    displayFilteredTokenBalances(filteredBalances); // Build full table
    filterTable(); // After building, immediately apply user filters (saved from localStorage)
}

// Run this function when the page loads
window.onload = async function () {
    console.log("🚀 Valannia Inventory Tracker Loaded!");
    renderWalletGroupTabs();
    await loadValanniaTokens();
    await loadTyxenRecipes();
    populateDropdownFilters();
    applySavedFilters();
    setupFilterPersistence();
    loadWallets();
    await fetchAllSolBalances();

    // 🚨 Always fetch the FULL SPL balances
    const splBalances = await fetchAllSplBalances(); // Do not apply localStorage filter yet

    const filteredBalances = filterValanniaTokens(splBalances); // Only remove non-Valannia tokens
    displayFilteredTokenBalances(filteredBalances); // 🚨 Build the full table first

    filterTable(); // 🚨 After full table is built, apply user-selected filters (hide/show rows)
};

// ✅ Hook up the Edit button after the DOM is ready
document.getElementById("toggleEditModeBtn").onclick = () => {
    isEditMode = !isEditMode;

    const toggleBtn = document.getElementById("toggleEditModeBtn");
    const hint = document.getElementById("editModeHint");

    toggleBtn.textContent = isEditMode ? "done √" : "edit";
    toggleBtn.setAttribute("aria-pressed", isEditMode.toString());
    hint.classList.toggle("hidden", !isEditMode); // Show/hide the hint


    renderWalletGroupTabs(); // Re-render tabs with delete buttons if needed
};


//////////////////////////////// Favorit Toggle and storage  ///////////////////////
function getFavoriteTokens() {
    return JSON.parse(localStorage.getItem("favoriteTokens") || "[]");
}

function toggleFavorite(mintAddress) {
    let favorites = getFavoriteTokens();
    const index = favorites.indexOf(mintAddress);
    const isNowFavorite = index === -1;

    // Update the favoriteTokens list
    if (isNowFavorite) {
        favorites.push(mintAddress);
    } else {
        favorites.splice(index, 1);
    }
    localStorage.setItem("favoriteTokens", JSON.stringify(favorites));

    // Update the button icon without reloading the table
    const allRows = document.querySelectorAll(`#inventoryTable tr`);
    for (let row of allRows) {
        const link = row.querySelector(`a[href*="${mintAddress}"]`);
        if (!link) continue;

        const starBtn = row.querySelector("button");
        if (starBtn) {
            starBtn.textContent = isNowFavorite ? "★" : "☆";
            starBtn.classList.remove("text-yellow-400", "text-gray-500");
            starBtn.classList.add(isNowFavorite ? "text-yellow-400" : "text-gray-500");


        }

        row.dataset.favorite = isNowFavorite ? "true" : "false";
    }

    // If the user is filtering by favorites, we must re-filter the table
    const favoritesOnly = document.getElementById("favoritesOnly");
    if (favoritesOnly && favoritesOnly.checked) {
        filterTable();
    }
}

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

    const trackedWallets = walletGroups[activeWalletGroup]?.wallets || [];

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
            const trackedWallets = walletGroups[activeWalletGroup]?.wallets || [];
            for (const wallet of trackedWallets) {
                walletBalances[wallet] = allBalances[mintAddress].balances[wallet];
            }
            
            // ✅ Include only Valannia tokens and attach metadata
            filtered[mintAddress] = {
                name: tokenData.name,
                icon: tokenData.icon,
                category: tokenData.category,
                tier: tokenData.tier,
                profession: tokenData.profession,
                balances: allBalances[mintAddress].balances
            };
        }
    }
    
    // Ensure ALL tokens from valanniaTokens.json are present in the filtered result
    for (const token of valanniaTokens) {
        const mint = token.mint;
        if (!filtered[mint]) {
            const zeroBalances = {};
            const trackedWallets = walletGroups[activeWalletGroup]?.wallets || [];
            for (const wallet of trackedWallets) {
                zeroBalances[wallet] = { balance: 0, accountExists: false };

            }

            filtered[mint] = {
                name: token.name,
                icon: token.icon,
                category: token.category,
                tier: token.tier,
                profession: token.profession,
                balances: zeroBalances
            };
        }
    }

    return filtered;
}

// ✅ Fetch SPL token balances for all tracked wallets
async function fetchAllSplBalances() {
    let allBalances = {}; 

    const trackedWallets = walletGroups[activeWalletGroup]?.wallets || [];

    for (const wallet of trackedWallets) {  
        let walletBalances = await getSplBalances(wallet);

        for (const mintAddress in walletBalances) {
            if (!allBalances[mintAddress]) {
                allBalances[mintAddress] = { balances: {} };
            }
            allBalances[mintAddress].balances[wallet] = walletBalances[mintAddress] || 0;
        }
    }

    // Ensure every token has an entry for all wallets, even if they hold 0
    for (const mintAddress in allBalances) {
        for (const wallet of trackedWallets) {
            if (allBalances[mintAddress].balances[wallet] === undefined) {
                allBalances[mintAddress].balances[wallet] = { balance: 0, accountExists: false };
            } else {
                allBalances[mintAddress].balances[wallet] = {
                    balance: allBalances[mintAddress].balances[wallet],
                    accountExists: true
                };
            }
        }
    }

    let filteredBalances = filterValanniaTokens(allBalances);     
    return filteredBalances;
}

// ✅ Function to load wallets from localStorage when the page loads
function loadWallets() {
    // Get wallets from the currently active group
    const group = walletGroups[activeWalletGroup];
    const trackedWallets = group ? group.wallets : [];

    displayWallets(trackedWallets);

    // Disable Add Wallet button if 10 wallets are already added
    const addWalletBtn = document.getElementById("addWalletBtn");
    if (trackedWallets.length >= 10) {
        addWalletBtn.disabled = true;
        addWalletBtn.classList.add("opacity-50", "cursor-not-allowed");
    } else {
        addWalletBtn.disabled = false;
        addWalletBtn.classList.remove("opacity-50", "cursor-not-allowed");
    }
}

//////////////////////////////// TRACKED WALLET  ///////////////////////
function renderWalletGroupTabs() {
    const container = document.getElementById("walletGroupTabs");
    container.innerHTML = "";

    const groupIds = Object.keys(walletGroups);

    groupIds.forEach((groupId, index) => {
        const group = walletGroups[groupId];
        const isActive = groupId === activeWalletGroup;

        const tabWrapper = document.createElement("div");
        tabWrapper.className = `inline-block ${
            index !== 0 ? "border-l-4 border-gray-700 ml-2 pl-4" : ""
        }`;

        const tab = document.createElement("div");
        tab.className = `text-sm pb-1 border-b-2 cursor-pointer inline-flex items-center gap-2 ${
            isActive
                ? "border-blue-500 text-blue-400 font-semibold"
                : "border-transparent text-gray-400 hover:text-blue-300"
        }`;

        const nameSpan = document.createElement("span");
        nameSpan.textContent = group.name || groupId;
        nameSpan.className = "cursor-pointer";

        let isEditing = false;

        nameSpan.ondblclick = (e) => {
            e.stopPropagation(); // prevent tab click while editing
            if (isEditing) return;
            isEditing = true;

            const input = document.createElement("input");
            input.type = "text";
            input.value = group.name || groupId;
            input.className = "text-sm bg-gray-900 text-white px-1 rounded w-32";

            const confirmBtn = document.createElement("button");
            confirmBtn.textContent = "✔️";
            confirmBtn.className = "ml-1 text-green-400 hover:text-green-300 text-xs align-top";

            confirmBtn.onclick = (e) => {
                e.stopPropagation();
                const newName = input.value.trim();
                if (newName) {
                    walletGroups[groupId].name = newName;
                    localStorage.setItem("walletGroups", JSON.stringify(walletGroups));
                }
                renderWalletGroupTabs(); // Exit edit mode
            };

            nameSpan.replaceWith(input);
            input.after(confirmBtn);
            input.focus();
        };

        tab.onclick = () => {
            if (isEditMode) return; // Don't activate group in edit mode
            activeWalletGroup = groupId;
            localStorage.setItem("activeWalletGroup", groupId);
            renderWalletGroupTabs();
            loadWallets();
            refreshInventory();
        };

        tab.appendChild(nameSpan);

        // 🧨 Show delete icon when editing and it's not the active group
        if (isEditMode) {
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "❌";
            deleteBtn.className = "ml-2 text-red-400 hover:text-red-300 text-xs align-top";
            deleteBtn.title = `Delete "${group.name}"`;
        
            deleteBtn.onclick = (e) => {
                e.stopPropagation(); // prevent tab selection
        
                const confirmed = confirm(`Are you sure you want to delete group "${group.name}"?`);
                if (!confirmed) return;
        
                delete walletGroups[groupId];
        
                // Fallback to another group
                const remaining = Object.keys(walletGroups);
                activeWalletGroup = remaining.length > 0 ? remaining[0] : null;
        
                localStorage.setItem("walletGroups", JSON.stringify(walletGroups));
                localStorage.setItem("activeWalletGroup", activeWalletGroup || "");
        
                renderWalletGroupTabs();
                loadWallets();
                refreshInventory();
            };
        
            tab.appendChild(deleteBtn);
        }
        

        tabWrapper.appendChild(tab);
        container.appendChild(tabWrapper);
    });

    // ➕ New Group tab
    const createWrapper = document.createElement("div");
    createWrapper.className = "inline-block border-l-4 border-gray-700 ml-2 pl-4";

    const createBtn = document.createElement("button");
    createBtn.textContent = "➕ New Group";
    createBtn.className =
        "text-sm pb-1 border-b-2 border-transparent text-gray-400 hover:text-yellow-300";

    createBtn.onclick = () => {
        const name = prompt("Enter a name for the new group:");
        if (!name) return;

        const newId = `group-${Date.now()}`;
        walletGroups[newId] = {
            name: name.trim(),
            wallets: []
        };

        activeWalletGroup = newId;
        localStorage.setItem("walletGroups", JSON.stringify(walletGroups));
        localStorage.setItem("activeWalletGroup", newId);

        renderWalletGroupTabs();
        loadWallets();
        refreshInventory();
    };

    createWrapper.appendChild(createBtn);
    container.appendChild(createWrapper);
}



// ✅ Function to add new wallets
async function addWallet() {
    const walletInput = document.getElementById("walletInput");
    const walletAddress = walletInput.value.trim();
    const addWalletBtn = document.getElementById("addWalletBtn");

    if (!walletAddress) {
        alert("⚠️ Please enter a wallet address!");
        return;
    }

    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(walletAddress)) {
        alert("❌ Invalid Solana wallet address!");
        return;
    }

    document.getElementById("loadingMessage").classList.remove("hidden");

    // 🧠 Get current group's wallet list
    const group = walletGroups[activeWalletGroup];
    if (!group) {
        alert("⚠️ Invalid wallet group.");
        return;
    }

    const wallets = group.wallets;

    if (wallets.length >= 10) return; // max limit

    if (!wallets.includes(walletAddress)) {
        wallets.push(walletAddress); // Add to group
        walletGroups[activeWalletGroup].wallets = wallets; // Update in memory
        localStorage.setItem("walletGroups", JSON.stringify(walletGroups)); // Save to storage

        displayWallets(wallets);

        const filteredBalances = await fetchAllSplBalances();
        displayFilteredTokenBalances(filteredBalances);
    } else {
        alert(`⚠️ Wallet ${walletAddress} is already being tracked in this tab!`);
    }

    walletInput.value = "";

    if (wallets.length >= 10) {
        addWalletBtn.disabled = true;
        addWalletBtn.classList.add("opacity-50", "cursor-not-allowed");
    }

    document.getElementById("loadingMessage").classList.add("hidden");
}

// ✅ Function to display wallets in the Tracked Wallet Section (address & remove button)
function displayWallets(trackedWallets) {

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
        removeButton.textContent = "❌";
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
    document.getElementById("loadingMessage").classList.remove("hidden");

    const group = walletGroups[activeWalletGroup];
    if (!group) return;

    // Remove wallet from the current group's list
    group.wallets = group.wallets.filter(wallet => wallet !== walletAddress);
    localStorage.setItem("walletGroups", JSON.stringify(walletGroups)); // Save updated groups

    displayWallets(group.wallets); // Update the list visually

    fetchAllSolBalances().then(async () => {
        const filteredBalances = await fetchAllSplBalances();
        displayFilteredTokenBalances(filteredBalances);
    });

    const addWalletBtn = document.getElementById("addWalletBtn");
    if (group.wallets.length < 10) {
        addWalletBtn.disabled = false;
        addWalletBtn.classList.remove("opacity-50", "cursor-not-allowed");
    }

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
    const favoriteTokens = getFavoriteTokens();

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
    headerRow.className = "bg-[#141d2f] border-b border-gray-700"; // Styling for header row

    // Create a placeholder column for token names
    let nameHeaderCell = document.createElement("th");
    nameHeaderCell.className = "p-2 text-center";
    nameHeaderCell.textContent = "Items"; // Column for token names
    headerRow.appendChild(nameHeaderCell);

    // Create the "Total" header column
    let totalHeaderCell = document.createElement("th");
    totalHeaderCell.className = "p-2 text-center";
    totalHeaderCell.textContent = "Total"; // Column for total quantity
    headerRow.appendChild(totalHeaderCell);

    // Create wallet header columns
    for (const wallet of wallets) {
        let shortenedWalletAddress = shortenAddress(wallet);  // Shorten the wallet address
        let walletHeaderCell = document.createElement("th");
        walletHeaderCell.className = "p-2 text-center";
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
    solRow.className = "bg-gray-800 border-b border-gray-700";
    
    let solLabelCell = document.createElement("td");
    solLabelCell.className = "p-1 text-center";
    solLabelCell.textContent = "SOL Balance"; // Label for the SOL row
    solRow.appendChild(solLabelCell);

    // Add "SOL" for each wallet column in the header
    let totalSolCell = document.createElement("td");
    totalSolCell.className = "p-1 text-center";
    totalSolCell.textContent = ""; // Empty space for Total column in SOL row
    solRow.appendChild(totalSolCell);

    // Loop over wallets to fetch and display SOL balance in this row
    for (const wallet of wallets) {
        let solBalance = await getSolBalance(wallet); // Fetch the SOL balance (assuming async function)
        let solBalanceCell = document.createElement("td");
        solBalanceCell.className = "p-1 text-center";
        solBalanceCell.textContent = solBalance.toLocaleString(); // Display SOL balance
        solRow.appendChild(solBalanceCell);
    }

    // Append the SOL balance row to the table
    inventoryTable.appendChild(solRow);

    // ✅ Read saved filters from LocalStorage
    const savedCategory = localStorage.getItem("selectedCategory");
    const savedTier = localStorage.getItem("selectedTier");
    const savedProfession = localStorage.getItem("selectedProfession");
    const savedRecipe = localStorage.getItem("selectedRecipe");
    const savedFavoritesOnly = localStorage.getItem("favoritesOnly") === "true";

    let allowedMintsForRecipe = [];
    if (savedRecipe && typeof tyxenMachineRecipes !== "undefined") {
        const activeRecipe = tyxenMachineRecipes.find(r => r.name === savedRecipe);
        if (activeRecipe) {
            allowedMintsForRecipe = [
                activeRecipe.result.mint,
                ...activeRecipe.ingredients.map(ingredient => ingredient.mint)
            ];
        }
    }

    // Loop through each token in the filtered balances
    for (const mintAddress in filteredBalances) {
        let tokenData = filteredBalances[mintAddress]; // ✅ Get token data
        const isFavorite = favoriteTokens.includes(mintAddress);


        // ✅ Calculate total quantity across all wallets
        let totalQuantity = Object.values(tokenData.balances).reduce((sum, balance) => {
            if (typeof balance === "object" && balance !== null) {
                return sum + (balance.balance || 0);
            } else {
                return sum + (balance || 0);
            }
        }, 0);
        

        // ✅ Create the row for each token
        let row = document.createElement("tr");
        row.dataset.category = tokenData.category || "";
        row.dataset.tier = tokenData.tier || "";
        row.dataset.profession = tokenData.profession || "";
        row.dataset.favorite = isFavorite ? "true" : "false";

        row.className = "bg-gray-800 border-b border-gray-700";

        // ✅ Create the first column: Token Name (with Solscan link and icon)
        let nameCell = document.createElement("td");
        nameCell.className = "p-1 flex items-center gap-2";

        let icon = document.createElement("img"); // Token icon
        icon.src = tokenData.icon;
        icon.alt = tokenData.name;
        icon.className = "w-6 h-6 rounded";

        // Favorite star button
        let starBtn = document.createElement("button");
        starBtn.textContent = isFavorite ? "★" : "☆";
        starBtn.className = `${isFavorite ? "text-yellow-400" : "text-gray-500"} text-lg hover:scale-110 transition`;

        starBtn.onclick = () => toggleFavorite(mintAddress);

        let link = document.createElement("a");
        link.href = `https://solscan.io/token/${mintAddress}`;
        link.target = "_blank";
        link.className = "text-blue-400 hover:underline";
        link.textContent = tokenData.name;

        nameCell.appendChild(starBtn);
        nameCell.appendChild(icon);
        nameCell.appendChild(link);

        row.appendChild(nameCell);

        // ✅ Create the second column: Total Quantity
        let totalCell = document.createElement("td");
        totalCell.className = "p-1 text-center";
        totalCell.textContent = totalQuantity.toLocaleString(); // Format for readability
        row.appendChild(totalCell);
            
           // ✅ Create wallet balance columns dynamically for each wallet
        for (const wallet of wallets) {
            let walletCell = document.createElement("td");
            walletCell.className = "p-1 text-center";

            let balanceInfo = tokenData.balances[wallet];

            if (!balanceInfo.accountExists) {
                walletCell.textContent = "-";
            } else {
                walletCell.textContent = balanceInfo.balance.toLocaleString();
            }

            row.appendChild(walletCell);
        }

        // Append the row to the table
        inventoryTable.appendChild(row);
    }

    // Reinitialize header sorting event listeners
    setupSorting();
    filterTable()
}

// Searching Function
function filterTable() {
    const searchValue = document.getElementById("searchInput").value.toLowerCase();
    const categoryFilter = document.getElementById("categoryFilter").value;
    const tierFilter = document.getElementById("tierFilter").value;
    const professionFilter = document.getElementById("professionFilter").value;
    const favoritesOnly = document.getElementById("favoritesOnly").checked;
    const recipeFilter = document.getElementById("recipeFilter").value;


    const tableBody = document.getElementById("inventoryTable");
    if (!tableBody) return;

    const rows = Array.from(tableBody.querySelectorAll("tr"));

    for (let row of rows) {
        const firstCell = row.querySelector("td");
        if (!firstCell) continue;

        const text = firstCell.textContent.toLowerCase();

        // Always show the header and SOL Balance row
        if (firstCell.textContent.trim().toLowerCase() === "sol balance" || row.querySelector("th")) {
            row.style.display = "";
            continue;
        }

        const rowData = row.dataset; // Access metadata from data attributes

        // If a recipe is selected, check if the token matches the recipe result or ingredients
        let matchesRecipe = true;
        if (recipeFilter) {
            const activeRecipe = tyxenMachineRecipes.find(r => r.name === recipeFilter);
            if (activeRecipe) {
                const tokenLink = row.querySelector("a[href*='solscan.io/token/']");
                if (tokenLink) {
                    const href = tokenLink.getAttribute("href");
                    const mintMatch = href.match(/token\/([^\/\?]+)/);
                    const mintAddress = mintMatch ? mintMatch[1] : "";

                    const validMints = [
                        activeRecipe.result.mint,
                        ...activeRecipe.ingredients.map(ingredient => ingredient.mint)
                    ];

                    matchesRecipe = validMints.includes(mintAddress);
                } else {
                    matchesRecipe = false; // If no link (weird row), hide
                }
            }
        }

        const matchesSearch = text.includes(searchValue);
        const matchesCategory = !categoryFilter || rowData.category === categoryFilter;
        const matchesTier = !tierFilter || rowData.tier === tierFilter;
        const matchesProfession = !professionFilter || rowData.profession === professionFilter;
        const matchesFavorite = !favoritesOnly || rowData.favorite === "true";
        const totalCell = row.querySelector("td:nth-child(2)");
        const total = totalCell ? parseFloat(totalCell.textContent.replace(/,/g, "")) : 0;
        
        const hideZeroBalance = !recipeFilter && total === 0;
        

        if (matchesSearch && matchesCategory && matchesTier && matchesProfession && matchesFavorite && matchesRecipe && !hideZeroBalance) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
        
        
        
    }
}

function clearSearch() {
    const input = document.getElementById("searchInput");
    input.value = "";
    filterTable(); // Refresh table to show all rows
    toggleClearButton(); // Hide ❌
}

function toggleClearButton() {
    const input = document.getElementById("searchInput");
    const button = document.getElementById("clearSearchBtn");
    button.classList.toggle("hidden", input.value.trim() === "");
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

