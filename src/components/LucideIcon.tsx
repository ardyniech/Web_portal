/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import * as Icons from 'lucide-react';

interface LucideIconProps {
  name: string;
  className?: string;
  size?: number;
}

export function LucideIcon({ name, className = '', size = 16 }: LucideIconProps) {
  // Safe lookup with fallback
  const IconComponent = (Icons as any)[name] || Icons.Sparkles;
  
  return <IconComponent className={`drop-shadow-neon ${className}`} size={size} />;
}
