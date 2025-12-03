from groq import Groq
from config import settings
from typing import List, Dict
import json


class GroqService:
    """Service for LLM interactions using Groq API"""

    def __init__(self):
        self.client = Groq(api_key=settings.groq_api_key)
        self.system_prompt = self._get_system_prompt()

    def _get_system_prompt(self) -> str:
        return """You are a warm, friendly medical assistant having a natural conversation with a patient. You're like a caring friend who happens to know about health.

PERSONALITY & TONE:
- Be expressive and reactive! Use natural expressions like:
  "Oh no, that sounds rough!", "Ouch, I can imagine that hurts!", "Gotcha!", "Hmm, interesting...", "Oh I see!", "Ah, that makes sense!", "Wow, that must be tough!", "Yikes!", "Oh dear!"
- Sound like a real person, not a robot asking checklist questions
- Show genuine empathy and concern
- React emotionally to what they share before moving on

CONVERSATION STYLE:
- DON'T ask questions every single time - sometimes just acknowledge and sympathize
- Mix it up: sometimes ask, sometimes just respond supportively
- Keep it SHORT - 1-2 sentences max, this is voice chat
- Be conversational, not clinical
- Avoid medical jargon - use everyday words

EXAMPLES OF GOOD RESPONSES:
- "Oh no, headaches are the worst! Has this one been hanging around long?"
- "Ouch! That sounds really uncomfortable. I hope you've been able to rest."
- "Gotcha, so it started a few days ago. That's good info to know."
- "Hmm, that's interesting - stress can definitely do that to us!"
- "Oh wow, I'm sorry you're dealing with all that!"

IMPORTANT RULES:
- NEVER diagnose or prescribe medication
- For emergencies (chest pain, breathing trouble, severe bleeding, stroke signs) - tell them to call 911 immediately
- You're gathering info to help them, not interrogating them
- If they seem tired of questions, just be supportive instead

Remember: You're having a friendly chat, not conducting a formal interview!"""

    def get_response(self, conversation: List[Dict]) -> str:
        """Get AI response for the conversation"""
        # Limit conversation to last 10 messages to prevent slowdown
        recent_conversation = conversation[-10:] if len(conversation) > 10 else conversation

        messages = [
            {"role": "system", "content": self.system_prompt}
        ] + recent_conversation

        try:
            response = self.client.chat.completions.create(
                model=settings.groq_model,
                messages=messages,
                max_tokens=settings.groq_max_tokens,
                temperature=settings.groq_temperature,
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Groq API error: {e}")
            return "I apologize, I'm having trouble processing that. Could you please repeat what you said?"

    def generate_summary(self, conversation: List[Dict]) -> Dict:
        """Generate medical summary from conversation"""
        summary_prompt = """Based on this patient conversation, generate a structured medical summary.

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
    "chief_complaint": "Brief 1-line description of main issue",
    "history_of_present_illness": "Detailed narrative paragraph of symptoms, timeline, and characteristics",
    "relevant_history": ["Point 1", "Point 2"],
    "assessment": "Clinical impression of likely condition",
    "recommendations": ["Recommendation 1", "Recommendation 2"]
}

Only include information that was actually mentioned in the conversation. Be concise but thorough."""

        formatted_convo = self._format_conversation(conversation)

        messages = [
            {"role": "system", "content": summary_prompt},
            {"role": "user", "content": f"Patient Conversation:\n\n{formatted_convo}"}
        ]

        try:
            response = self.client.chat.completions.create(
                model=settings.groq_model,
                messages=messages,
                max_tokens=1000,
                temperature=0.3,
            )

            content = response.choices[0].message.content
            # Try to parse JSON
            return json.loads(content)
        except json.JSONDecodeError:
            # If JSON parsing fails, return structured error
            return {
                "chief_complaint": "Unable to generate summary",
                "history_of_present_illness": "Please review the conversation transcript.",
                "relevant_history": [],
                "assessment": "Manual review required",
                "recommendations": ["Review conversation transcript manually"]
            }
        except Exception as e:
            print(f"Groq summary error: {e}")
            return {
                "chief_complaint": "Error generating summary",
                "history_of_present_illness": str(e),
                "relevant_history": [],
                "assessment": "Error occurred",
                "recommendations": []
            }

    def _format_conversation(self, conversation: List[Dict]) -> str:
        """Format conversation for summary generation"""
        lines = []
        for msg in conversation:
            role = "Patient" if msg["role"] == "user" else "Medical Assistant"
            lines.append(f"{role}: {msg['content']}")
        return "\n\n".join(lines)
