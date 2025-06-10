#!/usr/bin/env python3

with open('rotkehlchen/rotkehlchen.py', 'r') as f:
    content = f.read()

# Fix the indentation issue at line ~625
content = content.replace("    trades.extend(exchange_trades)", "                trades.extend(exchange_trades)")

with open('rotkehlchen/rotkehlchen.py', 'w') as f:
    f.write(content)

print("Fixed indentation in rotkehlchen.py") 