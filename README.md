# FireCare Emergency Network 🔥🛡️

An advanced Web3 integrated, AI-verified, localized emergency response dashboard. FireCare leverages localized Hardhat blockchains, Gemini AI Vision, and Expo to provide highly secure, instantaneous crisis dispatches. 

---

## ⚡ How To Run the Application Locally

You will need **4 separate terminal windows** open in the background to run the full application. Make sure you complete each step in order!

### Terminal 1: Spin up the Local Blockchain
This creates your local `testnet` and holds the accounts.
```bash
cd c:\Users\Asus\.vscode\hospi\blockchain
npx hardhat node --hostname 0.0.0.0
```

### Terminal 2: Deploy the Web3 Smart Contracts
Leave Terminal 1 open. Open a new terminal to compile and inject your `ResponderSBT` smart contracts directly into the node.
```bash
cd c:\Users\Asus\.vscode\hospi\blockchain
npx hardhat run scripts/deploy.js --network localhost
```

### Terminal 3: Start the Google AI Fast API Server
Open a new terminal to start the AI analysis infrastructure.
```bash
cd c:\Users\Asus\.vscode\hospi\backend
.\venv\Scripts\activate
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Terminal 4: Launch the Mobile Application (React Native)
Open your final terminal to boot the Expo Metro Bundler.
```bash
cd c:\Users\Asus\.vscode\hospi\frontend
npx expo start --clear
```

### 📱 Running on your phone
Simply open the **Expo Go** app on your Android or iPhone device and scan the QR Code that pops up in **Terminal 4**. 
*(Note: Ensure your Laptop and your Phone are connected to exactly the same Wi-Fi Network so the App can successfully reach the Local Blockchain!)*
