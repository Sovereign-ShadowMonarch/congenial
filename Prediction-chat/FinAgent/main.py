import sys
import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Union

from phi.agent import Agent #type:ignore
from phi.tools.yfinance import YFinanceTools #type:ignore
from phi.tools.duckduckgo import DuckDuckGo #type:ignore
from phi.model.openai import OpenAIChat #type:ignore
import yfinance as yf

from dotenv import load_dotenv
load_dotenv('/Users/chakradharishiva/Desktop/Major_Project/Prediction-chat/FinAgent/.env')

# web search agent 
websearch_agent = Agent(
    name="web search agent",
    role="search the web for the information",
    model=OpenAIChat(id="gpt-3.5-turbo-0125"),
    tools=[DuckDuckGo()],
    instructions=[
        "Always include sources",
        "When searching for cryptocurrency information, focus on market sentiment, recent price movements, and regulatory news",
        "For crypto assets, search for technical analysis insights, trading volume trends, and market sentiment indicators",
        "Use cryptocurrency-specific terminology when appropriate (e.g., 'market cap', 'trading volume', 'bullish/bearish patterns')"
    ],
    show_tool_calls=True,
    markdown=True
)

# financial agent 
financial_agent = Agent(
    name="finance ai agent",
    model=OpenAIChat(id="gpt-3.5-turbo-0125"),
    tools=[YFinanceTools(stock_price=True, analyst_recommendations=True, stock_fundamentals=True, company_news=True)],
    instructions=[
        "Use tables to display the data",
        "For cryptocurrencies, use the ticker format like BTC-USD, ETH-USD, etc.",
        "When analyzing cryptocurrencies, focus on price action, market cap, volume, 24h change, and 7d change",
        "For crypto assets, use appropriate metrics: price, market capitalization, circulating supply, trading volume, and price trends",
        "Present cryptocurrency data with relevant terminology: ATH (all-time high), support/resistance levels, market dominance",
        "Note that traditional stock metrics like PE ratio, dividends, and EPS are not applicable to cryptocurrencies",
        "When encountering 'Error fetching analyst recommendations' for cryptocurrencies, explain that traditional analyst recommendations don't apply to crypto assets"
    ],
    show_tool_calls=True,
    markdown=True
)

# Multi-agent setup
multi_ai_agent = Agent(
    name="Multi AI Team",
    team=[websearch_agent, financial_agent],
    model=OpenAIChat(id="gpt-3.5-turbo-0125"),
    instructions=[
        "Always include sources and citations",
        "Use tables to display structured data",
        "Combine financial data with relevant market news",
        "Provide comprehensive analysis using both agents' capabilities",
        "When analyzing stocks, include analyst recommendations, price targets, and company fundamentals",
        "When analyzing cryptocurrencies:",
        "  - Use crypto-specific metrics: price, market cap, trading volume, 24h change, ATH, circulating supply",
        "  - Include technical indicators like moving averages, RSI if available",
        "  - Format as 'Cryptocurrency Analysis' instead of 'Stock Analysis'",
        "  - Focus on market sentiment, on-chain metrics, and trading patterns",
        "  - Explain that traditional metrics like P/E ratio and analyst recommendations aren't applicable",
        "  - Include relevant news about blockchain technology, regulation, and adoption"
    ],
    show_tool_calls=True,
    markdown=True,
    monitoring=True,
)

# Crypto analysis tools
def analyze_crypto_technical_indicators(symbol: str) -> Dict[str, Any]:
    """Analyze cryptocurrency technical indicators and provide buy/sell signals"""
    try:
        # Get historical data for analysis
        data = yf.download(symbol, period="6mo")
        if data.empty:
            return {"error": f"No data found for {symbol}"}
            
        # Calculate current price and moving averages
        current_price = float(data['Close'].iloc[-1])
        ma7 = float(data['Close'].rolling(window=7).mean().iloc[-1])  # 7-day MA
        ma25 = float(data['Close'].rolling(window=25).mean().iloc[-1])  # 25-day MA
        ma99 = float(data['Close'].rolling(window=99).mean().iloc[-1])  # 99-day MA
        
        # Calculate RSI
        delta = data['Close'].diff()
        gain = delta.where(delta > 0, 0)
        loss = -delta.where(delta < 0, 0)
        
        avg_gain = gain.rolling(window=14).mean()
        avg_loss = loss.rolling(window=14).mean()
        
        # Avoid division by zero
        avg_loss = avg_loss.replace(0, 0.001)
        
        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs.iloc[-1]))
        
        # Calculate recent price changes
        week_ago_idx = -min(7, len(data))
        month_ago_idx = -min(30, len(data))
        
        week_change = ((current_price / float(data['Close'].iloc[week_ago_idx]) - 1) * 100) 
        month_change = ((current_price / float(data['Close'].iloc[month_ago_idx]) - 1) * 100)
        
        # Generate buy/sell signals
        buy_signals = []
        sell_signals = []
        
        # 1. Moving average crossover
        if ma7 > ma25 and ma7 > ma99:
            buy_signals.append("7-day MA above 25-day and 99-day MA (bullish)")
        
        if ma7 < ma25 and ma7 < ma99:
            sell_signals.append("7-day MA below 25-day and 99-day MA (bearish)")
            
        # 2. Price vs. Moving Averages
        if current_price > ma7 and current_price > ma25:
            buy_signals.append("Price above both 7-day and 25-day MA")
            
        if current_price < ma7 and current_price < ma25:
            sell_signals.append("Price below both 7-day and 25-day MA")
            
        # 3. RSI signals
        if rsi < 30:
            buy_signals.append(f"RSI is {rsi:.2f} (< 30, oversold)")
            
        if rsi > 70:
            sell_signals.append(f"RSI is {rsi:.2f} (> 70, overbought)")
            
        # 4. Short-term momentum
        if week_change > 10:
            buy_signals.append(f"Strong momentum: {week_change:.2f}% gain in last 7 days")
        
        if week_change < -10:
            sell_signals.append(f"Negative momentum: {week_change:.2f}% loss in last 7 days")
            
        # Determine overall signal
        if len(buy_signals) > len(sell_signals) and len(buy_signals) >= 2:
            overall_signal = "BUY"
        elif len(sell_signals) > len(buy_signals) and len(sell_signals) >= 2:
            overall_signal = "SELL"
        else:
            overall_signal = "HOLD"
            
        return {
            "price": current_price,
            "ma7": ma7,
            "ma25": ma25,
            "ma99": ma99,
            "rsi": float(rsi),
            "week_change": float(week_change),
            "month_change": float(month_change),
            "buy_signals": buy_signals,
            "sell_signals": sell_signals,
            "overall_signal": overall_signal
        }
        
    except Exception as e:
        return {"error": f"Error analyzing {symbol}: {str(e)}"}

# Get expert recommendations for crypto
def get_crypto_expert_recommendations(symbol: str) -> str:
    """Use the web search agent to find expert recommendations"""
    crypto_symbol = symbol.replace("-USD", "")
    
    # Use web search agent directly instead of DuckDuckGo search
    query = f"Find the latest {crypto_symbol} price predictions and expert buy/sell recommendations. Summarize the current analyst consensus."
    
    print(f"\nSearching for expert recommendations on {crypto_symbol}...\n")
    try:
        result = websearch_agent.run(query)
        return f"Expert Analysis for {crypto_symbol.upper()}:\n\n{result}"
    except Exception as e:
        print(f"Error getting recommendations: {str(e)}")
        return f"Unable to retrieve expert recommendations for {crypto_symbol} at this time."

def get_crypto_info(symbol):
    # Prepare the symbol
    original_symbol = symbol
    if not "-USD" in symbol:
        symbol = f"{symbol}-USD"
    
    crypto_symbol = symbol.replace("-USD", "")
    print(f"\n{'='*50}")
    print(f"CRYPTOCURRENCY ANALYSIS: {crypto_symbol.upper()}")
    print(f"{'='*50}\n")
    
    # Get technical analysis results
    print(f"Calculating technical indicators and buy/sell signals...")
    tech_analysis = analyze_crypto_technical_indicators(symbol)
    
    # Display technical analysis results with emphasis on buy/sell recommendations
    if "error" in tech_analysis:
        print(f"Error: {tech_analysis['error']}")
    else:
        # Format the output with more prominent buy/sell signals
        overall_signal = tech_analysis['overall_signal']
        signal_color = "\033[92m" if overall_signal == "BUY" else "\033[91m" if overall_signal == "SELL" else "\033[93m"  # Green for buy, red for sell, yellow for hold
        reset_color = "\033[0m"
        
        print("\n┏" + "━"*48 + "┓")
        print("┃" + " "*15 + "TECHNICAL ANALYSIS" + " "*15 + "┃")
        print("┣" + "━"*48 + "┫")
        print(f"┃ Current Price:          ${tech_analysis['price']:.2f}" + " "*(23-len(f"${tech_analysis['price']:.2f}")) + "┃")
        print(f"┃ 7-Day Moving Average:   ${tech_analysis['ma7']:.2f}" + " "*(23-len(f"${tech_analysis['ma7']:.2f}")) + "┃")
        print(f"┃ 25-Day Moving Average:  ${tech_analysis['ma25']:.2f}" + " "*(23-len(f"${tech_analysis['ma25']:.2f}")) + "┃")
        print(f"┃ RSI (14):              {tech_analysis['rsi']:.2f}" + " "*(24-len(f"{tech_analysis['rsi']:.2f}")) + "┃")
        print(f"┃ 7-Day Change:          {tech_analysis['week_change']:.2f}%" + " "*(23-len(f"{tech_analysis['week_change']:.2f}%")) + "┃")
        print(f"┃ 30-Day Change:         {tech_analysis['month_change']:.2f}%" + " "*(23-len(f"{tech_analysis['month_change']:.2f}%")) + "┃")
        print("┣" + "━"*48 + "┫")
        print("┃" + " "*15 + "BUY/SELL SIGNALS" + " "*15 + "┃")
        print("┣" + "━"*48 + "┫")
        
        # Buy signals
        if tech_analysis['buy_signals']:
            for i, signal in enumerate(tech_analysis['buy_signals']):
                prefix = "┃ BUY SIGNAL:  " if i == 0 else "┃              "
                print(f"{prefix}" + signal + " "*(33-len(signal)) + "┃")
        else:
            print("┃ BUY SIGNAL:  None" + " "*28 + "┃")
            
        # Sell signals
        if tech_analysis['sell_signals']:
            for i, signal in enumerate(tech_analysis['sell_signals']):
                prefix = "┃ SELL SIGNAL: " if i == 0 else "┃              "
                print(f"{prefix}" + signal + " "*(33-len(signal)) + "┃")
        else:
            print("┃ SELL SIGNAL: None" + " "*28 + "┃")
            
        print("┣" + "━"*48 + "┫")
        print(f"┃ OVERALL RECOMMENDATION: {overall_signal}" + " "*(23-len(overall_signal)) + "┃")
        print("┗" + "━"*48 + "┛")
    
    # Get market data
    additional_info = {
        "asset_type": "cryptocurrency",
        "ticker_symbol": symbol,
        "crypto_name": crypto_symbol
    }
    
    # Call the financial agent for market data
    print(f"\nGetting market data for {symbol}...")
    financial_agent.print_response(
        f"Get the current price, market cap, volume, and 24h price change for {symbol}", 
        additional_information=additional_info,
        stream=True
    )
    
    # Get expert recommendations
    print(f"\nFetching analyst and expert recommendations for {crypto_symbol}...")
    expert_recommendations = get_crypto_expert_recommendations(symbol)
    print("\n┏" + "━"*48 + "┓")
    print("┃" + " "*13 + "ANALYST RECOMMENDATIONS" + " "*13 + "┃")
    print("┗" + "━"*48 + "┛")
    print(expert_recommendations)
    
    # Get news
    print(f"\nGathering latest news for {crypto_symbol}...")
    websearch_agent.print_response(
        f"Find the latest cryptocurrency news about {crypto_symbol} with focus on price predictions", 
        additional_information={"search_terms": [f"{crypto_symbol} cryptocurrency price prediction", f"{crypto_symbol} buy sell recommendation"]},
        stream=True
    )

def get_stock_info(symbol):
    symbol = symbol.upper().strip()
    print(f"\nAnalyzing stock: {symbol}\n")
    
    # Call the financial agent directly for stock data
    print(f"Getting analyst recommendations and fundamentals for {symbol}...")
    financial_agent.print_response(
        f"Provide analyst recommendations and key fundamentals for {symbol}", 
        additional_information={
            "asset_type": "stock",
            "ticker_symbol": symbol
        },
        stream=True
    )
    
    # Call the web search agent for recent news
    print(f"\nGathering latest news for {symbol}...")
    websearch_agent.print_response(
        f"Find the latest financial news about {symbol} stock", 
        additional_information={
            "search_terms": [f"{symbol} stock", "stock market", f"{symbol} financial news"]
        },
        stream=True
    )

def get_asset_info(symbol, asset_type="stock"):
    if asset_type.lower() == "crypto":
        get_crypto_info(symbol)
    else:
        get_stock_info(symbol)

def main():
    print("===== FinAgent - Financial Information Assistant =====\n")
    print("Enter 'exit' to quit at any time.")
    
    while True:
        print("\nWhat would you like to do?")
        print("1. Get stock information")
        print("2. Get cryptocurrency information")
        print("3. Quick lookup (auto-detect type)")
        choice = input("Enter your choice (1-3): ")
        
        if choice.lower() == "exit":
            break
            
        if choice == "1":
            symbol = input("Enter stock ticker symbol (e.g., AAPL, MSFT): ")
            if symbol.lower() == "exit":
                break
            get_asset_info(symbol.upper().strip(), "stock")
        
        elif choice == "2":
            symbol = input("Enter cryptocurrency symbol (e.g., BTC, ETH): ")
            if symbol.lower() == "exit":
                break
            get_asset_info(symbol.upper().strip(), "crypto")
        
        elif choice == "3":
            symbol = input("Enter asset symbol (e.g., AAPL, BTC): ")
            if symbol.lower() == "exit":
                break
                
            # Auto-detect if it's likely a crypto
            common_cryptos = ["BTC", "ETH", "XRP", "LTC", "BCH", "ADA", "DOT", "LINK", "BNB", "XLM", "DOGE", "SOL"]
            if symbol.upper().strip() in common_cryptos or len(symbol.strip()) <= 5:
                print(f"Detected {symbol.upper().strip()} as a cryptocurrency")
                get_asset_info(symbol.upper().strip(), "crypto")
            else:
                print(f"Detected {symbol.upper().strip()} as a stock")
                get_asset_info(symbol.upper().strip(), "stock")
        
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main()
