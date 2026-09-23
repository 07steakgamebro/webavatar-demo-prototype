/**
 * WebAvatar Helper Service
 * Triggers the WebAvatar voice connection / call button programmatically.
 */

export function triggerWebAvatarCall(): boolean {
  if (typeof window === 'undefined') return false;

  const attemptClick = (): boolean => {
    // 1. Try window.WebAvatar JS API methods
    const wa = (window as any).WebAvatar;
    if (wa) {
      if (typeof wa.connect === 'function') {
        try {
          wa.connect();
          return true;
        } catch (e) {
          console.warn('[WebAvatar] wa.connect() error:', e);
        }
      }
      if (typeof wa.startCall === 'function') {
        try {
          wa.startCall();
          return true;
        } catch (e) {
          console.warn('[WebAvatar] wa.startCall() error:', e);
        }
      }
      if (typeof wa.toggleCall === 'function') {
        try {
          wa.toggleCall();
          return true;
        } catch (e) {
          console.warn('[WebAvatar] wa.toggleCall() error:', e);
        }
      }
      if (typeof wa.start === 'function') {
        try {
          wa.start();
          return true;
        } catch (e) {
          console.warn('[WebAvatar] wa.start() error:', e);
        }
      }
    }

    // 2. Dispatch custom events
    try {
      window.dispatchEvent(new CustomEvent('webavatar-connect'));
      window.dispatchEvent(new CustomEvent('webavatar-start-call'));
    } catch {
      // ignore
    }

    // 3. Search DOM for specific known call button selectors
    const potentialSelectors = [
      '#bcw-call-button',
      '#bcw-call-btn',
      '.bcw-call-btn',
      '.bcw-call-button',
      '#bcw-connect-btn',
      '.bcw-connect-btn',
      '#webavatar-call-btn',
      '.webavatar-call-btn',
      '#webavatar-call-button',
      '.webavatar-call-button',
      '#webavatar-connect-btn',
      '.webavatar-connect-btn',
      '#avatar-call-btn',
      '#botnoi-call-btn',
      '#botnoi-call-button',
      '[data-testid="webavatar-call-button"]',
      '[data-testid="call-button"]',
      'button[aria-label*="Call" i]',
      'button[aria-label*="Connect" i]',
      'button[aria-label*="โทร" i]',
      'button[title*="Call" i]',
      'button[title*="Connect" i]',
      'button[title*="โทร" i]',
    ];

    for (const sel of potentialSelectors) {
      const el = document.querySelector<HTMLElement>(sel);
      if (el) {
        el.click();
        return true;
      }
    }

    // 4. Search within widget containers or shadow roots
    const containers = document.querySelectorAll<HTMLElement>(
      '[id^="bcw-"], [class^="bcw-"], [id*="webavatar"], [class*="webavatar"], [id*="botnoi"]'
    );
    for (const container of containers) {
      const btn = container.querySelector<HTMLElement>('button, [role="button"], a');
      if (btn) {
        btn.click();
        return true;
      }
      if (container.shadowRoot) {
        const shadowBtn = container.shadowRoot.querySelector<HTMLElement>('button, [role="button"], a');
        if (shadowBtn) {
          shadowBtn.click();
          return true;
        }
      }
    }

    // 5. Fallback: Search all buttons in the bottom-right corner area
    const allButtons = Array.from(document.querySelectorAll<HTMLElement>('button, [role="button"]'));
    for (const btn of allButtons) {
      const rect = btn.getBoundingClientRect();
      const isBottomRight =
        rect.bottom > window.innerHeight - 200 &&
        rect.right > window.innerWidth - 200 &&
        rect.width > 24 &&
        rect.height > 24;
      if (isBottomRight && btn.id !== 'hamburger-btn') {
        btn.click();
        return true;
      }
    }

    return false;
  };

  const success = attemptClick();
  if (!success) {
    // Retry once after brief delay if widget was still mounting
    setTimeout(attemptClick, 250);
  }

  return success;
}

/**
 * Speaks a notification or warning message via WebAvatar SDK.
 * If the WebAvatar SDK is connected and supports speech, it delegates to it;
 * otherwise it uses the browser's native SpeechSynthesis (Web Speech API)
 * with language matching and triggers avatar reaction animations.
 */
export function speakWebAvatarMessage(message: string, lang: string = 'th-TH'): void {
  if (typeof window === 'undefined' || !message) return;

  console.log(`[WebAvatar Speech] Announcing: "${message}" (${lang})`);

  // 1. Trigger Avatar gesture / emotion animation if widget is ready
  const wa = (window as any).WebAvatar;
  const cw = (window as any).ChatWidget;

  try {
    if (wa && typeof wa.setEmotion === 'function') {
      wa.setEmotion('thinking', 4);
    }
    if (wa && typeof wa.loadAnimation === 'function') {
      wa.loadAnimation('Generic_look_around');
    } else if (cw && typeof cw.playAnimation === 'function') {
      cw.playAnimation('Generic_look_around');
    }
  } catch (err) {
    console.debug('[WebAvatar Speech] Animation trigger notice:', err);
  }

  // 2. Try window.WebAvatar / ChatWidget direct speech / sendUserMessage methods
  let handledByAvatar = false;
  if (wa) {
    if (typeof wa.speak === 'function') {
      try {
        wa.speak(message);
        handledByAvatar = true;
      } catch (e) {
        console.warn('[WebAvatar] wa.speak failed:', e);
      }
    } else if (typeof wa.say === 'function') {
      try {
        wa.say(message);
        handledByAvatar = true;
      } catch (e) {
        console.warn('[WebAvatar] wa.say failed:', e);
      }
    }
  }

  // 3. Dispatch custom event for widget or listeners
  try {
    window.dispatchEvent(
      new CustomEvent('webavatar-speak', {
        detail: { text: message, lang },
      })
    );
  } catch {
    // ignore
  }

  // 4. Browser Web Speech Synthesis fallback (standard browser voice TTS)
  // Ensures voice plays immediately and clearly for visitors
  if (!handledByAvatar && typeof window.speechSynthesis !== 'undefined') {
    try {
      window.speechSynthesis.cancel(); // Stop any pending utterances
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = lang;
      utterance.rate = 1.0;
      utterance.pitch = 1.05;

      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const langPrefix = lang.split('-')[0].toLowerCase();
        const matchedVoice =
          voices.find((v) => v.lang.toLowerCase().replace('_', '-') === lang.toLowerCase()) ||
          voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix)) ||
          voices.find((v) => v.lang.includes(langPrefix));
        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('[WebAvatar Speech] SpeechSynthesis fallback error:', e);
    }
  }
}
