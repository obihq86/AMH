// Guard React against third-party browser extensions (content.js / globals-front.js) mutating DOM nodes
if (typeof Node === 'function' && Node.prototype) {
  const origRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (child && child.parentNode !== this) {
      return child;
    }
    return origRemoveChild.apply(this, arguments as any) as T;
  };
  const origInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(newNode: T, refNode: Node | null): T {
    if (refNode && refNode.parentNode !== this) {
      if (this instanceof Element) {
        return this.appendChild(newNode);
      }
      return newNode;
    }
    return origInsertBefore.apply(this, arguments as any) as T;
  };
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import SupabaseGate from './SupabaseGate';
import './index.css';

const rootEl = document.getElementById('root')!;
ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <SupabaseGate />
  </React.StrictMode>
);
