class ColorSchemeManager {
    constructor() {
        this.warmSchemes = [
            {
                primary: '#ff6b35',
                secondary: '#ffa726', 
                accent: '#ffcc02',
                bg: '#fff3e0',
                text: '#d84315',
                shadow: 'rgba(255, 107, 53, 0.3)'
            },
            {
                primary: '#e65100',
                secondary: '#ff9800',
                accent: '#ffc107',
                bg: '#fff8e1',
                text: '#bf360c',
                shadow: 'rgba(230, 81, 0, 0.3)'
            },
            {
                primary: '#ff5722',
                secondary: '#ff8a65',
                accent: '#ffab40',
                bg: '#fce4ec',
                text: '#d32f2f',
                shadow: 'rgba(255, 87, 34, 0.3)'
            },
            {
                primary: '#f57c00',
                secondary: '#ffb74d',
                accent: '#fff176',
                bg: '#fffde7',
                text: '#e65100',
                shadow: 'rgba(245, 124, 0, 0.3)'
            },
            {
                primary: '#d84315',
                secondary: '#ff7043',
                accent: '#ffcc02',
                bg: '#fafafa',
                text: '#bf360c',
                shadow: 'rgba(216, 67, 21, 0.3)'
            }
        ];
    }

    getRandomScheme() {
        const randomIndex = Math.floor(Math.random() * this.warmSchemes.length);
        return this.warmSchemes[randomIndex];
    }

    applyScheme(scheme) {
        const root = document.documentElement;
        root.style.setProperty('--primary-warm', scheme.primary);
        root.style.setProperty('--secondary-warm', scheme.secondary);
        root.style.setProperty('--accent-warm', scheme.accent);
        root.style.setProperty('--bg-warm', scheme.bg);
        root.style.setProperty('--text-warm', scheme.text);
        root.style.setProperty('--shadow-warm', scheme.shadow);
    }

    randomizeColors() {
        const newScheme = this.getRandomScheme();
        this.applyScheme(newScheme);
    }
}

class WordGenerator {
    constructor() {
        this.colorManager = new ColorSchemeManager();
        this.wordElement = document.getElementById('random-word');
        this.generateButton = document.getElementById('generate-btn');
        this.isLoading = false;
        this.currentWord = '';

        this.init();
    }

    generateGarbledText(length) {
        // const chars = '!@#$%^&*()_+[]{}|;:,.<>?';
        let result = '';
        // for (let i = 0; i < length; i++) {
        //     result += chars.charAt(Math.floor(Math.random() * chars.length));
        // }
        return result;
    }

    init() {
        this.generateButton.addEventListener('click', () => this.generateNewWord());
        
        // Generate initial word
        this.generateNewWord();
    }

    fadeOut() {
        return new Promise(resolve => {
            this.wordElement.style.transition = 'color 0.1s ease';
            this.wordElement.style.color = 'transparent';
            setTimeout(resolve, 300);
        });
    }

    fadeIn() {
        return new Promise(resolve => {
            this.wordElement.style.color = 'var(--text-warm)';
            setTimeout(resolve, 300);
        });
    }

    async generateNewWord() {
        if (this.isLoading) return;

        this.isLoading = true;
        this.generateButton.disabled = true;
        this.generateButton.style.opacity = '0.7';

        // Randomize colors first
        this.colorManager.randomizeColors();

        // Store current word, width and height
        this.currentWord = this.wordElement.textContent || '';
        const currentWidth = this.wordElement.offsetWidth;
        const currentHeight = this.wordElement.offsetHeight;
        this.wordElement.style.width = currentWidth + 'px';
        this.wordElement.style.minHeight = currentHeight + 'px';
        
        // Fade out current word
        await this.fadeOut();
        
        // Generate garbled text with same length as current word
        const garbledText = this.generateGarbledText(this.currentWord.length || 8);
        this.wordElement.textContent = garbledText;
        this.wordElement.style.transform = 'translateZ(10px) scale(0.95)';
        
        // Fade in garbled text
        await this.fadeIn();

        try {
            const response = await fetch('/api/random-word');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Fade out garbled text
            await this.fadeOut();
            
            // Set new word and fade in
            this.wordElement.textContent = data.word;
            this.currentWord = data.word;
            this.wordElement.style.transform = 'translateZ(20px) scale(1)';
            this.wordElement.style.width = 'auto';
            this.wordElement.style.minHeight = 'auto';
            
            await this.fadeIn();
            
            // Add a subtle bounce effect
            this.wordElement.style.animation = 'none';
            setTimeout(() => {
                this.wordElement.style.animation = 'wordBounce 0.6s ease-out';
            }, 10);

        } catch (error) {
            console.error('Error fetching random word:', error);
            await this.fadeOut();
            this.wordElement.textContent = 'FEIL VED GENERERING';
            this.wordElement.style.transform = 'translateZ(20px) scale(1)';
            this.wordElement.style.width = 'auto';
            this.wordElement.style.minHeight = 'auto';
            await this.fadeIn();
        } finally {
            setTimeout(() => {
                this.isLoading = false;
                this.generateButton.disabled = false;
                this.generateButton.style.opacity = '1';
            }, 200);
        }
    }
}

// Add bounce animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes wordBounce {
        0% {
            transform: translateZ(20px) scale(1);
        }
        50% {
            transform: translateZ(25px) scale(1.05);
        }
        100% {
            transform: translateZ(20px) scale(1);
        }
    }

    .generate-button:disabled {
        cursor: not-allowed;
        transform: translateZ(5px) !important;
    }
`;
document.head.appendChild(style);

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WordGenerator();
});