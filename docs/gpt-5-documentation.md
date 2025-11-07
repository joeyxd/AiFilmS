# GPT-5 Documentation and Usage Guide

## Overview
GPT-5 is OpenAI's flagship model for coding, reasoning, and agentic tasks across domains. It's the best model for coding and agentic tasks across domains.

## Key Features
- **Reasoning**: Higher
- **Speed**: Medium  
- **Price**: $1.25 • $10 (Input • Output)
- **Context Window**: 400,000 tokens
- **Max Output**: 128,000 tokens
- **Knowledge Cutoff**: Sep 30, 2024
- **Reasoning Token Support**: Yes

## Pricing
- **Input**: $1.25 per 1M tokens
- **Cached Input**: $0.125 per 1M tokens
- **Output**: $10.00 per 1M tokens

## Model Variants
- **gpt-5**: Complex reasoning, broad world knowledge, and code-heavy or multi-step agentic tasks
- **gpt-5-mini**: Cost-optimized reasoning and chat; balances speed, cost, and capability
- **gpt-5-nano**: High-throughput tasks, especially simple instruction-following or classification

## API Name Mapping
- System card: `gpt-5-thinking` → API: `gpt-5`
- System card: `gpt-5-thinking-mini` → API: `gpt-5-mini`
- System card: `gpt-5-thinking-nano` → API: `gpt-5-nano`

## New API Features

### 1. Reasoning Effort Control
Controls how many reasoning tokens the model generates:
- **minimal**: Very few reasoning tokens, fastest time-to-first-token
- **low**: Speed-focused with some reasoning
- **medium**: Default, balanced reasoning
- **high**: Thorough reasoning for complex tasks

```javascript
const response = client.responses.create({
    model: "gpt-5",
    input: "Complex reasoning task...",
    reasoning: { effort: "high" } // For maximum reasoning capability
});
```

### 2. Verbosity Control
Controls output token generation:
- **low**: Concise answers, simple code generation
- **medium**: Default balanced output
- **high**: Thorough explanations, extensive code with comments

```javascript
const response = client.responses.create({
    model: "gpt-5",
    input: "Generate complex code...",
    text: { verbosity: "high" } // For detailed explanations
});
```

### 3. Custom Tools
Enables freeform text inputs to tools rather than structured JSON:

```javascript
{
    "type": "custom",
    "name": "code_exec",
    "description": "Executes arbitrary python code"
}
```

### 4. Allowed Tools
Restrict model to specific tool subsets:

```javascript
"tool_choice": {
    "type": "allowed_tools",
    "mode": "auto",
    "tools": [
        { "type": "function", "name": "get_weather" },
        { "type": "mcp", "server_label": "deepwiki" },
        { "type": "image_generation" }
    ]
}
```

## Best Practices for Story Analysis

### For Complex Story Analysis (Our Use Case):
1. **Use high reasoning effort** for deep story understanding
2. **Use high verbosity** for detailed character and plot analysis
3. **Pass chain of thought** between API calls for context continuity
4. **Use Responses API** instead of Chat Completions for better reasoning

### Optimal Configuration for Story Processing:
```javascript
const response = await openai.responses.create({
    model: "gpt-5",
    input: storyAnalysisPrompt,
    reasoning: { effort: "high" },     // Maximum reasoning for story analysis
    text: { verbosity: "high" },       // Detailed explanations
    tools: [...], // Custom tools for story processing
});
```

## Migration from Chat Completions to Responses API

### Key Differences:
1. **Chain of Thought Passing**: Only available in Responses API
2. **Better Intelligence**: Improved reasoning with CoT continuity
3. **Better Performance**: Fewer reasoning tokens, higher cache hits, lower latency

### API Endpoints:
- **Responses API**: `v1/responses` (Recommended for GPT-5)
- **Chat Completions**: `v1/chat/completions` (Legacy)

## Reasoning Model Benefits
- **Step-by-step problem breakdown**
- **Internal chain of thought encoding**
- **Context continuity across turns**
- **Better tool calling performance**

## Rate Limits by Tier:
- **Tier 1**: 500 RPM, 30,000 TPM
- **Tier 2**: 5,000 RPM, 450,000 TPM  
- **Tier 3**: 5,000 RPM, 800,000 TPM
- **Tier 4**: 10,000 RPM, 2,000,000 TPM
- **Tier 5**: 15,000 RPM, 40,000,000 TPM

## Implementation Notes for FilmStudio AI:
1. Use `gpt-5` model name (not `gpt-5-thinking`)
2. Implement Responses API for better reasoning
3. Use high reasoning effort for story analysis
4. Use high verbosity for detailed character/plot breakdowns
5. Pass previous reasoning between API calls
6. Implement proper error handling for reasoning tokens
7. Cache reasoning results for performance

## Tools and Features Supported:
- ✅ Streaming
- ✅ Function calling  
- ✅ Structured outputs
- ❌ Fine-tuning (not supported)
- ✅ Distillation
- ✅ Web search (via Responses API)
- ✅ File search
- ✅ Image generation
- ✅ Code interpreter
- ❌ Computer use (not supported)
- ✅ MCP (Model Context Protocol)

---

*Saved on: September 2, 2025*
*For FilmStudio AI - Story Analysis System*
