// tyxenMachineRecipes.js

let tyxenMachineRecipes = []; // This will hold the resolved recipes

// Load valanniaTokens and resolve names to mints
async function loadTyxenRecipes() {
  const tokenResponse = await fetch("data/valanniaTokens.json");
  const tokens = await tokenResponse.json();

  const getMint = name => {
    const match = tokens.find(t => t.name === name);
    return match ? match.mint : "MISSING";
  };

  tyxenMachineRecipes = [
    {
    name: "Arcane Catalyst",
    result: { type: "core_nft", mint: getMint("Arcane Catalyst") },
    ingredients: [
      { type: "spl_token", mint: getMint("Copper Ore"), quantity: 60 },
      { type: "spl_token", mint: getMint("Valannite"), quantity: 10 },
      { type: "spl_token", mint: getMint("Honey Drop"), quantity: 8 },
      { type: "spl_token", mint: getMint("Dragon Breath"), quantity: 6 },
      { type: "spl_token", mint: getMint("Astralite"), quantity: 1 }
    ]
  },

  {
    name: "Runeglow Magnifier",
    result: { type: "core_nft", mint: getMint("Runeglow Magnifier") },
    ingredients: [
      { type: "spl_token", mint: getMint("Copper Ore"), quantity: 85 },
      { type: "spl_token", mint: getMint("Copper Ingot"), quantity: 15 },
      { type: "spl_token", mint: getMint("Valannite"), quantity: 10 },
      { type: "spl_token", mint: getMint("Glorb Toolbox"), quantity: 2 }
    ]
  },

  {
    name: "Sunforged Edge",
    result: { type: "core_nft", mint: getMint("Sunforged Edge") },
    ingredients: [
      { type: "spl_token", mint: getMint("Copper Ore"), quantity: 75 },
      { type: "spl_token", mint: getMint("Copper Ingot"), quantity: 10 },
      { type: "spl_token", mint: getMint("Softwood Handle"), quantity: 5 },
      { type: "spl_token", mint: getMint("Honey Drop"), quantity: 10 }
    ]
  },

  {
    name: "OmniTinker Core",
    result: { type: "core_nft", mint: getMint("OmniTinker Core") },
    ingredients: [
      { type: "spl_token", mint: getMint("Copper Ore"), quantity: 10 },
      { type: "spl_token", mint: getMint("Copper Wire"), quantity: 10 },
      { type: "spl_token", mint: getMint("Liquid Valannite"), quantity: 15 },
      { type: "spl_token", mint: getMint("Processed Valannite"), quantity: 10 },
      { type: "spl_token", mint: getMint("Glass"), quantity: 10 }
    ]
  },

  {
    name: "Swiftstride Boots",
    result: { type: "core_nft", mint: getMint("Swiftstride Boots") },
    ingredients: [
      { type: "spl_token", mint: getMint("Boots"), quantity: 2 },
      { type: "spl_token", mint: getMint("Stormwater"), quantity: 2 },
      { type: "spl_token", mint: getMint("River Map"), quantity: 2 },
      { type: "spl_token", mint: getMint("Excavation Site Map"), quantity: 2 },
      { type: "spl_token", mint: getMint("Dragon Breath"), quantity: 10 },
      { type: "spl_token", mint: getMint("Celespar"), quantity: 1 },
      { type: "spl_token", mint: getMint("Astralite"), quantity: 1 }
    ]
  },

  {
    name: "Mirrorport Chest",
    result: { type: "core_nft", mint: getMint("Mirrorport Chest") },
    ingredients: [
      { type: "spl_token", mint: getMint("Chest"), quantity: 2 },
      { type: "spl_token", mint: getMint("Tyxen Toolkit"), quantity: 2 },
      { type: "spl_token", mint: getMint("Iron Ingot"), quantity: 3 },
      { type: "spl_token", mint: getMint("Spectral Mirror"), quantity: 4 },
      { type: "spl_token", mint: getMint("Astralite"), quantity: 1 }
    ]
  },

  {
    name: "Dragon Eye Medallion",
    result: { type: "core_nft", mint: getMint("Dragon Eye Medallion") },
    ingredients: [
      { type: "spl_token", mint: getMint("Dragon Breath"), quantity: 5 },
      { type: "spl_token", mint: getMint("Processed Dragon Breath"), quantity: 3 },
      { type: "spl_token", mint: getMint("Liquid Dragon Breath"), quantity: 1 },
      { type: "spl_token", mint: getMint("Astralite"), quantity: 3 }
    ]
  },



  {
    name: "Ice Velgrun",
    result: { type: "core_nft", mint: getMint("Ice Velgrun") },
    ingredients: [
      { type: "spl_token", mint: getMint("Softwood Handle"), quantity: 1 },
      { type: "spl_token", mint: getMint("Copper Ingot"), quantity: 1 },
      { type: "spl_token", mint: getMint("Paper"), quantity: 3 },
    ]
  },
    
  {
    name: "Dragon Eye Medallion",
    result: { type: "core_nft", mint: getMint("Dragon Eye Medallion") },
    ingredients: [
      { type: "spl_token", mint: getMint("Dragon Breath"), quantity: 5 },
      { type: "spl_token", mint: getMint("Processed Dragon Breath"), quantity: 3 },
      { type: "spl_token", mint: getMint("Liquid Dragon Breath"), quantity: 1 },
      { type: "spl_token", mint: getMint("Astralite"), quantity: 3 }
    ]
  },
    
  {
    name: "Leviathan",
    result: { type: "core_nft", mint: getMint("Leviathan") },
    ingredients: [
      { type: "spl_token", mint: getMint("Iron Ingot"), quantity: 1 },
      { type: "spl_token", mint: getMint("Canvas Paper"), quantity: 1 },
      { type: "spl_token", mint: getMint("Glass"), quantity: 1 },
    ]
  },
    
  {
    name: "Griffin",
    result: { type: "spl_token", mint: getMint("Griffin") },
    ingredients: [
      { type: "spl_token", mint: getMint("Tyxen Toolkit"), quantity: 170 },
      { type: "spl_token", mint: getMint("Processed Valannite"), quantity: 50 },
      { type: "spl_token", mint: getMint("Processed Honey Drop"), quantity: 40 },
      { type: "spl_token", mint: getMint("Processed Dragon Breath"), quantity: 40 },
      { type: "spl_token", mint: getMint("Processed Celespar"), quantity: 30 },
      { type: "spl_token", mint: getMint("Extraction Pipe"), quantity: 50 },
      { type: "spl_token", mint: getMint("Coal"), quantity: 300 },
      { type: "spl_token", mint: getMint("Stormwater"), quantity: 300 }
    ]
  },
  
  {
    name: "Forest Sprouter",
    result: { type: "spl_token", mint: getMint("Forest Sprouter") },
    ingredients: [
      { type: "spl_token", mint: getMint("Tyxen Toolkit"), quantity: 100 },
      { type: "spl_token", mint: getMint("Processed Valannite"), quantity: 150 },
      { type: "spl_token", mint: getMint("Processed Honey Drop"), quantity: 80 },
      { type: "spl_token", mint: getMint("Processed Dragon Breath"), quantity: 60 },
      { type: "spl_token", mint: getMint("Processed Celespar"), quantity: 60 },
      { type: "spl_token", mint: getMint("Extraction Pipe"), quantity: 50 }
    ]
  },

  {
    name: "Abomination",
    result: { type: "spl_token", mint: getMint("Abomination") },
    ingredients: [
      { type: "spl_token", mint: getMint("Tyxen Toolkit"), quantity: 150 },
      { type: "spl_token", mint: getMint("Processed Valannite"), quantity: 50 },
      { type: "spl_token", mint: getMint("Processed Honey Drop"), quantity: 40 },
      { type: "spl_token", mint: getMint("Processed Dragon Breath"), quantity: 30 },
      { type: "spl_token", mint: getMint("Processed Celespar"), quantity: 30 },
      { type: "spl_token", mint: getMint("Extraction Pipe"), quantity: 50 },
      { type: "spl_token", mint: getMint("Coal"), quantity: 300 },
      { type: "spl_token", mint: getMint("Stormwater"), quantity: 300 }
    ]
  },

  {
    name: "Battering Ram",
    result: { type: "spl_token", mint: getMint("Battering Ram") },
    ingredients: [
      { type: "spl_token", mint: getMint("Tyxen Toolkit"), quantity: 200 },
      { type: "spl_token", mint: getMint("Processed Valannite"), quantity: 50 },
      { type: "spl_token", mint: getMint("Processed Honey Drop"), quantity: 40 },
      { type: "spl_token", mint: getMint("Processed Dragon Breath"), quantity: 30 },
      { type: "spl_token", mint: getMint("Processed Celespar"), quantity: 30 },
      { type: "spl_token", mint: getMint("Extraction Pipe"), quantity: 50 },
      { type: "spl_token", mint: getMint("Iron Hoop"), quantity: 50 }
    ]
  },

  {
    name: "Tyxen Tank",
    result: { type: "spl_token", mint: getMint("Tyxen Tank") },
    ingredients: [
      { type: "spl_token", mint: getMint("Tyxen Toolkit"), quantity: 200 },
      { type: "spl_token", mint: getMint("Processed Valannite"), quantity: 50 },
      { type: "spl_token", mint: getMint("Processed Honey Drop"), quantity: 40 },
      { type: "spl_token", mint: getMint("Processed Dragon Breath"), quantity: 30 },
      { type: "spl_token", mint: getMint("Processed Celespar"), quantity: 30 },
      { type: "spl_token", mint: getMint("Extraction Pipe"), quantity: 50 },
      { type: "spl_token", mint: getMint("Wheel"), quantity: 60 }
    ]
  },

  {
    name: "Zim",
    result: { type: "spl_token", mint: getMint("Zim") },
    ingredients: [
      { type: "spl_token", mint: getMint("Tyxen Toolkit"), quantity: 100 },
      { type: "spl_token", mint: getMint("Processed Valannite"), quantity: 50 },
      { type: "spl_token", mint: getMint("Processed Honey Drop"), quantity: 40 },
      { type: "spl_token", mint: getMint("Processed Dragon Breath"), quantity: 30 },
      { type: "spl_token", mint: getMint("Processed Celespar"), quantity: 30 },
      { type: "spl_token", mint: getMint("Extraction Pipe"), quantity: 50 },
      { type: "spl_token", mint: getMint("Chest"), quantity: 30 },
      { type: "spl_token", mint: getMint("Barrel"), quantity: 30 }
    ]
  }
];

loadTyxenRecipes();
}
