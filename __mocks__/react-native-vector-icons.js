/**
 * Mock for react-native-vector-icons
 */

import React from 'react';

const createIconComponent = (name) => {
  const Icon = ({ size, color, ...props }) => {
    return React.createElement('svg', {
      width: size,
      height: size,
      fill: color,
      ...props,
    });
  };
  Icon.displayName = name;
  return Icon;
};

export default createIconComponent('Icon');
export const Ionicons = createIconComponent('Ionicons');
export const MaterialIcons = createIconComponent('MaterialIcons');
export const FontAwesome = createIconComponent('FontAwesome');
export const FontAwesome5 = createIconComponent('FontAwesome5');
export const MaterialCommunityIcons = createIconComponent('MaterialCommunityIcons');
