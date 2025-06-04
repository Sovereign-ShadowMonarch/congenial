# Financial-agent

This project is a multi-agent system designed to provide financial analysis and web search capabilities using the `phidata` library. The system consists of two primary agents: a **Web Search Agent** and a **Financial Agent**, which work together to provide comprehensive financial insights and market news.

## Features

- **Web Search Agent**: Searches the web for relevant information using DuckDuckGo.
- **Financial Agent**: Retrieves financial data such as stock prices, analyst recommendations, stock fundamentals, and company news using `yfinance`.
- **Multi-Agent System**: Combines the capabilities of both agents to provide a comprehensive analysis of financial data and market news.

## Installation
   cd financial-agent-with-phidata
   ```

2. **Set up a virtual environment** (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. **Install the required dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:
   - Create a `.env` file in the root directory of the project.
   - Add your OpenAI API key to the `.env` file:
     ```plaintext
     OPENAI_API_KEY=your_openai_api_key_here
     ```

### Example Output

The multi-agent system will provide a detailed analysis, including:

- **Analyst Recommendations**: A summary of analyst recommendations for the specified stock.
- **Latest News**: The latest news articles related to the stock, sourced from the web.
- **Financial Data**: Key financial metrics and fundamentals presented in tables.

## Dependencies

The project relies on the following Python packages:

- `phidata`: For creating and managing agents.
- `python-dotenv`: For loading environment variables.
- `yfinance`: For retrieving financial data.
- `packaging`: For version management.
- `duckduckgo-search`: For web search capabilities.
- `fastapi`: For building APIs (optional, if you plan to expose the agent as a service).
- `uvicorn`: For running the FastAPI server (optional).

