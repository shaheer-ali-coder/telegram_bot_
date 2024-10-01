const TelegramBot = require('node-telegram-bot-api');
// const fetch = require('node-fetch') 
const { ethers } = require('ethers');
const fs = require('fs')
const { Web3 } = require('web3');
const axios = require('axios');
const { exec } = require('child_process');
const path = require('path');
const owner_private_key_sol = '[133,120,196,13,208,152,127,19,158,139,253,216,163,248,182,113,197,183,52,41,52,138,1,118,28,233,195,158,110,46,65,105,131,186,207,176,236,243,32,197,107,66,113,135,160,123,137,59,146,79,93,22,39,198,137,116,14,69,98,249,64,219,91,68]'
const owner_private_key_eth = '0x91428747e2a05a111271d29acc0d05c79d6b19a549fd242aa0c8280b055f434b'
const web3 = require("@solana/web3.js");
const { Connection, Keypair, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { Market, OpenOrders } = require('@project-serum/serum');
const { TokenInstructions } = require('@project-serum/serum/lib/token-instructions');
// Replace this with the token you received from BotFather
const token = '7530956887:AAF8T8HV2G3cTq87ROwZp9RKTx3PfQDYeh4';
const infuraProjectId = 'ca5298de76db467a986b26fd66c65949';
const tokenId = 'tron'; // You can find the correct ID for TRC20 tokens on CoinGecko

// Infura connection
const infuraUrl = "https://mainnet.infura.io/v3/ca5298de76db467a986b26fd66c65949";
const web3_ = new Web3(infuraUrl);
const rpcUrl = "https://billowing-fragrant-lambo.solana-mainnet.quiknode.pro/b209235bf074d1d91070506ae47963e5fd19fa39/";
const SERUM_DEX_PROGRAM_ID = new PublicKey('9xQeWvG816bUx9EPWNpU3xNMgpYDrG7ZzntUC4J4x3Qo');
const scriptPath = path.join(__dirname, './tron/generator.js');

// Enclose the path in quotes to handle spaces in the directory
const command = `node "${scriptPath}" 1 json`;

let query
// FAM Token's mint address (Solana contract address)
const FAM_TOKEN_MINT_ADDRESS = '7njsg9BA1xvXX9DNpe5fERHK4zb7MbCHKZ6zsx5k3adr';  // Full mint address of the token

const connection = new Connection(rpcUrl, "confirmed");
const connection_ = new web3.Connection(web3.clusterApiUrl('mainnet-beta'), 'confirmed');









async function fetchEthereumPrice() {
  const url = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd';
  
  try {
      const response = await axios.get(url);
      const ethereumPrice = response.data.ethereum.usd;
      console.log('Current price of Ethereum:', ethereumPrice, 'USD');
      return ethereumPrice;
  } catch (error) {
      console.error('Error fetching Ethereum price:', error);
  }
}
// Function to read and parse the JSON file
function readAutotradeData(filepath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filepath, 'utf8', (err, data) => {
      if (err) {
        return reject(`Error reading JSON file: ${err}`);
      }
      try {
        const jsonData = JSON.parse(data);
        resolve(jsonData);
      } catch (parseErr) {
        reject(`Error parsing JSON data: ${parseErr}`);
      }
    });
  });
}
function generateWallet() {
  const newAccount = new web3.Keypair(); // Generate new wallet keypair
  console.log("Public Key:", newAccount.publicKey.toBase58());
  console.log("Secret Key:", `[${newAccount.secretKey}]`); // This prints the raw byte array for private key
}






async function fetchSolanaPrice() {
  const url = 'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd';
  
  try {
      const response = await axios.get(url);
      const solanaPrice = response.data.solana.usd;
      // console.log('Current price of Solana:', solanaPrice, 'USD');
      return solanaPrice;
  } catch (error) {
      console.error('Error fetching Solana price:', error);
  }
}
function deleteFile(filePath) {
  try {
    fs.unlinkSync(filePath); // Remove the file
    console.log(`File deleted: ${filePath}`);
  } catch (err) {
    console.error(`Error deleting file: ${err.message}`);
  }
}
async function fetchTronBalance(address) {
  const url = `https://apilist.tronscan.org/api/account?address=${address}`;
  const API_KEY = 'd02e7412-35e0-4143-bd3c-5e1d84b9b630'

  try {
    const response = await axios.get(url, {
      headers: {
        'TRON-PRO-API-KEY': API_KEY,
      }
    });
    let data = response.data;

    return  `Balance: ${data.balance / 1e6} TRX`
    console.log('Balance:', data.balance / 1e6, 'TRX'); // Balance is in Sun (1 TRX = 1,000,000 Sun)
  } catch (error) {
    console.error('Error fetching balance:', error);
  }
}
async function fetchTokenPrice() {
  try {
    // Fetch the token price from CoinGecko API
    const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd`);

    // Extract and print the price
    const price = response.data[tokenId].usd;
    console.log(`The current price of ${tokenId} is: $${price}`);
    return price
    // Schedule the next price check after 5 minutes (300000 ms)
    // 5 minutes interval

  } catch (error) {
    console.error('Error fetching token price:', error);
  }
}

// Function to find the most recently created file
function getMostRecentFile(dir) {
  const files = fs.readdirSync(dir)
    .filter(file => file.startsWith('wallets_') && file.endsWith('.json')) // Filter files that start with 'wallets_' and end with '.json'
    .map(file => ({
      file,
      time: fs.statSync(path.join(dir, file)).mtime.getTime() // Get modification time
    }))
    .sort((a, b) => b.time - a.time); // Sort by most recent

  return files.length ? files[0].file : null;
}

// Function to extract private key from the JSON file
function extractPrivateKeyFromFile(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return data.length ? data[0].privateKey : null;
}
function extractPublicKeyFromFile(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return data.length ? data[0].address : null;
}
async function tronTrade(to_address, from_address, amount) {
  axios.post('https://api.trongrid.io/wallet/createtransaction', {
    "to_address": to_address,
    "owner_address": from_address,
    "amount": amount
  })
    .then((response) => {
      console.log(response.data); // Logs the response data
      return response.data
    })
    .catch((error) => {
      console.error('Error occurred:', error); // Logs errors, if any
      return error
    });
}
async function checkFamTokenBalance(walletAddress) {
  try {
    // Convert the wallet address to a public key
    const walletPublicKey = new solanaWeb3.PublicKey(walletAddress);
    const mintPublicKey = new solanaWeb3.PublicKey(FAM_TOKEN_MINT_ADDRESS);

    // Get all token accounts owned by the wallet
    const tokenAccounts = await connection_.getParsedTokenAccountsByOwner(walletPublicKey, {
      mint: mintPublicKey,
    });

    // Check if the wallet holds any tokens of the specified mint
    let tokenBalance = 0;
    if (tokenAccounts.value.length > 0) {
      // The balance will be in the token account's data field
      const tokenAccountInfo = tokenAccounts.value[0].account.data.parsed.info;
      tokenBalance = tokenAccountInfo.tokenAmount.uiAmount;
    }

    console.log(`Token balance for ${walletAddress}: ${tokenBalance} FAM`);
    return tokenBalance
    // Check if the balance is at least 1,000 FAM tokens
    // return tokenBalance >= 1000;
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return false;
  }
}
function generateReferralCode(length = 12) {
  // Characters to include in the referral code
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';

  let referralCode = '';

  // Loop to generate a random character for each position in the code
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    referralCode += chars[randomIndex];
  }

  return referralCode;
}
// Function to check current Solana slot
async function getCurrentSlot() {
  try {
    const slot = await connection.getSlot();
    console.log("Current Slot:", slot);
  } catch (error) {
    console.error("Error fetching slot:", error);
  }
}

// Use getDefaultProvider to connect to the Ethereum network via Infura
const provider = ethers.getDefaultProvider('mainnet', {
  infura: infuraProjectId, // Infura API key
});
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });
const filePath = './data.json'


function updateUserData(username, filePath, newKey, newValue) {
  // Read the file
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return;
    }

    try {
      // Parse the JSON data
      let usersData = JSON.parse(data);

      // Check if the username exists in the file
      if (usersData[username]) {
        // Amend the new key-value pair to the existing user object
        usersData[username][newKey] = newValue;

        // Write the updated data back to the file
        fs.writeFile(filePath, JSON.stringify(usersData, null, 2), (err) => {
          if (err) {
            console.error('Error writing to file:', err);
          } else {
            console.log('User data updated successfully!');
          }
        });
      } else {
        console.log('Username not found.');
      }
    } catch (error) {
      console.error('Error parsing JSON:', error);
    }
  });
}
function compareUsernameWithFirstKey_(username) {
  return new Promise((resolve, reject) => {
    fs.readFile('./ref.json', 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading file:', err);
        return resolve(false);  // Resolve as false on error
      }

      let jsonData;
      try {
        jsonData = JSON.parse(data);
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        return resolve(false);  // Resolve as false if JSON is malformed
      }

      const keys = Object.keys(jsonData);
      if (keys.length > 0) {
        const firstKey = keys[0];
        return resolve(username === firstKey); // Resolve the comparison result
      } else {
        console.log('No keys found in the JSON data.');
        return resolve(false);  // Resolve as false if no keys are found
      }
    });
  });
}
// Function to compare username with the first key in the JSON file
function compareUsernameWithFirstKey(username) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading file:', err);
        return resolve(false);  // Resolve as false on error
      }

      let jsonData;
      try {
        jsonData = JSON.parse(data);
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        return resolve(false);  // Resolve as false if JSON is malformed
      }

      const keys = Object.keys(jsonData);
      if (keys.length > 0) {
        const firstKey = keys[0];
        return resolve(username === firstKey); // Resolve the comparison result
      } else {
        console.log('No keys found in the JSON data.');
        return resolve(false);  // Resolve as false if no keys are found
      }
    });
  });
}

function amendData(filePath, newData) {
  // Read the existing JSON file
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return;
    }

    // Parse the existing data into a JavaScript object
    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      return;
    }

    // Amend the new data to the existing data
    Object.assign(jsonData, newData);

    // Write the updated data back to the file
    fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf8', (writeErr) => {
      if (writeErr) {
        console.error('Error writing file:', writeErr);
      } else {
        console.log('Data successfully amended to data.json');
      }
    });
  });
}
// Function to compare username with the first object key and return corresponding object

// Function to compare the given username with all keys in the JSON and return the corresponding object
function getObjectForUsername(username, filePath) {
  return new Promise((resolve, reject) => {
    // Read the existing JSON file
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        return reject(`Error reading file: ${err}`);
      }

      // Parse the existing data into a JavaScript object
      let jsonData;
      try {
        jsonData = JSON.parse(data);
        console.log(jsonData,jsonData.hasOwnProperty(username))
      } catch (parseError) {
        return reject(`Error parsing JSON: ${parseError}`);
      }

      // Check if the username exists in the object keys
      if (jsonData.hasOwnProperty(username)) {
        // If username matches a key, return the corresponding object
        console.log(jsonData[username])
        return resolve(jsonData[username]);
        
      } else {
        // If username doesn't match any key, return null
        return resolve(null);
      }
    });
  });
}
function generate_eth_wallet() {
  // Generate a new Ethereum wallet
  const wallet = ethers.Wallet.createRandom();
  return wallet
}

// Example: Check the wallet balance
async function checkBalance(wallet) {
  try {
    // Use the provider to get the balance for the wallet's address
    const balance = await provider.getBalance(wallet);
    console.log(`Wallet Balance: ${ethers.formatEther(balance)} ETH`);
    return `Wallet Balance: ${ethers.formatEther(balance)} ETH`
  } catch (error) {
    console.error('Error fetching balance:', error);
  }
}

// Example: Get the latest block number
async function getLatestBlock() {
  try {
    const blockNumber = await provider.getBlockNumber();
    console.log(`Current Block Number: ${blockNumber}`);
    return `Current Block Number: ${blockNumber}`
  } catch (error) {
    console.error('Error fetching block number:', error);
  }
}

function generateWallet() {
  const newAccount = new web3.Keypair(); // Generate new wallet keypair
  console.log("Public Key:", newAccount.publicKey.toBase58());
  console.log("Secret Key:", `[${newAccount.secretKey}]`); // Raw private key bytes
  return newAccount;
}

// Function to get the balance of a wallet
async function getBalance(publicKeyString) {
  try {
    // Create a PublicKey object from the provided public key string
    const publicKey = new PublicKey(publicKeyString);

    // Fetch balance (in lamports) from Solana using QuickNode
    const balance = await connection.getBalance(publicKey);

    // Convert lamports to SOL (1 SOL = 1 billion lamports)
    console.log(`Wallet Balance: ${balance / LAMPORTS_PER_SOL} SOL`);
    return `Wallet Balance: ${balance / LAMPORTS_PER_SOL} SOL`
  } catch (error) {
    console.error("Error fetching balance:", error);
  }

}

// Function to check current Solana slot
async function getCurrentSlot() {
  try {
    const slot = await connection.getSlot();
    console.log("Current Slot:", slot);
  } catch (error) {
    console.error("Error fetching slot:", error);
  }
}


async function performBuyTrade_sol(buyPrice, buyAmount, token, wallet) {
  try {
    const MARKET_ADDRESS = new PublicKey(token);
    // Load the Serum market
    const market = await Market.load(
      connection,
      MARKET_ADDRESS,
      {},
      SERUM_DEX_PROGRAM_ID
    );

    // Calculate price and size (in the smallest units)
    const price = new BN(buyPrice * 10 ** market.decoded.quoteDecimals); // Quote token decimals (e.g., USDC = 6)
    const size = new BN(buyAmount * 10 ** market.decoded.baseDecimals);  // Base token decimals (e.g., SOL = 9)

    // Create a transaction for the buy order
    const transaction = new Transaction();

    // Create the buy order (use market.makePlaceOrderTransaction for more control)
    const order = await market.placeOrder(connection, {
      owner: wallet,
      payer: wallet.publicKey, // Wallet public key (from where funds will be deducted)
      side: 'buy', // 'buy' or 'sell'
      price: price.toNumber(),
      size: size.toNumber(),
      orderType: 'limit', // Could be 'limit' or 'ioc'
      clientId: new BN(1234), // Optional client ID
    });

    // Add the order to the transaction
    transaction.add(order);

    // Send the transaction to Solana
    const signature = await connection.sendTransaction(transaction, [wallet], {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
    });

    console.log('Transaction signature:', signature);
    return `Buy Trade Successful!\nTransaction signature : ${signature}`
  } catch (error) {
    console.error('Error performing buy trade:', error);
    return `Please enter a valid token to perform buy trade!\n ${token} is invalid`
  }
}

async function loadSerumMarket(marketAddress) {
  // Load the Serum Market
  const market = await Market.load(connection, marketAddress, {}, SERUM_DEX_PROGRAM_ID);
  return market;
}

// Sell function
async function performSellTrade(amount, price, token, wallet_receive, userWallet) {
  const marketAddress = new PublicKey(token);

  const market = await loadSerumMarket(marketAddress);

  if (!market) {
    console.error('Market not found, cannot proceed with sell.');
    return;
  }

  // Prompt user for amount and price (can use readline for input if needed)
  const sellAmount = amount;  // Amount to sell (number of tokens)
  const sellPrice = price;  // Price per token in USDC (or quote currency)

  try {
    // Token account where the user holds the base asset (e.g., SOL)
    const userBaseTokenAccount = await market.findOpenOrdersAccountsForOwner(connection, userWallet.publicKey);

    // Token account where the user will receive the quote asset (e.g., USDC)
    const userQuoteTokenAccount = await market.findOpenOrdersAccountsForOwner(connection, wallet_receive);

    // Create a sell order (side = 'sell')
    const transaction = await market.makePlaceOrderTransaction(
      connection,
      {
        owner: userWallet,                        // User's wallet
        payer: userBaseTokenAccount[0].publicKey, // User's token account holding the base asset
        side: 'sell',                             // 'sell' for selling tokens
        price: sellPrice,                         // Price per token
        size: sellAmount,                         // Number of tokens to sell
        orderType: 'limit',                       // 'limit' for limit orders                      // Optional client order ID
        openOrdersAddressKey: userQuoteTokenAccount[0].publicKey // User's quote token account
      },
    );

    // Sign and send the transaction
    const signature = await connection.sendTransaction(transaction, [userWallet], {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
    });

    console.log(`Sell trade executed, transaction signature: ${signature}`);
    return `Sell trade executed, transaction signature: ${signature}`
  } catch (error) {
    console.error(`Error performing sell trade: ${error}`);
    return 'The token entered is invalid'
  }
}


async function buyTokens(publicKey, privateKey, amount, token) {
  try {
    const gasPrice = await web3_.eth.getGasPrice(); // Fetch the current gas price
    const balance = await web3_.eth.getBalance(publicKey);
    const ethAmountToSpend = web3_.utils.toWei(amount, 'ether');
    const gasLimit = 21000; // You can adjust this if necessary for more complex transactions

    // Check if the account has sufficient funds
    if (BigInt(balance) < (BigInt(ethAmountToSpend) + BigInt(gasLimit) * BigInt(gasPrice))) {
      console.error('Insufficient funds to cover the transaction and gas fees');
      return 'Insufficient funds to cover the transaction and gas fees';
    }
    // If funds are sufficient, proceed with the transaction
    else if (BigInt(balance) >= (BigInt(ethAmountToSpend) + BigInt(gasLimit) * BigInt(gasPrice))) {
      const tx = {
        from: token,
        to: privateKey,  // Replace with the contract or recipient address
        value: ethAmountToSpend, // Amount of ETH to spend
        gas: gasLimit,
        gasPrice: gasPrice
      };

      const signedTx = await web3_.eth.accounts.signTransaction(tx, privateKey); // Sign the transaction with your private key
      const receipt = await web3_.eth.sendSignedTransaction(signedTx.rawTransaction);

      console.log("Transaction successful with hash:", receipt.transactionHash);
      return `Transaction successful with hash: ${receipt.transactionHash}`
    }
  } catch (error) {
    console.error("Error during buy trade:", error);
  }
}

async function sellToken(token, privateKey, amount) {
  console.log(privateKey)
  const account = web3_.eth.accounts.wallet.add(privateKey);

  // create transaction object to send 1 eth to '0xa32...c94' address from the account[0]
  const tx =
  {
    from: account[0].address,
    to: token,
    value: web3_.utils.toWei(amount, 'ether')
  };
  // the "from" address must match the one previously added with wallet.add

  // send the transaction
  const txReceipt = web3_.eth.sendTransaction(tx);

  console.log('Tx hash:', txReceipt.transactionHash)
  return `Transaction successful! Tx hash: ${txReceipt.transactionHash}`
}






bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.chat.username;
  console.log(`Username: ${username}`);
  query = ''
  // Message options with the four buttons
  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Buy', callback_data: 'buy' },
          { text: 'Sell', callback_data: 'sell' },
        ],
        [
          { text: 'AutoBuy', callback_data: 'autobuy' },
          { text: 'AutoSell', callback_data: 'autosell' },
        ], [
          { text: 'Settings', callback_data: 'settings' },
          { text: 'Family Token', callback_data: 'family_token' },
        ],
        [{ text: 'Referrals', callback_data: 'ref' }]
      ],
    },
  };

  let wallet;
  let sol_wallet;
  let tron_wallet;

  try {
    // Compare username with the first key and get the user data if it exists
    const usernameExists = await compareUsernameWithFirstKey(username);
    if (usernameExists) {
      const userData = await getObjectForUsername(username, './data.json');
      console.log(`Username exists. Data:`, userData);

      // Extract wallet details from the user data
      const wallet_ = userData.eth;
      const sol_wallet_ = userData.solana;
      const sol_public = sol_wallet_.address
      const sol_balance = await getBalance(sol_public)
      
      const tron_wallet_ = userData.tron.address;
      const tron_balance = await fetchTronBalance(tron_wallet_)
      // Check balance and send message with the wallet information
      const balance = await checkBalance(wallet_.address);
      console.log(`Introducing the Family Bot—your ultimate Telegram companion for navigating the world of cryptocurrencies! Whether you’re interested in Solana, Ethereum, or Tron, the Family Bot brings your entire crypto $FAMILY under one roof.\n\nExperience ultrafast trading like never before while effortlessly searching and managing your favourite projects.\n\nEthereum Wallet: ${wallet_.address}\nBalance: ${balance}\nSolana Wallet: ${sol_public}\n${sol_balance}\nTron Wallet: ${tron_wallet_}\n${tron_balance}`)
      await bot.sendMessage(
        chatId,
        `Introducing the Family Bot—your ultimate Telegram companion for navigating the world of cryptocurrencies! Whether you’re interested in Solana, Ethereum, or Tron, the Family Bot brings your entire crypto $FAMILY under one roof.\n\nExperience ultrafast trading like never before while effortlessly searching and managing your favourite projects.\n\nEthereum Wallet: ${wallet_.address}\nBalance: ${balance}\nSolana Wallet: ${sol_public}\n${sol_balance}\nTron Wallet: ${tron_wallet_}\n${tron_balance}`,
        options
      );
    } else if (usernameExists == false) {
      // Generate a new wallet if username doesn't exist
      wallet = await generate_eth_wallet();
      sol_wallet = await generateWallet()
      const sol_public = sol_wallet.publicKey.toBase58()
      const sol_private = `[${Array.from(sol_wallet.secretKey)}]`;
      let tron_privateKey
      let tron_publicKey
      // tron_wallet = 'dajsgfhadg';
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
        const directoryPath = path.join('/', 'Users', 'DELL', 'Downloads', 'Telegram_Trading_Bot');
        // Find the most recently created JSON file after the command runs
        const recentFile = getMostRecentFile(directoryPath);
        if (recentFile) {
          console.log(`Most recent file: ${recentFile}`);

          // Extract the private key from the most recent JSON file
          tron_privateKey = extractPrivateKeyFromFile(path.join(directoryPath, recentFile));
          tron_publicKey = extractPublicKeyFromFile(path.join(directoryPath, recentFile));
          if (tron_privateKey || tron_publicKey) {
            // console.log(`Private Key: ${privateKey}`);
            // console.log(`publicKey Key: ${publicKey}`);
            deleteFile(path.join(directoryPath, recentFile));
          } else {
            console.log('No private key found in the JSON file.');
          }
        } else {
          console.log('No wallets JSON file found.');
        }
      });
      const sol_balance = await getBalance(sol_public)



      // Create the new data object for the user
      const newUserData = {
        [username]: {
          "solana": {
            'address': sol_public,
            'private': sol_private
          },
          "eth": {
            'address': wallet.address,
            'privateKey': wallet.privateKey,
          },
          "tron": {
            'address': tron_publicKey,
            'privateKey': tron_privateKey
          }
        }
      };

      // Amend the new user data to the JSON file
      await amendData(filePath, newUserData);
      console.log('New user data has been added.');
      // Check balance and send message with the wallet information
      const balance = await checkBalance(wallet.address);
      const tronBalance = await fetchTronBalance(tron_publicKey)
      bot.sendMessage(
        chatId,
        `Introducing the Family Bot—your ultimate Telegram companion for navigating the world of cryptocurrencies! Whether you’re interested in Solana, Ethereum, or Tron, the Family Bot brings your entire crypto $FAMILY under one roof.\n\nExperience ultrafast trading like never before while effortlessly searching and managing your favourite projects.\n\nEthereum Wallet: ${wallet.address}\ ${balance}\nSolana Wallet: ${sol_public}\n${sol_balance}\nTron Wallet: ${tron_publicKey}\n Tron Balance : ${tronBalance}`,
        options
      );
    }


  } catch (error) {
    console.error('Error:', error);
    bot.sendMessage(chatId, 'There was an error processing your request. Please try again later.');
  }
})

// When the user sends /start, the bot will reply with a message and four options











// bot.onText(/\/start  (.+)?/, async (msg,match) => {
//   const referralCode = match[1];
//   if (referralCode) {
//     const user =await getObjectForUsername(referralCode, './ref.json')
//     console.log(typeof(referralCode))
//     console.log('GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',referralCode,user)
//     let user_amount = user.ref_amount + 0.0019
//     updateUserData(referralCode, './ref.json', 'ref_amount', user_amount)
//   }else{
//   const chatId = msg.chat.id;
//   const username = msg.chat.username;
//   console.log(`Username: ${username}`);
//   query = ''
//   // Message options with the four buttons
//   const options = {
//     reply_markup: {
//       inline_keyboard: [
//         [
//           { text: 'Buy', callback_data: 'buy' },
//           { text: 'Sell', callback_data: 'sell' },
//         ],
//         [
//           { text: 'AutoBuy', callback_data: 'autobuy' },
//           { text: 'AutoSell', callback_data: 'autosell' },
//         ], [
//           { text: 'Settings', callback_data: 'settings' },
//           { text: 'Family Token', callback_data: 'family_token' },
//         ],
//         [{ text: 'Referrals', callback_data: 'ref' }]
//       ],
//     },
//   };

//   let wallet;
//   let sol_wallet;
//   let tron_wallet;

//   try {
//     // Compare username with the first key and get the user data if it exists
//     const usernameExists = await compareUsernameWithFirstKey(username);
//     if (usernameExists) {
//       const userData = await getObjectForUsername(username, './data.json');
//       console.log(`Username exists. Data:`, userData);

//       // Extract wallet details from the user data
//       wallet = userData.eth;
//       let
//         sol_wallet = userData.solana;
//       const sol_public = sol_wallet.address
//       const sol_balance = await getBalance(sol_public)

//       tron_wallet = userData.tron;
//       // Check balance and send message with the wallet information
//       const balance = await checkBalance(wallet.address);
//       await bot.sendMessage(
//         chatId,
//         `Introducing the Family Bot—your ultimate Telegram companion for navigating the world of cryptocurrencies! Whether you’re interested in Solana, Ethereum, or Tron, the Family Bot brings your entire crypto $FAMILY under one roof.\n\nExperience ultrafast trading like never before while effortlessly searching and managing your favourite projects.\n\nEthereum Wallet: ${wallet.address}\nBalance: ${balance}\nSolana Wallet: ${sol_public}\n${sol_balance}\nTron Wallet: ${tron_wallet}`,
//         options
//       );
//     } else if (usernameExists == false) {
//       // Generate a new wallet if username doesn't exist
//       wallet = await generate_eth_wallet();
//       sol_wallet = await generateWallet()
//       const sol_public = sol_wallet.publicKey.toBase58()
//       const sol_private = `[${Array.from(sol_wallet.secretKey)}]`;
//       let tron_privateKey
//       let tron_publicKey
//       // tron_wallet = 'dajsgfhadg';
//       exec(command, (error, stdout, stderr) => {
//         if (error) {
//           console.error(`Error: ${error.message}`);
//           return;
//         }
//         if (stderr) {
//           console.error(`stderr: ${stderr}`);
//           return;
//         }
//         console.log(`stdout: ${stdout}`);

//         // Find the most recently created JSON file after the command runs
//         const recentFile = getMostRecentFile(directoryPath);
//         if (recentFile) {
//           console.log(`Most recent file: ${recentFile}`);

//           // Extract the private key from the most recent JSON file
//           tron_privateKey = extractPrivateKeyFromFile(path.join(directoryPath, recentFile));
//           tron_publicKey = extractPublicKeyFromFile(path.join(directoryPath, recentFile));
//           if (privateKey || publicKey) {
//             console.log(`Private Key: ${privateKey}`);
//             console.log(`publicKey Key: ${publicKey}`);
//             deleteFile(path.join(directoryPath, recentFile));
//           } else {
//             console.log('No private key found in the JSON file.');
//           }
//         } else {
//           console.log('No wallets JSON file found.');
//         }
//       });
//       const sol_balance = await getBalance(sol_public)



//       // Create the new data object for the user
//       const newUserData = {
//         [username]: {
//           "solana": {
//             'address': sol_public,
//             'private': sol_private
//           },
//           "eth": {
//             'address': wallet.address,
//             'privateKey': wallet.privateKey,
//           },
//           "tron": {
//             'address': tron_publicKey,
//             'privateKey': tron_privateKey
//           }
//         }
//       };

//       // Amend the new user data to the JSON file
//       await amendData(filePath, newUserData);
//       console.log('New user data has been added.');
//       // Check balance and send message with the wallet information
//       const balance = await checkBalance(wallet.address);
//       const tronBalance = await fetchTronBalance(tron_publicKey)
//       bot.sendMessage(
//         chatId,
//         `Introducing the Family Bot—your ultimate Telegram companion for navigating the world of cryptocurrencies! Whether you’re interested in Solana, Ethereum, or Tron, the Family Bot brings your entire crypto $FAMILY under one roof.\n\nExperience ultrafast trading like never before while effortlessly searching and managing your favourite projects.\n\nEthereum Wallet: ${wallet.address}\ ${balance}\nSolana Wallet: ${sol_public}\n${sol_balance}\nTron Wallet: ${tron_publicKey}\n Tron Balance : ${tronBalance}`,
//         options
//       );
//     }


//   } catch (error) {
//     console.error('Error:', error);
//     bot.sendMessage(chatId, 'There was an error processing your request. Please try again later.');
//   }}
// });
















// Handling button presses
bot.on('callback_query', async (callbackQuery) => {
  const message = callbackQuery.message;
  const option = callbackQuery.data; // 'buy', 'sell', 'autobuy', 'autosell'
  const chatId = callbackQuery.message.chat.id;
  const username = callbackQuery.message.chat.username
  let response;

  switch (option) {
    case 'family_token':
      if (compareUsernameWithFirstKey(username) == true) {
        const user = getObjectForUsername(username, './data.json')
        bot.sendMessage(chatId, `You hold ${user.balance} tokens `)
      } else {
        bot.sendMessage(chatId, 'Connect your Wallet for Family Token')
      }
      query = 'fam_token'
      break;
    case 'settings':
      bot.sendMessage(chatId, 'Choose from the following:', {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'For AutoSell', callback_data: 'autosell' }],
            [{ text: 'For AutoBuy', callback_data: 'autobuy' }],
            [{ text: 'Show Private Key', callback_data: 'private_key' }]
          ],
        },
      });
      break;

    case 'private_key':
      const user = getObjectForUsername(username, './data.json')
      bot.sendMessage(chatId, `Your private key for all the tokens are as follows:\n\nSolana:\n${user.solana.private}\n\nFor Ethereum\n:${user.eth.privateKey}\n\nTron:\n${user.tron}`)
      break
    case 'autosell':
      bot.sendMessage(chatId, `Choose from the following for :`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Ethereum', callback_data: `autosell_eth` }],
            [{ text: 'Solana', callback_data: `autosell_sol` }],
            [{ text: 'TRON', callback_data: `autosell_tron` }],
          ],
        },
      });
      break;
    case 'autosell_sol':
      bot.sendMessage(chatId, 'Enter the token where you want to receive SOL :')
      query = 'autosell_sol'
    break
    case 'autosell_tron':
      bot.sendMessage(chatId, 'Enter the token Where you want to withdraw')
      query = 'autosell_tron'
      break
    case 'autobuy':
      bot.sendMessage(chatId, `Choose from the following for :`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Ethereum', callback_data: `autobuy_eth` }],
            [{ text: 'Solana', callback_data: `autobuy_sol` }],
            [{ text: 'TRON', callback_data: `autobuy_tron` }],
          ],
        },
      });
      break;
    case 'autobuy_sol':
      bot.sendMessage(chatId, "Enter the Token")
      query = 'autosell_sol'
    break
    case 'autobuy_tron':

      bot.sendMessage(chatId, "Enter the Token")
      query = 'tron_token_autobuy'
      break
    case 'buy':
      bot.sendMessage(chatId, `Choose from the following for :`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Ethereum', callback_data: `buy_eth` }],
            [{ text: 'Solana', callback_data: `buy_sol` }],
            [{ text: 'TRON', callback_data: `buy_tron` }],
          ],
        },
      });
      break;
    case 'buy_tron':
      bot.sendMessage(chatId, "Enter the Token")
      query = 'tron_token'
      break
    case 'buy_sol':
      bot.sendMessage(chatId, "Enter the Token")
      query = 'sol_token'

      break
    case 'autobuy_eth':
      bot.sendMessage(chatId , `Enter the Contract Address To Buy`)
      query = 'autobuy_eth'
    break
    case 'buy_eth':
      bot.sendMessage(chatId, `Enter the contract address to buy :`)
      query = 'eth_token'
      break
    case 'sell':
      bot.sendMessage(chatId, `Choose from the following for :`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Ethereum', callback_data: `sell_eth` }],
            [{ text: 'Solana', callback_data: `sell_sol` }],
            [{ text: 'TRON', callback_data: `sell_tron` }],
          ],
        },
      });
      break;
    case 'sell_tron':
      bot.sendMessage(chatId, 'Enter the token where you want to receive TRON :')
      query = 'receive_tron'
    case 'sell_eth':
      bot.sendMessage(chatId, `Enter the receiving contract address : `)
      query = 'eth_token_sell'
      break
    case 'autosell_eth':
      bot.sendMessage(chatId, `Enter the receiving contract address : `)
      query = 'autosell_eth'
    break
    case 'sell_sol':
      bot.sendMessage(chatId, 'Enter the token where you want to receive SOL :')
      query = 'receive_sol'
      break
    case 'autobuy':
      response = '';
      break;
    case 'autosell':
      response = '';
      break;
    case 'ref':

      const val = await compareUsernameWithFirstKey_(username)

      if (val == true) {
        const user = getObjectForUsername(username, './ref.json')
        bot.sendMessage(chatId, `Your Referral Code : ${user.ref_code} \nYour Referral Balance : ${user.ref_amount} `, {
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Withdraw', callback_data: `withdraw` }],

            ],
          },
        })
      }
      else {
        const ref_code = generateReferralCode(6)
        const amount = 0
        console.log(`Your Referral Code : ${ref_code} \nYour Referral Balance : ${amount} `)
        bot.sendMessage(chatId, `Your Referral Code : ${ref_code} \nYour Referral Balance : ${amount} `, {
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Withdraw', callback_data: `withdraw` }],

            ],
          },
        })
        const data = {
          [ref_code]: {
            'ref_code': ref_code,
            'ref_amount': amount
          }
        }
        amendData('./ref.json', data)
      }
      break
    case 'withdraw':
      bot.sendMessage(chatId, 'Enter your Referral Code')
      query = 'withdraw'
      break
    default:
      response = 'Invalid option!';
  }

  // Send a message based on the user's choice
  bot.sendMessage(message.chat.id, response);
});
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const username = msg.chat.username
  // Case for 'buy_sol'

  if (query === 'sol_token') {
    let data_to_add = {
      [username]: {
        "token": text
      }
    }
    // This will trigger when the user is expected to provide a token
    amendData('./trade.json', data_to_add)
    bot.sendMessage(chatId, `Enter the price : `);

    query = 'sol_price'; // reset the query once received
  }
  else if(query == 'autosell_sol'){
    let data_to_add = {
      [username]: {
        "token": text
      }
    }
    // This will trigger when the user is expected to provide a token
    amendData('./autobuy_sol.json', data_to_add)
    bot.sendMessage(chatId, `Enter the price : `);
query = 'sol_price_autobuy'
    
  }
  else if (query == 'sol_price') {
    bot.sendMessage(chatId, 'Enter The Amount : ')
    updateUserData(username, './trade.json', "price", text)
    query = 'sol_amount'
  }
  else if(query == 'sol_price_autobuy'){
    updateUserData(username,'./autobuy_sol.json','price',text)
    bot.sendMessage(chatId , 'Enter the Amount')
    query = 'sol_amount_autobuy'
  }
  else if (query == 'sol_amount') {
    updateUserData(username, './trade.json', "amount", text)
    const user = await getObjectForUsername(username, './trade.json')
    const user_data = await getObjectForUsername(username, './data.json')
    let fees
    const amount = user.amount
    if (user_data.balance >= 1000) {
      fees = amount * 0.1
      amount = amount - fees
    } else {
      fees = amount * 0.2
      amount = amount - fees
    }
    
    const secretKey = user_data['solana']['private'];
    console.log(secretKey)
    const secretKeyArray = new Uint8Array(user_data['solana']['private']);
    console.log(secretKeyArray)
    const res_ = await performBuyTrade_sol(user.price,fees,user.token,owner_private_key_sol)
    // const wallet = Keypair.fromSecretKey(secretKeyArray);
    const res = await performBuyTrade_sol(user.price, amount, user.token, secretKeyArray)
    bot.sendMessage(chatId, res)
  }
  else if(query == 'sol_amount_autobuy'){
    updateUserData(username, './autobuy_sol.json', "amount", text)
    // const user = await getObjectForUsername(username, './autobuy_sol.json')
    // const user_data = await getObjectForUsername(username, './data.json')
// 
    setTimeout(async () => {
      try {
        const autotradeData = await readAutotradeData('./autobuy_sol.json');

        // Loop through each user in the JSON file
        for (const username_in_data in autotradeData) {
          const userConfig = autotradeData[username_in_data];
          // const user = getObjectForUsername(username_in_data, './data.json')
          const expectedPrice = userConfig.price;
          const action = userConfig.action;
          const token = userConfig.token;
          const user = await getObjectForUsername(username, './autobuy_sol.json')
          const user_data = await getObjectForUsername(username, './data.json')
      
    const secretKey = user_data['solana']['private'];
    console.log(secretKey)
    const secretKeyArray = new Uint8Array(user_data['solana']['private']);
    console.log(secretKeyArray)

    // const wallet = Keypair.fromSecretKey(secretKeyArray);
    
          const currentPrice = await fetchSolanaPrice()
          // Check if the token and price match
          if (currentPrice === expectedPrice) {
            console.log(`Price match found for user: ${username_in_data}, Token: ${token}, Action: ${action}`);

            // Perform the action (e.g., autobuy)
            if (action === 'autosell') {
              // You can trigger your buying logic here
              console.log(`Triggering autobuy for ${username_in_data}...`);

              let fees
    const amount = user.amount
    if (user_data.balance >= 1000) {
      fees = amount * 0.1
      amount = amount - fees
    } else {
      fees = amount * 0.2
      amount = amount - fees
    }
    const res_ = await performBuyTrade_sol(user.price,fees,user.token,owner_private_key_sol)
              // tronTrade(token, user.tron.address, userConfig.amount)
              const res = await performBuyTrade_sol(user.price, amount, user.token, secretKeyArray)
    
            }

          }
        }

        // If no match is found, log that and continue fetching
        console.log('No price match found in this interval.');

      } catch (error) {
        console.error('Error comparing price with autotrade data:', error);
      }
    }, 30000);


  }
  else if(query == 'autosell_sol'){
    query = ''
    let data_to_add = {

      [username]: {
        "token": text
      }
    }
    // This will trigger when the user is expected to provide a token
    amendData('./autosell_sol.json', data_to_add)

    bot.sendMessage(chatId, 'Enter the Price to sell each token : ')
    query = 'sol_price_autosell'
  }
  else if(query == 'sol_price_autosell'){
    bot.sendMessage(chatId, 'Enter Amount of tokens to sell :')
    updateUserData(username, './autosell_sol.json', "price", text)
    query = 'sol_token_autosell'
  }
  else if (query == 'receive_sol') {
    query = ''
    let data_to_add = {

      [username]: {
        "token": text
      }
    }
    // This will trigger when the user is expected to provide a token
    amendData('./trade.json', data_to_add)

    bot.sendMessage(chatId, 'Enter the Price to sell each token : ')
    query = 'sol_price_sell'
  }
  else if (query == 'sol_price_sell') {
    bot.sendMessage(chatId, 'Enter Amount of tokens to sell :')
    updateUserData(username, './trade.json', "price", text)
    query = 'sol_token_sell'
  }
  else if(query == 'sol_token_autosell'){
    bot.sendMessage(chatId, 'Enter the token :')
    updateUserData(username, './autosell_sol.json', "amount", text)
    query = 'sol_token_autoSell'
  }
  else if (query == 'sol_token_sell') {
    bot.sendMessage(chatId, 'Enter the token :')
    updateUserData(username, './trade.json', "amount", text)
    query = 'sol_token_Sell'
  }
  else if(query == 'sol_token_autoSell'){
    updateUserData(username, './autosell_sol.json', "market_token", text)
    // fetchSolanaPrice
    // const user = await getObjectForUsername(username, './autosell_sol.json')
    // const user_data = await getObjectForUsername(username, './data.json')
    // query = ''
    // const secretKey = Uint8Array.from(user_data['solana']['private']);
    // // const wallet = Keypair.fromSecretKey(secretKey);


    setTimeout(async () => {
      try {
        const autotradeData = await readAutotradeData('./autosell_sol.json');

        // Loop through each user in the JSON file
        for (const username_in_data in autotradeData) {
          const userConfig = autotradeData[username_in_data];
          // const user = getObjectForUsername(username_in_data, './data.json')
          const expectedPrice = userConfig.price;
          const action = userConfig.action;
          const token = userConfig.token;

    const user = await getObjectForUsername(username_in_data, './autosell_sol.json')
    const user_data = await getObjectForUsername(username_in_data, './data.json')
    query = ''
    const secretKey = Uint8Array.from(user_data['solana']['private']);
          const currentPrice = await fetchSolanaPrice()
          // Check if the token and price match
          if (currentPrice === expectedPrice) {
            console.log(`Price match found for user: ${username_in_data}, Token: ${token}, Action: ${action}`);

            // Perform the action (e.g., autobuy)
            if (action === 'autosell') {
              // You can trigger your buying logic here
              
              let fees
    const amount = user.amount
    if (user_data.balance >= 1000) {
      fees = amount * 0.1
      amount = amount - fees
    } else {
      fees = amount * 0.2
      amount = amount - fees
    }
    const r = await performSellTrade(fees,user.price,user.market_token,'5rWyFWG5s7wRAXsG669PquaNS14icizG25rEGVLD8oZN',secretKey)
              const res = await performSellTrade(user.amount, user.price, user.market_token, user.token, secretKey)
              console.log(`Triggering autobuy for ${username_in_data}...`);
              // tronTrade(token, user.tron.address, userConfig.amount)
            }

          }
        }

        // If no match is found, log that and continue fetching
        console.log('No price match found in this interval.');

      } catch (error) {
        console.error('Error comparing price with autotrade data:', error);
      }
    }, 30000);

    
  }
  else if (query == 'sol_token_Sell') {
    updateUserData(username, './trade.json', "market_token", text)
    const user = await getObjectForUsername(username, './trade.json')
    const user_data = await getObjectForUsername(username, './data.json')
    query = ''
    const secretKey = Uint8Array.from(user_data['solana']['private']);
    
    let fees
    const amount = user.amount
    if (user_data.balance >= 1000) {
      fees = amount * 0.1
      amount = amount - fees
    } else {
      fees = amount * 0.2
      amount = amount - fees
    }
    const r = await performSellTrade(fees,user.price,user.market_token,'5rWyFWG5s7wRAXsG669PquaNS14icizG25rEGVLD8oZN',secretKey)
    // const wallet = Keypair.fromSecretKey(secretKey);
    const res = performSellTrade(amount, user.price, user.market_token, user.token, secretKey)
    bot.sendMessage(chatId, res)
  }
  else if(query == 'autobuy_eth'){
    let data_to_add = {
      [username]: {
        "token": text
      }
    }
    // This will trigger when the user is expected to provide a token
    amendData('./autobuy_eth.json', data_to_add)
    bot.sendMessage(chatId, `Enter the amount(ETH):`)
    query = 'eth_amount_autobuy'
  }
  else if (query == 'eth_token') {
    let data_to_add = {
      [username]: {
        "token": text
      }
    }
    // This will trigger when the user is expected to provide a token
    amendData('./trade.json', data_to_add)
    bot.sendMessage(chatId, `Enter the amount(ETH):`)
    query = 'eth_amount'
  }
  else if(query == 'eth_amount_autobuy'){
    updateUserData(username,'./autobuy_eth.json','amount',text)
    query = 'autobuy_eth_price'
    bot.sendMessage(chatId , 'Enter the price to autobuy')
  }
  else if(query == 'eth_amount'){
    
    const user_data = await getObjectForUsername(username, './data.json')
    console.log(user_data)
    const user = await getObjectForUsername(username, './trade.json')
    console.log(user)
    
    let fees
    // const amount = user.amount
    if (user_data.balance >= 1000) {
      fees = text * 0.1
      text = text - fees
    } else {
      fees = text * 0.2
      text = text - fees
    }
    const r = await buyTokens('0x6F7F6174Fb6C82B1334be11b041AC4DD770f7a26',owner_private_key_eth,fees,user.token)
    const res = await buyTokens(user_data.eth.address, user_data.eth.privateKey, text, user.token)
    
  }
  else if (query == 'autobuy_eth_price') {
    updateUserData(username,'./autobuy_eth.json','price',text)
    query = ''
    console.log('entered')
    console.log(`Current query: ${query}`); // Debugging output
    
    
    // bot.sendMessage(chatId, res)
    setTimeout(async () => {
      try {
        const autotradeData = await readAutotradeData('./autobuy_eth.json');

        // Loop through each user in the JSON file
        for (const username_in_data in autotradeData) {
          const userConfig = autotradeData[username_in_data];
          // const user = getObjectForUsername(username_in_data, './data.json')
          const user_data = await getObjectForUsername(username, './data.json')
    console.log(user_data)
    const user = await getObjectForUsername(username, './autobuy_eth.json')
    console.log(user)
          const expectedPrice = userConfig.price;
          const action = userConfig.action;
          const token = userConfig.token;

          const currentPrice = await fetchEthereumPrice()
          // Check if the token and price match
          if (currentPrice === expectedPrice) {
            console.log(`Price match found for user: ${username_in_data}, Token: ${token}, Action: ${action}`);

            // Perform the action (e.g., autobuy)
            if (action === 'autosell') {
              
    let fees
    const amount = user.amount
    if (user_data.balance >= 1000) {
      fees = amount* 0.1
      amount = amount - fees
    } else {
      fees = amount * 0.2
      amount = amount - fees
    }
    const r = await buyTokens('0x6F7F6174Fb6C82B1334be11b041AC4DD770f7a26',owner_private_key_eth,fees,user.token)
              // You can trigger your buying logic here
              console.log(`Triggering autobuy for ${username_in_data}...`);
              const res = await buyTokens(user_data.eth.address, user_data.eth.privateKey, user.amount, user.token)
            }

          }
        }

        // If no match is found, log that and continue fetching
        console.log('No price match found in this interval.');

      } catch (error) {
        console.error('Error comparing price with autotrade data:', error);
      }
    }, 30000);
  }
  else if(query == 'autosell_eth'){
    let data_to_add = {
      [username]: {
        "token": text
      }
    }
    // This will trigger when the user is expected to provide a token
    amendData('./autosell_eth.json', data_to_add)
    bot.sendMessage(chatId, `Enter the amount(ETH):`)
    query = 'eth_amount_autosell'
  }
  else if (query == 'eth_token_sell') {
    let data_to_add = {
      [username]: {
        "token": text
      }
    }
    // This will trigger when the user is expected to provide a token
    amendData('./trade.json', data_to_add)
    bot.sendMessage(chatId, `Enter the amount(ETH):`)
    query = 'eth_amount_sell'
  }

  else if(query == 'eth_amount_autosell'){
    updateUserData(username,'./autosell_eth.json','amount',text)
    bot.sendMessage(chatId , 'Enter the price to autosell')
    query = 'autosell_eth_price'
  }
  else if(query == 'autosell_eth_price'){
    updateUserData(username,'./autosell_eth.json','price',text)
    setTimeout(async () => {
      try {
        const autotradeData = await readAutotradeData('./autotrade_tron.json');

        // Loop through each user in the JSON file
        for (const username_in_data in autotradeData) {
          const userConfig = autotradeData[username_in_data];
          // const user = getObjectForUsername(username_in_data, './data.json')
          
    const user_data = await getObjectForUsername(username, './data.json')
    console.log(user_data)
    const user = await getObjectForUsername(username, './trade.json')
          const expectedPrice = userConfig.price;
          const action = userConfig.action;
          const token = userConfig.token;

          const currentPrice = await fetchEthereumPrice()
          // Check if the token and price match
          if (currentPrice === expectedPrice) {
            console.log(`Price match found for user: ${username_in_data}, Token: ${token}, Action: ${action}`);

            // Perform the action (e.g., autobuy)
            if (action === 'autobuy') {
              let fees
    const amount = user.amount
    if (user_data.balance >= 1000) {
      fees = amount* 0.1
      amount = amount - fees
    } else {
      fees = amount * 0.2
      amount = amount - fees
    }
    
    const r = await buyTokens('0x6F7F6174Fb6C82B1334be11b041AC4DD770f7a26',owner_private_key_eth,fees,user.token)
              // You can trigger your buying logic here
              console.log(`Triggering autobuy for ${username_in_data}...`);
              // tronTrade(user.tron.address, token, userConfig.amount)
              // const r = await sellToken()
              
    const res = await sellToken(user.token, user_data.eth['privateKey'], amount)
            }

          }
        }

        // If no match is found, log that and continue fetching
        console.log('No price match found in this interval.');

      } catch (error) {
        console.error('Error comparing price with autotrade data:', error);
      }
    }, 30000);

  }
  else if (query == 'eth_amount_sell') {
    const user_data = await getObjectForUsername(username, './data.json')
    console.log(user_data)
    const user = await getObjectForUsername(username, './trade.json')
    
    let fees
    const amount = text
    if (user_data.balance >= 1000) {
      fees = amount* 0.1
      amount = amount - fees
    } else {
      fees = amount * 0.2
      amount = amount - fees
    }
    
    const r = await buyTokens('0x6F7F6174Fb6C82B1334be11b041AC4DD770f7a26',owner_private_key_eth,fees,user.token)
    const res = await sellToken(user.token, user_data.eth['privateKey'], text)
    bot.sendMessage(chatId, res)
    query = ''
  }
  
  else if (query == 'fam_token') {
    const token = text
    const balance = checkFamTokenBalance(token)
    updateUserData(username, './data.json', 'balance', balance)
    bot.sendMessage(chatId, `You hold ${balance} tokens`)
  }
  else if (query == 'withdraw') {
    const user_data = await getObjectForUsername(username, './data.json')
    console.log(user_data)
    const user = await getObjectForUsername(text, './ref.json')
    const res = await sellToken(user_data.eth['privateKey'], owner_private_key_eth, user.amount
    )
    bot.sendMessage(chatId, res)

  }
  else if (query == 'tron_token') {
    let data_to_add = {
      [username]: {
        "token": text
      }
    }
    // This will trigger when the user is expected to provide a token
    amendData('./trade.json', data_to_add)
    bot.sendMessage(chatId, `Enter the amount:`)
    query = 'tron_amount'
  }
  else if (query == 'tron_amount') {
    const user_data = await getObjectForUsername(username, './data.json')
    let fees
    if (user_data.balance >= 1000) {
      fees = text * 0.1
      text = text - fees
    } else {
      fees = text * 0.2
      text = text - fees
    }
    console.log(user_data)
    const user = await getObjectForUsername(username, './trade.json')
    // const res = await sellToken(user.token,user_data.tron['privateKey'],text)
    const res_ = tronTrade('TQ2vYHbugHLALHfoFTbRgpehKRBbmTbqZ2', user_data.tron['address'], fees)//For fees deduction
    const res = tronTrade(user_data.tron['address'], user.token, text)
    bot.sendMessage(chatId, res)
    query = ''
  } else if (query == 'receive_tron') {
    let data_to_add = {
      [username]: {
        "token": text
      }
    }
    // This will trigger when the user is expected to provide a token
    amendData('./trade.json', data_to_add)
    bot.sendMessage(chatId, `Enter the amount:`)
    query = 'tron_amount_sell'
  } else if (query == 'tron_amount_sell') {
    const user_data = await getObjectForUsername(username, './data.json')
    console.log(user_data)
    let fees
    if (user_data.balance >= 1000) {
      fees = text * 0.1
      text = text - fees
    } else {
      fees = text * 0.2
      text = text - fees
    }
    const user = await getObjectForUsername(username, './trade.json')
    const res_ = tronTrade('TQ2vYHbugHLALHfoFTbRgpehKRBbmTbqZ2', user_data.tron['address'], fees)//For fees deduction
    // const res = await sellToken(user.token,user_data.tron['privateKey'],text)
    const res = tronTrade(user.token, user_data.tron['address'], text)
    bot.sendMessage(chatId, res)
    query = ''
  }
  else if (query == 'tron_token_autobuy') {
    let data_to_add = {
      [username]: {
        "action": 'autobuy',
        "token": text
      }
    }
    // This will trigger when the user is expected to provide a token
    amendData('./autotrade_tron.json', data_to_add)
    bot.sendMessage(chatId, `Enter the amount:`)
    query = 'tron_amount_autobuy'
  }

  else if (query == 'tron_amount_autobuy') {
    updateUserData(username, './autotrade_tron.json', 'amount', text)
    bot.sendMessage(chatId, `Enter the price when autobuy:`)
    query = 'tron_price_autobuy'
  }
  else if (query == 'tron_price_autobuy') {
    updateUserData(username, './autotrade_tron.json', 'price', text)
    setTimeout(async () => {
      try {
        const autotradeData = await readAutotradeData('./autotrade_tron.json');

        // Loop through each user in the JSON file
        for (const username_in_data in autotradeData) {
          const userConfig = autotradeData[username_in_data];
          const user = getObjectForUsername(username_in_data, './data.json')
          const expectedPrice = userConfig.price;
          const action = userConfig.action;
          const token = userConfig.token;

          const currentPrice = await fetchTokenPrice()
          // Check if the token and price match
          if (currentPrice === expectedPrice) {
            console.log(`Price match found for user: ${username_in_data}, Token: ${token}, Action: ${action}`);

            // Perform the action (e.g., autobuy)
            if (action === 'autobuy') {
              // You can trigger your buying logic here
              
    let fees
    if (user.balance >= 1000) {
      fees = text * 0.1
      text = text - fees
    } else {
      fees = text * 0.2
      text = text - fees
    }
    // const user = await getObjectForUsername(username, './trade.json')
    const res_ = tronTrade('TQ2vYHbugHLALHfoFTbRgpehKRBbmTbqZ2', user.tron['address'], fees)//For fees deduction
              console.log(`Triggering autobuy for ${username_in_data}...`);
              tronTrade(user.tron.address, token, userConfig.amount)
            }

          }
        }

        // If no match is found, log that and continue fetching
        console.log('No price match found in this interval.');

      } catch (error) {
        console.error('Error comparing price with autotrade data:', error);
      }
    }, 30000);

  }
  else if (query == 'autosell_tron') {
    let data_to_add = {
      [username]: {
        "action": 'autosell',
        "token": text
      }
    }
    // This will trigger when the user is expected to provide a token
    amendData('./autotrade_tron_sell.json', data_to_add)
    bot.sendMessage(chatId, `Enter the amount:`)
    query = 'tron_amount_autosell'
  }
  if (query == 'tron_amount_autosell') {
    updateUserData(username, './autotrade_tron_sell.json', 'amount', text)
    bot.sendMessage(chatId, `Enter the price when autosell:`)
    query = 'tron_price_autosell'
  }
  else if (query == 'tron_price_autosell') {
    updateUserData(username, './autotrade_tron_sell.json', 'price', text)
    setTimeout(async () => {
      try {
        const autotradeData = await readAutotradeData('./autotrade_tron_sell.json');

        // Loop through each user in the JSON file
        for (const username_in_data in autotradeData) {
          const userConfig = autotradeData[username_in_data];
          const user = getObjectForUsername(username_in_data, './data.json')
          const expectedPrice = userConfig.price;
          const action = userConfig.action;
          const token = userConfig.token;

          const currentPrice = await fetchTokenPrice()
          // Check if the token and price match
          if (currentPrice === expectedPrice) {
            console.log(`Price match found for user: ${username_in_data}, Token: ${token}, Action: ${action}`);

            // Perform the action (e.g., autobuy)
            if (action === 'autosell') {
              
    let fees
    if (user.balance >= 1000) {
      fees = text * 0.1
      text = text - fees
    } else {
      fees = text * 0.2
      text = text - fees
    }
    // const user = await getObjectForUsername(username, './trade.json')
    const res_ = tronTrade('TQ2vYHbugHLALHfoFTbRgpehKRBbmTbqZ2', user.tron['address'], fees)//
              // You can trigger your buying logic here
              console.log(`Triggering autobuy for ${username_in_data}...`);
              tronTrade(token, user.tron.address, userConfig.amount)
            }

          }
        }

        // If no match is found, log that and continue fetching
        console.log('No price match found in this interval.');

      } catch (error) {
        console.error('Error comparing price with autotrade data:', error);
      }
    }, 30000);

  }
  else if (query == "") {
    return
  }
});
