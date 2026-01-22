// Sound utility for POS actions
class SoundManager {
    private sounds: Map<string, HTMLAudioElement> = new Map();
    private enabled: boolean = true;

    constructor() {
        // Initialize sounds using Data URLs (base64 beep sounds)
        this.initializeSounds();
    }

    private initializeSounds() {
        // Simple beep sound (440Hz for 100ms) - base64 encoded
        const beepDataUrl = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSBAJT6Pj8bllHAU7k9n0yoIuBSh+zPLaizsIGGe56OScTw0OVKzk8bVjHAY6kdXzzIQxBSh8yO7cizwIGWm46eWbTQ0OVazk87RhHAU6k9n0yoIuBSh9zPDaizsIGWm46eWbTQ0OVKzk87RhHAU6kdXzzIQwBSh8yO7cizwIGWm46eWbTQ0OVKzk87RhHAU6kdXzzIQxBSh8yO7cizwIGWm46eWbTQ0OVKzk87RhHAU6kdXzzIQxBSh8yO7cizwIGWm46eWbTQ0OVKzl87NhHAU6kdXzzIQxBSh8yO7cizwIGWm46eWbTQ0OVKzl87NhHAU6kdXzzIQxBSh8yO7cizwIGWm46eWbTQ0OVKzl87NhHAU6kdXzzIQxBSh8yO7cizwIGWm46eWbTQ0OVKzl87NhHAU6kdXzzH8wBSh8yO7cizwIGWm46eWbTQ0OVKzl87NhHAU6kdXzzH8wBSh8yO7cizwIGWm46eWbTQ0OVKzl87NhHAU6kdXzzH8wBSh8yO7cizwIGWm46eWbTQ0OVKzl87NhHAU6kdXzzH8wBSh8yO7cizwIGWm46eWaTQ0OVKzl87NhHAU6kdXzzH8wBSh8yO7cizwIGWm46eWaTQ0OVKzl87NhHAU6kdXzzH8wBSh8yO7cizwIGWm46eWaTQ0OVKzl87NhHAU6kdXzzH8wBSh8yO7cizwIGWm46eWaTQ0OVKzl87NhHAU6kdXzzH8wBSh8yO7cizwIGWm46eWaTQ0OVKzl87NhHAU6kdXzzH8wBSh8yO7cizwIGWm46eWaTQ0OVKzl87NhHAU6kdXzzH8wBSh8yO7cizwIGWm46eWaTQ0OVKzl87NhHAU6kdXzzH8wBSh8yO7cizwIGWm46eWaTQ0OVKzl87NhHAU6kdXzzH8wBSh8yO7cizwIGWm46eWaTQ0OVKzl87NhHAU6kdXzzH8wBSh8yO7cizwIGWm46eWaTQ0OVKzl87NhHAU6kdXzzH8wBSh8yO7cizwIGWm46eWaTQ0OVKzl87NhHAU6kdXzzH8wBSh8yO7cizwIGWm46eWaTQ0OVKzl87NhHAU6kdXzzH8wBSh8yO7cizwIGWm46eWaTQ0OVKzl87NhHAU6kdXzzH8wBSh8yO7cizwIGWm46eWaTQ0OVKzl87NhHAU6kdXzzH8wBSh8yO7cizwIGWm46eWaTQ0O';

        const successDataUrl = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSBAJT6Pj8bllHAU7k9n0yoIuBSh+zPLaizsIGGe56OScTw0OVKzk8bVjHAY6kdXzzIQxBSh8yO7cizwIGWm46eWbTQ0OVazk87RhHAU6k9n0yoIuBSh9zPDaizsIGWm46eWbTQ0OVKzk87RhHAU6kdXzzIQwBSh8yO7cizwIGWm46eWbTQ0OVKzk87RhHAU6kdXzzIQxBSh8yO7cizwIGWm46eWbTQ0OVKzk87RhHAU6kdXzzIQxBSh8yO7cizwIGWm46eWbTQ0OVKzl87NhHAU6kdXzzIQxBSh8yO7cizwIGWm46eWbTQ0OVKzl87NhHAU6kdXzzIQxBSh8yO7cizwIGWm46eWbTQ0OVKzl87NhHAU6kdXzzH8wBSh8yO7cizwIGWm46eWaTQ0OVKzl87NiFw==';

        const errorDataUrl = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAAB/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f38=';

        this.sounds.set('beep', this.createAudio(beepDataUrl));
        this.sounds.set('success', this.createAudio(successDataUrl));
        this.sounds.set('error', this.createAudio(errorDataUrl));
    }

    private createAudio(dataUrl: string): HTMLAudioElement {
        const audio = new Audio(dataUrl);
        audio.volume = 0.3; // Set moderate volume
        return audio;
    }

    public play(soundName: 'beep' | 'success' | 'error') {
        if (!this.enabled) return;

        const sound = this.sounds.get(soundName);
        if (sound) {
            sound.currentTime = 0; // Reset to start
            sound.play().catch(err => {
                console.warn('Sound play failed:', err);
            });
        }
    }

    public setEnabled(enabled: boolean) {
        this.enabled = enabled;
    }

    public isEnabled(): boolean {
        return this.enabled;
    }
}

// Export singleton instance
export const soundManager = new SoundManager();

// Convenience functions
export const playBeep = () => soundManager.play('beep');
export const playSuccess = () => soundManager.play('success');
export const playError = () => soundManager.play('error');
