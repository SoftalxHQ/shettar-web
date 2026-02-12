/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

export const objectsEqual = (val1: any, val2: any) => {
  return JSON.stringify({ a: val1 }) === JSON.stringify({ a: val2 });
};

export const childrenEqual = (val1: any, val2: any) => {
  const keys1 = React.Children.map(val1, (child: any) => child.key) || [];
  const keys2 = React.Children.map(val2, (child: any) => child.key) || [];

  // different size
  if (keys1.length !== keys2.length) return false;

  // check each key
  for (let i = 0; i < keys1.length; i++) {
    if (keys1[i] !== keys2[i]) return false;
  }

  return true;
};
