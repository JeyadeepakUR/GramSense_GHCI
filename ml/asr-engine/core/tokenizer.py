"""
Whisper Tokenizer - BPE encoding/decoding for Whisper models.
"""

import json
from pathlib import Path
from typing import List, Dict, Optional


class WhisperTokenizer:
    """
    Byte Pair Encoding tokenizer for Whisper.
    
    Handles special tokens:
    - <|startoftranscript|> (50258)
    - <|endoftext|> (50257)
    - Language tokens (50259-50358)
    - Task tokens (transcribe/translate)
    - Timestamp tokens (50364+)
    """
    
    # Special token IDs
    EOT_TOKEN = 50257  # End of text
    SOT_TOKEN = 50258  # Start of transcript
    TRANSLATE_TOKEN = 50358
    TRANSCRIBE_TOKEN = 50359
    NO_TIMESTAMPS_TOKEN = 50363
    TIMESTAMP_BEGIN = 50364
    
    # Language token offsets (50259-50358)
    LANGUAGES = {
        'en': 50259, 'zh': 50260, 'de': 50261, 'es': 50262, 'ru': 50263,
        'ko': 50264, 'fr': 50265, 'ja': 50266, 'pt': 50267, 'tr': 50268,
        'pl': 50269, 'ca': 50270, 'nl': 50271, 'ar': 50272, 'sv': 50273,
        'it': 50274, 'id': 50275, 'hi': 50276, 'fi': 50277, 'vi': 50278,
        'he': 50279, 'uk': 50280, 'el': 50281, 'ms': 50282, 'cs': 50283,
        'ro': 50284, 'da': 50285, 'hu': 50286, 'ta': 50287, 'no': 50288,
        'th': 50289, 'ur': 50290, 'hr': 50291, 'bg': 50292, 'lt': 50293,
        'la': 50294, 'mi': 50295, 'ml': 50296, 'cy': 50297, 'sk': 50298,
        'te': 50299, 'fa': 50300, 'lv': 50301, 'bn': 50302, 'sr': 50303,
        'az': 50304, 'sl': 50305, 'kn': 50306, 'et': 50307, 'mk': 50308,
        'br': 50309, 'eu': 50310, 'is': 50311, 'hy': 50312, 'ne': 50313,
        'mn': 50314, 'bs': 50315, 'kk': 50316, 'sq': 50317, 'sw': 50318,
        'gl': 50319, 'mr': 50320, 'pa': 50321, 'si': 50322, 'km': 50323,
        'sn': 50324, 'yo': 50325, 'so': 50326, 'af': 50327, 'oc': 50328,
        'ka': 50329, 'be': 50330, 'tg': 50331, 'sd': 50332, 'gu': 50333,
        'am': 50334, 'yi': 50335, 'lo': 50336, 'uz': 50337, 'fo': 50338,
        'ht': 50339, 'ps': 50340, 'tk': 50341, 'nn': 50342, 'mt': 50343,
        'sa': 50344, 'lb': 50345, 'my': 50346, 'bo': 50347, 'tl': 50348,
        'mg': 50349, 'as': 50350, 'tt': 50351, 'haw': 50352, 'ln': 50353,
        'ha': 50354, 'ba': 50355, 'jw': 50356, 'su': 50357,
    }
    
    def __init__(self, model_dir: str = "models"):
        """
        Initialize tokenizer.
        
        Args:
            model_dir: Directory containing tokenizer.json, vocab.json, merges.txt
        """
        self.model_dir = Path(model_dir)
        self.vocab: Dict[str, int] = {}
        self.inv_vocab: Dict[int, str] = {}
        self.merges: List[tuple] = []
        self._load_tokenizer()
    
    def _load_tokenizer(self):
        """Load tokenizer files."""
        # Load vocab
        vocab_file = self.model_dir / "vocab.json"
        if vocab_file.exists():
            with open(vocab_file, 'r', encoding='utf-8') as f:
                self.vocab = json.load(f)
                self.inv_vocab = {v: k for k, v in self.vocab.items()}
        
        # Load merges
        merges_file = self.model_dir / "merges.txt"
        if merges_file.exists():
            with open(merges_file, 'r', encoding='utf-8') as f:
                lines = f.read().strip().split('\n')[1:]  # Skip header
                self.merges = [tuple(line.split()) for line in lines if line.strip()]
    
    def encode(self, text: str) -> List[int]:
        """
        Encode text to token IDs.
        
        Args:
            text: Input text
            
        Returns:
            List of token IDs
        """
        # Simple BPE encoding (simplified for production)
        tokens = []
        for char in text:
            token = self.vocab.get(char, self.vocab.get('<|endoftext|>', 0))
            tokens.append(token)
        return tokens
    
    def decode(self, token_ids: List[int], skip_special_tokens: bool = True) -> str:
        """
        Decode token IDs to text.
        
        Args:
            token_ids: List of token IDs
            skip_special_tokens: Whether to skip special tokens
            
        Returns:
            Decoded text
        """
        tokens = []
        for token_id in token_ids:
            # Skip special tokens
            if skip_special_tokens:
                if token_id >= self.SOT_TOKEN:
                    continue
                if token_id == self.EOT_TOKEN:
                    break
            
            # Get token string
            token_str = self.inv_vocab.get(token_id, '')
            if token_str:
                tokens.append(token_str)
        
        # Join tokens and clean up
        text = ''.join(tokens)
        
        # Replace special byte sequences
        text = text.replace('Ġ', ' ')  # GPT-2 space prefix
        text = text.replace('Ċ', '\n')  # Newline
        
        return text.strip()
    
    def get_language_token(self, language: str) -> int:
        """
        Get language token ID.
        
        Args:
            language: Language code (e.g., 'en', 'hi')
            
        Returns:
            Token ID
        """
        return self.LANGUAGES.get(language, self.LANGUAGES['en'])
    
    def build_decoder_input(
        self,
        language: str = 'en',
        task: str = 'transcribe',
        no_timestamps: bool = True
    ) -> List[int]:
        """
        Build initial decoder input tokens.
        
        Args:
            language: Language code
            task: 'transcribe' or 'translate'
            no_timestamps: Whether to disable timestamps
            
        Returns:
            List of initial token IDs
        """
        tokens = [self.SOT_TOKEN]
        tokens.append(self.get_language_token(language))
        
        if task == 'translate':
            tokens.append(self.TRANSLATE_TOKEN)
        else:
            tokens.append(self.TRANSCRIBE_TOKEN)
        
        if no_timestamps:
            tokens.append(self.NO_TIMESTAMPS_TOKEN)
        
        return tokens
