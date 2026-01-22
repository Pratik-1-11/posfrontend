import { theme } from './index';
import type { Theme } from './index';



/**
 * Get a color value from the theme
 * @param colorPath - Dot notation path to the color (e.g., 'primary.500')
 * @returns The color value or a fallback
 */
export const getColor = (colorPath: string): string => {
  try {
    const path = colorPath.split('.');
    // @ts-ignore - Dynamic path access
    return path.reduce((obj, key) => obj?.[key], theme.colors) as string || colorPath;
  } catch (error) {
    console.warn(`Color "${colorPath}" not found in theme`);
    return colorPath;
  }
};

/**
 * Get a spacing value from the theme
 * @param size - The spacing size key or value
 * @returns The spacing value
 */
export const getSpacing = (size: keyof Theme['spacing'] | string | number): string => {
  if (typeof size === 'number') return `${size}px`;
  return theme.spacing[size as keyof Theme['spacing']] || size;
};

/**
 * Get a typography style object
 * @param variant - Typography variant (e.g., 'h1', 'body', 'caption')
 * @returns Typography styles object
 */
export const getTypography = (variant: keyof Theme['typography']['fontSize']) => ({
  fontSize: theme.typography.fontSize[variant],
  lineHeight: theme.typography.lineHeight.normal,
  fontFamily: theme.typography.fontFamily.sans.join(','),
});

/**
 * Get a consistent shadow style
 * @param shadow - Shadow variant from the theme
 * @returns The box-shadow value
 */
export const getShadow = (shadow: keyof Theme['boxShadow'] = 'DEFAULT') => ({
  boxShadow: theme.boxShadow[shadow],
});

/**
 * Get consistent border radius
 * @param size - Border radius size from the theme
 * @returns The border-radius value
 */
export const getBorderRadius = (size: keyof Theme['borderRadius'] = 'DEFAULT') => ({
  borderRadius: theme.borderRadius[size],
});

/**
 * Get transition styles
 * @param property - CSS property to transition
 * @param duration - Transition duration from theme
 * @param timing - Transition timing function from theme
 * @returns Transition styles object
 */
export const getTransition = (
  property: string | string[] = 'all',
  duration: keyof Theme['transition']['duration'] = 'DEFAULT',
  timing: keyof Theme['transition']['timing'] = 'DEFAULT'
) => {
  const properties = Array.isArray(property) ? property.join(', ') : property;
  return {
    transitionProperty: properties,
    transitionDuration: theme.transition.duration[duration],
    transitionTimingFunction: theme.transition.timing[timing],
  };
};

/**
 * Create a consistent button style
 * @param variant - Button variant (primary, secondary, etc.)
 * @param size - Button size (sm, md, lg)
 * @returns Button styles object
 */
export const getButtonStyle = (
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' = 'primary',
  size: 'sm' | 'md' | 'lg' = 'md'
) => {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: theme.typography.fontWeight.medium,
    borderRadius: theme.borderRadius.DEFAULT,
    ...getTransition(['background-color', 'border-color', 'color', 'box-shadow']),
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
    '&:focus': {
      outline: 'none',
      boxShadow: `0 0 0 3px ${getColor('primary.100')}`,
    },
  };

  const variants = {
    primary: {
      backgroundColor: getColor('primary.500'),
      color: 'white',
      '&:hover:not(:disabled)': {
        backgroundColor: getColor('primary.600'),
      },
      '&:active:not(:disabled)': {
        backgroundColor: getColor('primary.700'),
      },
    },
    secondary: {
      backgroundColor: getColor('secondary.500'),
      color: 'white',
      '&:hover:not(:disabled)': {
        backgroundColor: getColor('secondary.600'),
      },
      '&:active:not(:disabled)': {
        backgroundColor: getColor('secondary.700'),
      },
    },
    outline: {
      backgroundColor: 'transparent',
      border: `1px solid ${getColor('gray.300')}`,
      color: getColor('gray.700'),
      '&:hover:not(:disabled)': {
        backgroundColor: getColor('gray.50'),
        borderColor: getColor('gray.400'),
      },
    },
    ghost: {
      backgroundColor: 'transparent',
      color: getColor('gray.700'),
      '&:hover:not(:disabled)': {
        backgroundColor: getColor('gray.100'),
      },
    },
    link: {
      backgroundColor: 'transparent',
      color: getColor('primary.600'),
      textDecoration: 'underline',
      '&:hover:not(:disabled)': {
        color: getColor('primary.700'),
        textDecoration: 'none',
      },
    },
  };

  const sizes = {
    sm: {
      padding: `${getSpacing(1.5)} ${getSpacing(3)}`,
      fontSize: theme.typography.fontSize.sm,
    },
    md: {
      padding: `${getSpacing(2)} ${getSpacing(4)}`,
      fontSize: theme.typography.fontSize.base,
    },
    lg: {
      padding: `${getSpacing(2.5)} ${getSpacing(5)}`,
      fontSize: theme.typography.fontSize.lg,
    },
  };

  return {
    ...baseStyle,
    ...variants[variant],
    ...sizes[size],
  };
};

/**
 * Create a consistent input style
 * @param hasError - Whether the input has an error
 * @returns Input styles object
 */
export const getInputStyle = (hasError = false) => ({
  width: '100%',
  padding: `${getSpacing(2)} ${getSpacing(3)}`,
  fontSize: theme.typography.fontSize.base,
  lineHeight: theme.typography.lineHeight.normal,
  color: getColor('gray.900'),
  backgroundColor: 'white',
  border: `1px solid ${hasError ? getColor('error.500') : getColor('gray.300')}`,
  borderRadius: theme.borderRadius.DEFAULT,
  ...getTransition(['border-color', 'box-shadow']),
  '&:focus': {
    outline: 'none',
    borderColor: hasError ? getColor('error.500') : getColor('primary.500'),
    boxShadow: `0 0 0 3px ${hasError ? getColor('error.100') : getColor('primary.100')
      }`,
  },
  '&:disabled': {
    backgroundColor: getColor('gray.100'),
    cursor: 'not-allowed',
  },
  '&::placeholder': {
    color: getColor('gray.500'),
  },
});

/**
 * Create a consistent card style
 * @returns Card styles object
 */
export const getCardStyle = () => ({
  backgroundColor: 'white',
  borderRadius: theme.borderRadius.lg,
  boxShadow: theme.boxShadow.DEFAULT,
  padding: getSpacing(4),
  ...getTransition(['box-shadow', 'transform']),
  '&:hover': {
    boxShadow: theme.boxShadow.md,
  },
});
