import React from 'react';
import { useNavigate } from 'react-router-dom';
import { speakWebAvatarMessage } from '../lib/webavatarService';

declare global {
  interface Window {
    BotnoiActionBridge?: {
      navigate: (target: string) => boolean;
      click: (selectorOrQuery: string) => Promise<boolean>;
      fill: (selectorOrQuery: string, value: string) => Promise<boolean>;
      highlight: (selectorOrQuery: string) => boolean;
      listClickableElements: () => Array<{ id: string; testId: string; text: string; role: string; tag: string }>;
      waitForElement: (selectorOrQuery: string, timeoutMs?: number) => Promise<HTMLElement | null>;
    };
  }
}

/**
 * Intelligent DOM element finder:
 * 1. Checks exact CSS selector / ID / data-testid / name / aria-label
 * 2. Tries fuzzy text match in both Thai and English
 */
function findTargetElement(selectorOrQuery: string): HTMLElement | null {
  if (!selectorOrQuery || typeof selectorOrQuery !== 'string') return null;
  const q = selectorOrQuery.trim();

  // 1. Direct standard querySelector (IDs, Classes, Attributes)
  try {
    const el = document.querySelector<HTMLElement>(q);
    if (el) return el;
  } catch {
    // Might not be a valid CSS selector, proceed to heuristics
  }

  // 2. Try ID directly (#something or something)
  const cleanId = q.replace(/^#/, '');
  const byId = document.getElementById(cleanId);
  if (byId) return byId;

  // 3. Try [data-testid="..."] or [name="..."] or [data-seat-id="..."]
  const byTestId = document.querySelector<HTMLElement>(
    `[data-testid="${cleanId}"], [name="${cleanId}"], [data-seat-id="${cleanId}"], [data-flight-no="${cleanId}"]`
  );
  if (byTestId) return byTestId;

  // 4. Try aria-label or title case-insensitive
  const byAria = document.querySelector<HTMLElement>(`[aria-label*="${q}" i], [title*="${q}" i]`);
  if (byAria) return byAria;

  // 5. Fuzzy text search across buttons, links, inputs, and clickable elements
  const clickables = Array.from(
    document.querySelectorAll<HTMLElement>(
      'button, a, [role="button"], input[type="submit"], input[type="button"], label, div[onclick], [tabindex="0"]'
    )
  );
  const lowerQ = q.toLowerCase();

  // 5a. Exact text match
  for (const el of clickables) {
    const txt = (el.innerText || el.textContent || (el as HTMLInputElement).value || '').trim().toLowerCase();
    if (txt === lowerQ) return el;
  }

  // 5b. Substring text match
  for (const el of clickables) {
    const txt = (el.innerText || el.textContent || (el as HTMLInputElement).value || '').trim().toLowerCase();
    if (txt.includes(lowerQ) && txt.length < 80) return el;
  }

  return null;
}

/**
 * Wait for element to appear in DOM (for Modals, Accordions, Dynamic Flight cards)
 */
function waitForElement(selectorOrQuery: string, timeoutMs = 3000): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    const existing = findTargetElement(selectorOrQuery);
    if (existing) {
      resolve(existing);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const el = findTargetElement(selectorOrQuery);
      if (el) {
        clearInterval(interval);
        resolve(el);
      } else if (Date.now() - startTime > timeoutMs) {
        clearInterval(interval);
        resolve(null);
      }
    }, 100);
  });
}

function highlightElement(el: HTMLElement, durationMs = 1200) {
  try {
    const prevOutline = el.style.outline;
    const prevBoxShadow = el.style.boxShadow;
    const prevTransition = el.style.transition;
    el.style.transition = 'outline 0.2s ease-in-out, box-shadow 0.2s ease-in-out';
    el.style.outline = '3px solid #0066FF';
    el.style.boxShadow = '0 0 18px rgba(0, 102, 255, 0.7)';
    setTimeout(() => {
      el.style.outline = prevOutline;
      el.style.boxShadow = prevBoxShadow;
      el.style.transition = prevTransition;
    }, durationMs);
  } catch (err) {
    console.debug('[WebAvatar Bridge] highlightElement notice:', err);
  }
}

async function triggerElementClick(target: string | HTMLElement): Promise<boolean> {
  try {
    const el = typeof target === 'string' ? await waitForElement(target, 2000) : target;
    if (!el) {
      console.warn('[WebAvatar Bridge] Element not found for click:', target);
      return false;
    }

    el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    highlightElement(el);

    await new Promise((r) => setTimeout(r, 150));

    // Mark element and its card as triggered by WebAvatar
    (el as any).__fromAvatar = true;
    const cardEl = el.closest('.playing-card') as any;
    if (cardEl) {
      cardEl.__fromAvatar = true;
    }

    const opts = { bubbles: true, cancelable: true, view: window };
    const pDown = new PointerEvent('pointerdown', opts);
    (pDown as any).fromAvatar = true;
    el.dispatchEvent(pDown);

    const mDown = new MouseEvent('mousedown', opts);
    (mDown as any).fromAvatar = true;
    el.dispatchEvent(mDown);

    const pUp = new PointerEvent('pointerup', opts);
    (pUp as any).fromAvatar = true;
    el.dispatchEvent(pUp);

    const mUp = new MouseEvent('mouseup', opts);
    (mUp as any).fromAvatar = true;
    el.dispatchEvent(mUp);

    const clickEv = new MouseEvent('click', opts);
    (clickEv as any).fromAvatar = true;
    el.dispatchEvent(clickEv);

    if (typeof el.click === 'function') {
      try {
        (el as any).fromAvatar = true;
      } catch (err) {
        console.debug('[WebAvatar Bridge] fromAvatar assignment notice:', err);
      }
      el.click();
    }

    setTimeout(() => {
      delete (el as any).__fromAvatar;
      if (cardEl) {
        delete cardEl.__fromAvatar;
      }
    }, 600);
    return true;
  } catch (err) {
    console.error('[WebAvatar Bridge] Error clicking element:', err);
    return false;
  }
}

async function triggerElementFill(target: string | HTMLElement, value: string): Promise<boolean> {
  try {
    const el = typeof target === 'string' ? await waitForElement(target, 2000) : target;
    if (!el) {
      console.warn('[WebAvatar Bridge] Element not found for fill:', target);
      return false;
    }

    el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    highlightElement(el);

    const inputEl = (
      el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' ? el : el.querySelector<HTMLInputElement | HTMLTextAreaElement>('input, textarea')
    ) as HTMLInputElement | HTMLTextAreaElement | null;

    if (!inputEl) return false;

    await new Promise((r) => setTimeout(r, 150));

    inputEl.focus();
    const proto = inputEl instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
    if (nativeSetter) {
      nativeSetter.call(inputEl, value);
    } else {
      inputEl.value = value;
    }
    inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    inputEl.dispatchEvent(new Event('change', { bubbles: true }));
    inputEl.blur();
    return true;
  } catch (err) {
    console.error('[WebAvatar Bridge] Error filling element:', err);
    return false;
  }
}

export default function SpaNavListener() {
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleNav = (e: Event) => {
      e.preventDefault();
      const customEvent = e as CustomEvent;
      const target = customEvent.detail?.target || customEvent.detail?.url || customEvent.detail?.path;
      if (!target) return;

      const disabledUrls = [
        'eucerin-mu',
        'digital-friendly-companion',
        'botnoi-live-speak',
        'mediq-demo',
        'arex-platform',
        'medspa-booking-buddy',
        'fitder-ai',
        'ai-e-commerce-brown',
        'card-tn03',
        'card-tn06',
        'card-tn09',
        'card-tn11',
        'card-tn12',
        'botnoi-brewai-production',
        'card-tn14',
        'card-tn15',
        'card-tn16',
        'card-tn17',
      ];

      const targetLower = String(target).toLowerCase();
      const isTargetDisabled = disabledUrls.some((u) => targetLower.includes(u));
      if (isTargetDisabled) {
        console.warn('[WebAvatar Bridge] Intercepted navigation to in-development demo:', target);
        speakWebAvatarMessage('เดโมนี้ยังไม่สามารถเข้าใช้งานได้ค่ะ ตอนนี้กำลังอยู่ในช่วงการพัฒนา');
        return;
      }

      console.log('[WebAvatar Bridge] Handling SPA navigation to:', target);
      try {
        const url = new URL(target, window.location.origin);
        navigate(url.pathname + url.search + url.hash);
      } catch {
        navigate(target);
      }
    };

    const handleAction = async (e: Event) => {
      const customEvent = e as CustomEvent;
      const detail = customEvent.detail || {};
      const action = (detail.action || detail.type || 'click').toLowerCase();
      const selector = detail.target || detail.selector || detail.id || detail.query;

      if (!selector) return;

      if (action === 'click') {
        await triggerElementClick(selector);
      } else if (action === 'fill' || action === 'type') {
        await triggerElementFill(selector, detail.value || '');
      } else if (action === 'highlight') {
        const el = findTargetElement(selector);
        if (el) highlightElement(el);
      } else if (action === 'navigate' || action === 'nav') {
        try {
          const url = new URL(selector, window.location.origin);
          navigate(url.pathname + url.search + url.hash);
        } catch {
          navigate(selector);
        }
      }
    };

    const handlePostMessage = (e: MessageEvent) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (!data || typeof data !== 'object') return;

        if (data.type === 'webavatar-navigate') {
          const target = data.target || data.url || data.path;
          if (target) {
            navigate(target);
          }
        } else if (data.type === 'webavatar-action' || data.type === 'botnoi-action') {
          const action = (data.action || 'click').toLowerCase();
          const target = data.target || data.selector || data.id;
          if (target) {
            if (action === 'click') {
              triggerElementClick(target);
            } else if (action === 'fill') {
              triggerElementFill(target, data.value || '');
            }
          }
        }
      } catch {
        // Unrelated message, ignore
      }
    };

    // Expose global bridge
    window.BotnoiActionBridge = {
      navigate: (target: string) => {
        try {
          const url = new URL(target, window.location.origin);
          navigate(url.pathname + url.search + url.hash);
        } catch {
          navigate(target);
        }
        return true;
      },
      click: (selectorOrQuery: string) => triggerElementClick(selectorOrQuery),
      fill: (selectorOrQuery: string, value: string) => triggerElementFill(selectorOrQuery, value),
      highlight: (selectorOrQuery: string) => {
        const el = findTargetElement(selectorOrQuery);
        if (el) {
          highlightElement(el);
          return true;
        }
        return false;
      },
      waitForElement: (selectorOrQuery: string, timeoutMs?: number) => waitForElement(selectorOrQuery, timeoutMs),
      listClickableElements: () => {
        const elements = Array.from(
          document.querySelectorAll<HTMLElement>('button, a, input, select, [role="button"]')
        );
        return elements
          .filter((el) => {
            const rect = el.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).display !== 'none';
          })
          .map((el) => ({
            id: el.id || '',
            testId: el.getAttribute('data-testid') || '',
            text: (el.innerText || el.textContent || (el as HTMLInputElement).value || '').trim().slice(0, 40),
            role: el.getAttribute('role') || el.tagName.toLowerCase(),
            tag: el.tagName.toLowerCase(),
          }));
      },
    };

    document.addEventListener('webavatar-navigate', handleNav);
    document.addEventListener('webavatar-action', handleAction);
    document.addEventListener('webavatar-click', handleAction);
    window.addEventListener('message', handlePostMessage);

    return () => {
      document.removeEventListener('webavatar-navigate', handleNav);
      document.removeEventListener('webavatar-action', handleAction);
      document.removeEventListener('webavatar-click', handleAction);
      window.removeEventListener('message', handlePostMessage);
    };
  }, [navigate]);

  return null;
}
