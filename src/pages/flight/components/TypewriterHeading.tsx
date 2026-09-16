import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import type { TypewriterHeadingProps } from "../types";

export const TypewriterHeading: React.FC<TypewriterHeadingProps> = ({ text, className }) => {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const containerRef = useRef<HTMLHeadingElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.3 });

  useEffect(() => {
    if (!isInView) return;

    let i = 0;
    setDisplayText("");
    setIsTyping(true);
    let doneTimer: ReturnType<typeof setTimeout> | undefined;

    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
        doneTimer = setTimeout(() => {
          setIsTyping(false);
        }, 1200);
      }
    }, 45);

    return () => {
      clearInterval(timer);
      if (doneTimer) clearTimeout(doneTimer);
    };
  }, [text, isInView]);

  return (
    <h2 ref={containerRef} className={className}>
      <span>{displayText}</span>
      <AnimatePresence>
        {isTyping && (
          <motion.span
            className="inline-block ml-0.5 text-primary font-normal select-none"
            initial={{ opacity: 1 }}
            animate={{ opacity: [1, 0] }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
          >
            |
          </motion.span>
        )}
      </AnimatePresence>
    </h2>
  );
};

export default TypewriterHeading;
