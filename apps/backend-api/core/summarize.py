"""Text summarization utilities.

⚠️ Owner-only module. Only core may implement summarization strategies.
Routes should call summarize_text() and never inline summarization logic.
"""
from typing import Any, Dict


def summarize_text(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Produce a naive summary for the supplied text content.

    Uses the first sentence (split on period) truncated to 100 characters as
    a placeholder summary implementation. This is intentionally simplistic; a
    future upgrade can incorporate an abstractive model while keeping the
    interface stable for callers.

    Args:
        payload: Dictionary expected to contain 'text' field.

    Returns:
        Dictionary containing:
            summary: Extracted summary string.
            length: Original text length in characters.

    Example:
        >>> summarize_text({"text": "Hello world. Additional context here."})
        {'summary': 'Hello world', 'length': 37}

    Notes:
        - Empty input yields empty summary and length 0.
        - Caller must ensure text normalization prior to summarization if
          required for consistent tokenization.
    """
    text = str(payload.get("text", ""))
    summary = text.split(".")[0][:100]
    return {"summary": summary, "length": len(text)}
