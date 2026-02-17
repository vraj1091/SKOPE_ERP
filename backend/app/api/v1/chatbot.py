from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import json
import random
import re

from app.db.database import get_db
from app.db import models
from app.api.dependencies import get_current_user

router = APIRouter()

# Ollama API configuration
OLLAMA_BASE_URL = "http://localhost:11434"
OLLAMA_MODEL = "phi4"

try:
    import httpx
except ImportError:
    httpx = None

class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[dict]] = []

class ChatResponse(BaseModel):
    response: str
    context_used: Optional[dict] = None
    mode: str = "ai"  # ai or simulated

# ==========================================
# SIMULATED AI ENGINE (FALLBACK SYSTEM)
# ==========================================

class SimulatedAI:
    """
    A sophisticated rule-based engine that simulates AI behavior when the LLM is offline.
    It uses pattern matching and context injection to generate dynamic responses.
    """
    
    def __init__(self, context: Dict[str, Any]):
        self.context = context
        self.inventory = context.get("inventory", {})
        self.sales = context.get("sales", {})
        self.customers = context.get("customers", {})
        self.financial = context.get("financial", {})
        self.store = context.get("store", {})

    def _format_currency(self, amount: float) -> str:
        return f"₹{amount:,.2f}"

    def _get_random_intro(self) -> str:
        intros = [
            "Based on the latest data, ",
            "Looking at your store metrics, ",
            "Here's what I found: ",
            "I've analyzed the numbers for you. ",
            "Let me pull that up. ",
        ]
        return random.choice(intros)

    def generate_response(self, message: str) -> str:
        msg = message.lower()
        
        # Greeting
        if any(w in msg for w in ["hello", "hi", "hey", "good morning", "good evening"]):
            return self._handle_greeting()
            
        # Financial/Expense Queries - CHECK THIS FIRST (more specific)
        if any(w in msg for w in ["expense", "expenses", "profit", "cost", "spending", "loss", "miscellaneous", "misslenious", "financial", "finance"]):
            return self._handle_financial(msg)
            
        # Inventory Queries
        if any(w in msg for w in ["inventory", "stock", "products", "items", "low stock"]):
            return self._handle_inventory(msg)
            
        # Sales Queries
        if any(w in msg for w in ["sales", "sale", "revenue", "income", "money", "earning", "today", "last", "report", "sell", "sold"]):
            return self._handle_sales(msg)
            
        # Customer Queries
        if any(w in msg for w in ["customer", "client", "buyer", "who bought"]):
            return self._handle_customers(msg)
            
        # General/Unknown
        return self._handle_unknown()

    def _handle_greeting(self) -> str:
        greetings = [
            "Hello! I'm ready to help you manage your store. What would you like to check today?",
            "Hi there! Your store data is loaded. Ask me about sales, inventory, or customers.",
            "Welcome back! I'm tracking your business metrics. What do you need to know?",
            "Greetings! I'm your SKOPE Assistant. How can I help optimize your operations today?"
        ]
        return random.choice(greetings)

    def _handle_inventory(self, msg: str) -> str:
        total = self.inventory.get('total_products', 0)
        value = self._format_currency(self.inventory.get('total_inventory_value', 0))
        low_stock_count = self.inventory.get('low_stock_count', 0)
        low_stock_items = self.inventory.get('low_stock_items', [])
        
        if "low" in msg:
            if low_stock_count == 0:
                return f"✅ **Great news!** You have no items running low on stock right now. Your inventory is healthy."
            
            items_list = "\n".join([f"• **{item['name']}**: Only {item['stock']} left (Min: {item['min_level']})" for item in low_stock_items[:5]])
            return f"""⚠️ **Low Stock Alert**
            
You have **{low_stock_count} products** closer to running out.
Here are the most critical ones:

{items_list}

💡 *Recommendation:* You should reorder these items soon to avoid lost sales."""

        return f"""📦 **Inventory Overview**

{self._get_random_intro()}You currently have **{total} unique products** in stock.
The total value of your inventory is **{value}**.

• Low Stock Items: **{low_stock_count}**
• Out of Stock: **{self.inventory.get('out_of_stock_count', 0)}**

Do you want to see the low stock list?"""

    def _handle_sales(self, msg: str) -> str:
        revenue_30 = self._format_currency(self.sales.get('last_30_days_revenue', 0))
        tx_30 = self.sales.get('last_30_days_transactions', 0)
        revenue_today = self._format_currency(self.sales.get('today_revenue', 0))
        tx_today = self.sales.get('today_transactions', 0)
        top_products = self.sales.get('top_products', [])
        
        # Check for "last sale" or "which product" queries
        if any(word in msg for word in ["last sale", "last sell", "which product", "what product", "product sell", "product sold"]):
            if top_products:
                product_list = "\n".join([f"  {i+1}. **{p['name']}**: {p['quantity']} units sold" for i, p in enumerate(top_products[:5])])
                return f"""📊 **Top Selling Products (Last 30 Days)**

Here are your best-performing products:

{product_list}

💡 *Insight:* These products are driving your sales. Consider keeping them well-stocked!"""
            else:
                return "I don't have detailed product sales data available right now. Try asking about overall sales performance!"
        
        if "today" in msg:
            return f"""📅 **Today's Sales Report**

So far today, you've made **{revenue_today}** across **{tx_today} transactions**.

💡 *Insight:* {"Great start!" if self.sales.get('today_revenue', 0) > 0 else "No sales yet today, hopefully things pick up soon!"}"""

        return f"""📊 **Sales Performance (Last 30 Days)**

Your store has generated **{revenue_30}** in revenue from **{tx_30} orders**.
The average order value is **{self._format_currency(self.sales.get('average_transaction_value', 0))}**.

Compared to previous periods, your sales are tracking steady.
*Would you like to analyze specific product performance?*"""

    def _handle_customers(self, msg: str) -> str:
        total = self.customers.get('total_customers', 0)
        top = self.customers.get('top_customers', [])
        
        top_list = "\n".join([f"• **{c['name']}**: {self._format_currency(c['total_purchases'])}" for c in top])
        
        return f"""👥 **Customer Insights**

You have a total of **{total} registered customers**.

🏆 **Your Top VIP Customers:**
{top_list}

💡 *Marketing Tip:* Consider sending a special offer to {top[0]['name'] if top else 'your best customers'} to thank them for their loyalty."""

    def _handle_financial(self, msg: str) -> str:
        expenses = self._format_currency(self.financial.get('last_30_days_expenses', 0))
        profit = self._format_currency(self.financial.get('estimated_profit', 0))
        expense_by_category = self.financial.get('expense_by_category', {})
        expense_count = self.financial.get('expense_count', 0)
        
        # Build category breakdown
        category_list = ""
        if expense_by_category:
            # Sort by amount (highest first)
            sorted_categories = sorted(expense_by_category.items(), key=lambda x: x[1], reverse=True)
            category_lines = []
            for cat, amount in sorted_categories:
                cat_name = cat.replace('_', ' ').title()
                category_lines.append(f"  • **{cat_name}**: {self._format_currency(amount)}")
            category_list = "\n" + "\n".join(category_lines)
        
        # Check if asking about specific category
        if any(word in msg for word in ["miscellaneous", "misslenious", "other", "misc"]):
            misc_amount = expense_by_category.get('other', 0)
            if misc_amount > 0:
                return f"""💰 **Miscellaneous Expenses (Last 30 Days)**

You've spent **{self._format_currency(misc_amount)}** on miscellaneous expenses.

This category typically includes:
• Office supplies
• Small repairs
• Unexpected costs
• Other operational expenses

💡 *Tip:* Review these expenses regularly to identify patterns and potential savings."""
            else:
                return f"""💰 **Miscellaneous Expenses**

Good news! You have **no miscellaneous expenses** recorded in the last 30 days.

All your expenses are properly categorized."""
        
        # Check if asking about specific time period
        time_period = "Last 30 Days"
        if any(word in msg for word in ["last month", "previous month", "month"]):
            time_period = "Last Month"
        
        # General financial overview
        return f"""💰 **Financial Snapshot ({time_period})**

• **Total Expenses:** {expenses}
  ({expense_count} expense entries)
• **Estimated Profit:** {profit}

📊 **Expense Breakdown by Category:**{category_list}

---
💡 *Analysis:* We calculated profit by subtracting total expenses from sales revenue.

*Would you like to see a specific expense category in detail?*"""

    def _handle_unknown(self) -> str:
        responses = [
            "I'm not quite sure about that specific detail, but I can tell you about your **sales, inventory, or customers**. Which would you prefer?",
            "I'm specialized in your store's data. Try asking: *'How are sales today?'* or *'Show me low stock items'.*",
            "I didn't catch that correctly. I can help visualize your business metrics - just ask about revenue, stock, or expenses!",
            "Could you rephrase that? I'm ready to analyze your store performance data."
        ]
        return random.choice(responses)

# ==========================================
# DATA FETCHING HELPERS
# ==========================================

def get_store_context(db: Session, user: models.User) -> dict:
    """Fetch user-specific store context"""
    context = {}
    store_filter = {}
    
    if user.role != models.UserRole.SUPER_ADMIN and user.store_id:
        store_filter = {"store_id": user.store_id}

    try:
        # Inventory
        products_query = db.query(models.Product)
        if store_filter:
            products_query = products_query.filter_by(**store_filter)
        products = products_query.all()
        
        context["inventory"] = {
            "total_products": len(products),
            "total_inventory_value": sum((p.cost_price or 0) * (p.current_stock or 0) for p in products),
            "low_stock_count": len([p for p in products if (p.current_stock or 0) <= (p.minimum_stock or 5)]),
            "out_of_stock_count": len([p for p in products if (p.current_stock or 0) == 0]),
            "low_stock_items": [{"name": p.name, "stock": p.current_stock, "min_level": p.minimum_stock} for p in products if (p.current_stock or 0) <= (p.minimum_stock or 5)][:10]
        }

        # Sales
        thirty_days_ago = datetime.now() - timedelta(days=30)
        sales_query = db.query(models.Sale).filter(models.Sale.sale_date >= thirty_days_ago)
        if store_filter:
            sales_query = sales_query.filter_by(**store_filter)
        sales = sales_query.all()
        
        today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        today_sales = [s for s in sales if s.sale_date >= today_start]
        
        total_rev = sum(s.total_amount for s in sales)
        total_tx = len(sales)
        
        # Get top selling products
        product_sales = {}
        for sale in sales:
            for item in sale.items:
                product_name = item.product.name if item.product else "Unknown"
                if product_name in product_sales:
                    product_sales[product_name] += item.quantity
                else:
                    product_sales[product_name] = item.quantity
        
        top_products = [{"name": name, "quantity": qty} for name, qty in sorted(product_sales.items(), key=lambda x: x[1], reverse=True)[:10]]
        
        context["sales"] = {
            "last_30_days_revenue": total_rev,
            "last_30_days_transactions": total_tx,
            "average_transaction_value": total_rev / total_tx if total_tx > 0 else 0,
            "today_revenue": sum(s.total_amount for s in today_sales),
            "today_transactions": len(today_sales),
            "top_products": top_products
        }

        # Customers
        cust_query = db.query(models.Customer)
        if store_filter:
            cust_query = cust_query.filter_by(**store_filter)
        customers = cust_query.all()
        
        context["customers"] = {
            "total_customers": len(customers),
            "top_customers": [{"name": c.name, "total_purchases": c.total_purchases or 0} for c in sorted(customers, key=lambda x: x.total_purchases or 0, reverse=True)[:5]]
        }

        # Financial
        exp_query = db.query(models.Expense).filter(models.Expense.expense_date >= thirty_days_ago)
        if store_filter:
            exp_query = exp_query.filter_by(**store_filter)
        expenses = exp_query.all()
        total_exp = sum(e.amount for e in expenses)
        
        # Group expenses by category
        expense_by_category = {}
        for exp in expenses:
            cat = exp.category or "other"
            expense_by_category[cat] = expense_by_category.get(cat, 0) + exp.amount
        
        context["financial"] = {
            "last_30_days_expenses": total_exp,
            "estimated_profit": total_rev - total_exp,
            "expense_by_category": expense_by_category,
            "expense_count": len(expenses)
        }
        
    except Exception as e:
        print(f"Error building context: {e}")
        
    return context

def create_system_prompt(context: dict) -> str:
    """Enhanced system prompt for the real AI"""
    return f"""You are the SKOPE ERP AI Assistant. Your goal is to be a helpful, professional, and data-driven business analyst for the store manager.

STORE DATA SNAPSHOT:
-------------------
💰 Revenue (30d): ₹{context.get('sales', {}).get('last_30_days_revenue', 0):,.2f}
📦 Products: {context.get('inventory', {}).get('total_products', 0)}
👥 Customers: {context.get('customers', {}).get('total_customers', 0)}
⚠️ Low Stock Items: {context.get('inventory', {}).get('low_stock_count', 0)}

GUIDELINES:
1. Always use Indian Rupees (₹) for currency.
2. Be concise but insightful. Don't just give a number; explain what it means.
3. If specific data is missing in the snapshot, politely say you don't have that detail but can discuss general trends.
4. If the user asks about low stock, list the items if available.
5. Maintain a professional, encouraging tone.

Respond directly to the user's latest query using this context."""

# ==========================================
# ROUTERS
# ==========================================

@router.get("/status")
async def check_ollama_status():
    """Check AI service status"""
    if httpx is None:
        return {
            "status": "online",
            "message": "Simulated AI Active (Standard Mode)",
            "model_available": True,
            "mode": "simulated"
        }
        
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            if resp.status_code == 200:
                models = [m['name'] for m in resp.json().get('models', [])]
                has_model = any(OLLAMA_MODEL in m for m in models)
                return {
                    "status": "online" if has_model else "model_missing",
                    "message": "AI Engine Online" if has_model else f"Model {OLLAMA_MODEL} missing",
                    "model_available": has_model,
                    "mode": "ai"
                }
    except:
        pass
        
    return {
        "status": "online", 
        "message": "Simulated AI Active (Fallback Mode)",
        "model_available": True,
        "mode": "simulated"
    }

@router.get("/chat/{chat_id}")
async def get_chat(
    chat_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get a chat conversation by ID (for compatibility with RAG chatbot frontend)"""
    return {
        "id": chat_id,
        "title": f"Chat {chat_id}",
        "messages": [],
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }

@router.get("/chats")
async def list_chats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """List all chat conversations for the current user"""
    return {
        "chats": [
            {
                "id": 1,
                "title": "New Conversation",
                "preview": "Ask me anything about your store...",
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }
        ]
    }

@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    context = get_store_context(db, current_user)
    
    # Try using real AI first if available
    if httpx:
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                # Fast check if server is up
                await client.get(f"{OLLAMA_BASE_URL}/api/tags")
                
                system_prompt = create_system_prompt(context)
                messages = [{"role": "system", "content": system_prompt}] + request.conversation_history[-5:] + [{"role": "user", "content": request.message}]
                
                response = await client.post(
                    f"{OLLAMA_BASE_URL}/api/chat",
                    json={
                        "model": OLLAMA_MODEL,
                        "messages": messages,
                        "stream": False,
                        "options": {"temperature": 0.7}
                    }
                )
                
                if response.status_code == 200:
                    ai_content = response.json().get("message", {}).get("content", "")
                    if ai_content:
                        return ChatResponse(response=ai_content, mode="ai")
        except:
            pass # Fall through to simulated AI
            
    # Use Simulated AI
    sim_ai = SimulatedAI(context)
    response_text = sim_ai.generate_response(request.message)
    
    return ChatResponse(response=response_text, mode="simulated")
