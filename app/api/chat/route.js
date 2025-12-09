import { NextResponse } from 'next/server';

/**
 * Chat API endpoint using Hugging Face Router API (Chat Completions)
 * @route POST /api/chat
 * @param {Request} req - The incoming request object
 * @returns {Promise<NextResponse>} The AI response
 */
export async function POST(req) {
  try {
    const { message, conversationHistory = [] } = await req.json();

    // Input validation
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Get Hugging Face API token from environment
    const HF_TOKEN = process.env.HF_TOKEN;

    if (!HF_TOKEN) {
      return NextResponse.json(
        { error: 'Hugging Face API token is not configured. Please add HF_TOKEN to your .env.local file' },
        { status: 500 }
      );
    }

    // Model selection - you can change this to any model supported by Hugging Face Router
    // Popular options:
    // - "openai/gpt-oss-20b:groq" (fast, good quality)
    // - "meta-llama/Llama-2-7b-chat-hf" (requires access)
    // - "mistralai/Mistral-7B-Instruct-v0.2" (requires access)
    // - "google/flan-t5-xxl" (instruction-following)
    const MODEL_NAME = process.env.HF_MODEL_NAME || "openai/gpt-oss-20b:groq";

    // Build messages array for chat completions format
    const messages = [];

    // Add system message for context
    messages.push({
      role: "system",
      content: "You are a helpful assistant for MovieKnight, a movie search and recommendation app. Help users find movies, understand features, and get recommendations. Be friendly and concise."
    });

    // Add conversation history (last 10 messages for context)
    const recentHistory = conversationHistory.slice(-10);
    recentHistory.forEach((msg) => {
      messages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      });
    });

    // Add current user message
    messages.push({
      role: "user",
      content: message
    });

    // Call Hugging Face Router API
    const response = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL_NAME,
          messages: messages,
          temperature: 0.7,
          max_tokens: 300,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle rate limiting
      if (response.status === 429) {
        return NextResponse.json(
          { 
            error: 'Rate limit exceeded. Please try again in a moment.',
            retry_after: response.headers.get('Retry-After') || 60
          },
          { status: 429 }
        );
      }

      // Handle model loading or service unavailable
      if (response.status === 503 || response.status === 502) {
        return NextResponse.json(
          { 
            error: 'Service temporarily unavailable. Please try again in a few seconds.',
          },
          { status: 503 }
        );
      }

      throw new Error(
        `Hugging Face API error: ${response.status} - ${JSON.stringify(errorData)}`
      );
    }

    const data = await response.json();

    // Extract response from chat completions format
    let aiResponse = '';
    
    if (data.choices && data.choices.length > 0) {
      aiResponse = data.choices[0].message?.content || '';
    } else if (data.message) {
      aiResponse = data.message;
    } else if (typeof data === 'string') {
      aiResponse = data;
    }

    // If response is empty or too short, provide a fallback
    if (!aiResponse || aiResponse.trim().length < 3) {
      aiResponse = "I'm here to help! Could you rephrase your question? I can help you search for movies, get recommendations, or learn about MovieKnight features.";
    }

    return NextResponse.json({
      success: true,
      response: aiResponse.trim(),
    });
  } catch (error) {
    console.error('Chat API error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to get AI response';
    
    if (error.message) {
      errorMessage = error.message;
    } else if (error instanceof TypeError && error.message.includes('fetch')) {
      errorMessage = 'Network error: Unable to connect to Hugging Face API. Please check your internet connection.';
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

