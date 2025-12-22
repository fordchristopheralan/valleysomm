# ValleySomm Cost Analysis & Revenue Models

## Overview

This document analyzes the unit economics of ValleySomm, focusing on AI costs per trip and revenue sustainability across different pricing models.

---

## AI Cost Analysis

### Claude Sonnet 4 Pricing (as of Dec 2024)

| Metric | Cost |
|--------|------|
| Input tokens | $3.00 / 1M tokens |
| Output tokens | $15.00 / 1M tokens |
| Prompt caching (read) | $0.30 / 1M tokens (90% discount) |
| Prompt caching (write) | $3.75 / 1M tokens |

### Estimated Token Usage Per Trip

Based on conversation flow analysis:

| Component | Input Tokens | Output Tokens |
|-----------|--------------|---------------|
| System prompt (winery data) | ~35,000 | 0 |
| Conversation (7 turns) | ~2,000 | ~3,000 |
| Itinerary generation | ~1,000 | ~2,000 |
| Follow-up refinements | ~500 | ~1,000 |
| **Total (no caching)** | **~38,500** | **~6,000** |
| **Total (with caching)** | **~3,500 uncached** | **~6,000** |

### Cost Per Trip

**Without Prompt Caching:**
```
Input:  38,500 tokens × $3.00/1M  = $0.1155
Output:  6,000 tokens × $15.00/1M = $0.0900
─────────────────────────────────────────────
Total: $0.2055 per trip (~$0.21)
```

**With Prompt Caching (recommended):**
```
Cached read:  35,000 tokens × $0.30/1M  = $0.0105
Uncached:      3,500 tokens × $3.00/1M  = $0.0105
Output:        6,000 tokens × $15.00/1M = $0.0900
─────────────────────────────────────────────────
Total: $0.111 per trip (~$0.11)
```

**Optimized (future state with smaller prompts):**
```
Target: $0.05-0.08 per trip
```

---

## Revenue Model Options

### Option A: Consumer Subscription

**Pricing Tiers:**

| Tier | Price | Trips/Month | AI Cost | Margin |
|------|-------|-------------|---------|--------|
| Free | $0 | 3 | $0.33 | -100% (loss leader) |
| Pro | $9.99/mo | Unlimited | ~$1.50 (avg 10 trips) | 85% |
| Annual | $79.99/yr | Unlimited | ~$18 (avg 12/mo) | 81% |

**Assumptions:**
- Free users average 2 trips/month
- Pro users average 10 trips/month
- 5% free → Pro conversion

**Monthly Economics (1,000 free users):**
```
Free tier cost:     1,000 × 2 trips × $0.11 = $220
Pro conversions:    50 × $9.99 = $499.50
Pro AI cost:        50 × 10 trips × $0.11 = $55
─────────────────────────────────────────────────
Net: $499.50 - $220 - $55 = $224.50 profit
```

---

### Option B: Pay-Per-Trip

**Pricing:** $4.99 per custom itinerary

| Metric | Value |
|--------|-------|
| Price | $4.99 |
| AI cost | $0.11 |
| Payment processing (3%) | $0.15 |
| **Gross margin** | **$4.73 (95%)** |

**Pros:**
- No commitment barrier
- Clear value exchange
- High margin

**Cons:**
- Lower lifetime value
- Less predictable revenue
- No recurring relationship

**Break-even Analysis:**
```
Fixed costs (hosting, etc.): ~$200/month
Trips needed at $4.73 margin: 43 trips/month
```

---

### Option C: Hybrid Model (Recommended)

**Consumer Side:**
- Free: 3 trips/month (lead gen)
- Pro: $9.99/month unlimited (power users)
- One-time: $4.99/trip (casual visitors)

**Winery Side:**
- Free: Basic listing (always free)
- Basic: $49/month (verified badge, priority, analytics)
- Premium: $99/month (featured, booking integration)

**Revenue Mix Target:**
| Source | % of Revenue |
|--------|--------------|
| Consumer subscriptions | 40% |
| Pay-per-trip | 20% |
| Winery partnerships | 40% |

---

## Winery Partnership Economics

### Tier Pricing

| Tier | Monthly | Annual | Features |
|------|---------|--------|----------|
| Free | $0 | $0 | Basic listing, AI recommendations |
| Basic | $49 | $470 | Verified badge, analytics, priority |
| Premium | $99 | $950 | Featured, booking, dedicated support |

### Value Proposition Math

**For a winery averaging 500 visitors/month:**

If ValleySomm drives just 2% more visitors:
- 10 additional visitors × $25 avg spend = $250/month value
- Premium tier ($99) = 2.5x ROI

**Visitor Intent Data Value:**
- Traditional mystery shopper: $500-1000 per visit
- Focus group: $2,000-5,000
- ValleySomm monthly report: $49/month for continuous insights

---

## Scaling Scenarios

### Year 1 Targets

| Metric | Month 6 | Month 12 |
|--------|---------|----------|
| Free users | 500 | 2,000 |
| Pro subscribers | 25 | 100 |
| Pay-per-trip sales | 50 | 200 |
| Winery partners (paid) | 5 | 15 |

**Month 12 Revenue:**
```
Pro subs:       100 × $9.99  = $999
Pay-per-trip:   200 × $4.99  = $998
Basic wineries: 10 × $49     = $490
Premium wineries: 5 × $99    = $495
───────────────────────────────────
Total MRR: $2,982
```

**Month 12 Costs:**
```
AI (trips):     ~500 trips × $0.11 = $55
Supabase:       $25 (Pro tier)
Vercel:         $20 (Pro tier)
Domain/misc:    $20
───────────────────────────────────
Total: $120/month
```

**Month 12 Net: ~$2,862/month**

---

### Year 2-3 Growth

| Metric | Year 2 | Year 3 |
|--------|--------|--------|
| MAU | 10,000 | 50,000 |
| Pro subscribers | 500 | 2,500 |
| Winery partners | 35 | 50 (saturated) |
| MRR | $15,000 | $60,000 |
| ARR | $180,000 | $720,000 |

---

## Cost Optimization Strategies

### 1. Prompt Caching (Immediate)
- Cache winery database in system prompt
- 90% cost reduction on repeated data
- **Savings: 50% of input costs**

### 2. Smaller Context Windows
- Summarize winery data instead of full records
- Only load relevant wineries per conversation
- **Savings: 30-50% of input costs**

### 3. Model Selection
- Use Claude Haiku for simple queries
- Sonnet only for complex matching
- **Savings: 60-80% for simple requests**

### 4. Response Caching
- Cache common itinerary patterns
- "Saturday, couple, dry reds" = serve cached response
- **Savings: 100% for cache hits (~20% of trips)**

### 5. Batch Processing
- Pre-generate popular itineraries overnight
- Instant delivery for common requests
- **Savings: Off-peak pricing + faster UX**

---

## Competitive Pricing Analysis

### Similar Products

| Product | Pricing | Our Position |
|---------|---------|--------------|
| TripAdvisor | Free (ad-supported) | More personalized |
| Wanderlog | Free + $40/yr | Wine-specific expertise |
| Roadtrippers | $49.99/year | AI-powered matching |
| Custom tour companies | $50-200/person | Self-service, 10x cheaper |

### Price Sensitivity Research

From survey data (n=32):
- 50% "Yes — take my money" (price-insensitive)
- 34% "Maybe, depending on cost"
- 16% "Probably not / No"

**Interpretation:**
- Strong demand at $5-10/trip or $10/month
- Premium features can justify higher prices
- Freemium essential for adoption

---

## Financial Projections Summary

### Conservative Case

| Year | MRR | AI Costs | Gross Profit |
|------|-----|----------|--------------|
| 1 | $3,000 | $150 | $2,850 |
| 2 | $15,000 | $500 | $14,500 |
| 3 | $40,000 | $1,500 | $38,500 |

### Optimistic Case

| Year | MRR | AI Costs | Gross Profit |
|------|-----|----------|--------------|
| 1 | $5,000 | $200 | $4,800 |
| 2 | $30,000 | $1,000 | $29,000 |
| 3 | $100,000 | $3,000 | $97,000 |

---

## Key Metrics to Track

### Unit Economics
- **CAC (Customer Acquisition Cost):** Target < $10
- **LTV (Lifetime Value):** Target > $50
- **LTV:CAC Ratio:** Target > 5:1

### AI Efficiency
- **Tokens per trip:** Track and optimize
- **Cache hit rate:** Target > 80%
- **Cost per trip:** Target < $0.08

### Revenue Health
- **MRR growth rate:** Target 15% MoM
- **Churn rate:** Target < 5% monthly
- **Expansion revenue:** Upsells and winery upgrades

---

## Appendix: Token Estimation Details

### System Prompt (Winery Data)

Estimated tokens for 50 wineries with full data:
```
Per winery: ~700 tokens
× 50 wineries = 35,000 tokens

Breakdown:
- Basic info (name, address, contact): 100 tokens
- Description/tagline: 150 tokens
- Wine styles/preferences: 100 tokens
- Hours, pricing, amenities: 150 tokens
- AI matching fields: 200 tokens
```

### Conversation Tokens

7-turn conversation estimate:
```
Turn 1 (date): 50 in / 100 out
Turn 2 (group): 30 in / 80 out
Turn 3 (wines): 50 in / 120 out
Turn 4 (vibe): 40 in / 100 out
Turn 5 (logistics): 60 in / 150 out
Turn 6 (special): 80 in / 80 out
Turn 7 (generate): 100 in / 1500 out
────────────────────────────────────
Total: ~410 in / ~2130 out
```

### Itinerary Generation

Final itinerary creation:
```
Context summary: 500 tokens in
Winery selection reasoning: 500 tokens in
Structured output: 2000 tokens out
────────────────────────────────────
Total: ~1000 in / ~2000 out
```
