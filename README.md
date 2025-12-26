# MatsumiGuard - Security Agent for Cardano Hackathon Asia 2025

A comprehensive risk and compliance scoring engine for Cardano transactions, built for the Cardano Hackathon Asia 2025.

## 🚀 Features

- **Real-time Transaction Risk Analysis**: Analyze Cardano transactions for potential risks
- **Compliance Scoring**: Automated scoring based on transaction patterns and AML criteria
- **Blockfrost Integration**: Leverages Blockfrost API for blockchain data
- **Modern Web Dashboard**: Clean, responsive UI built with Next.js and Tailwind CSS
- **RESTful API**: FastAPI backend with comprehensive endpoints
- **Demo Data Generation**: Realistic fake transaction data for testing

## 🛠 Tech Stack

### Backend
- **Python 3.11+**
- **FastAPI**: High-performance async web framework
- **Uvicorn**: ASGI server
- **Pydantic**: Data validation
- **httpx**: Async HTTP client

### Frontend
- **Next.js 14**: React framework
- **Tailwind CSS**: Utility-first CSS framework
- **React Hooks**: Modern state management

### Blockchain
- **Cardano**: Blockchain platform
- **Blockfrost API**: Cardano blockchain data provider

## 📋 Prerequisites

- Python 3.11 or higher
- Node.js 18 or higher
- Blockfrost API key (get from https://blockfrost.io)

## 🔧 Installation & Setup

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/akshaykun-05/MatsumiGuard-security-agent-for-cardano-hackthon-2025.git
   cd MatsumiGuard-security-agent-for-cardano-hackthon-2025
   ```

2. **Create virtual environment**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set environment variables**
   ```bash
   export BLOCKFROST_API_KEY=your_api_key_here
   ```

5. **Run the backend**
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

## 🌐 Usage

1. **Start Backend**: Ensure the FastAPI server is running on http://localhost:8000
2. **Start Frontend**: Open http://localhost:3000 in your browser
3. **Analyze Transactions**: Enter a Cardano transaction hash to get risk analysis

### API Endpoints

- `GET /health` - Health check
- `GET /api/test` - Test endpoint
- `POST /api/analyzeTransaction` - Analyze transaction risk

## 🚀 Deployment

### Backend Deployment (Heroku)

1. **Create Heroku app**
   ```bash
   heroku create your-app-name
   heroku buildpacks:add heroku/python
   ```

2. **Set environment variables**
   ```bash
   heroku config:set BLOCKFROST_API_KEY=your_key_here
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

### Frontend Deployment (Vercel)

1. **Connect to Vercel**: Import your GitHub repository
2. **Configure build settings**:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`
3. **Add environment variable**: `NEXT_PUBLIC_API_URL=https://your-backend-url`

## 📊 Project Structure

```
cardano/
├── main.py                 # FastAPI application
├── requirements.txt        # Python dependencies
├── Procfile               # Heroku deployment
├── runtime.txt            # Python version for Heroku
├── README.md              # Project documentation
├── routes/
│   └── transactions.py    # Transaction analysis endpoints
├── schemas/
│   ├── requests.py        # Request models
│   └── responses.py       # Response models
├── services/
│   ├── blockfrost_client.py # Blockfrost API client
│   └── risk_engine.py     # Risk analysis logic
└── frontend/
    ├── components/        # React components
    ├── pages/            # Next.js pages
    ├── styles/           # CSS styles
    └── package.json      # Node dependencies
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is submitted for the Cardano Hackathon Asia 2025.

## 👥 Team

- **Developer**: Akshay Kumar Sahu
- **Project**: MatsumiGuard Security Agent

## 🔗 Links

- **GitHub Repository**: https://github.com/akshaykun-05/MatsumiGuard-security-agent-for-cardano-hackthon-2025
- **Live Demo**: [Add deployed URL here]
- **Cardano Hackathon**: https://hackathon.cardano.org/