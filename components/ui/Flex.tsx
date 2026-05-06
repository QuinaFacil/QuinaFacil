import React from 'react';
import { BaseProps, useLayoutStyles } from './Box';

interface FlexProps extends BaseProps {
  direction?: 'row' | 'col';
  align?: 'start' | 'center' | 'end' | 'baseline' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
  wrap?: boolean;
}

export function Flex(props: FlexProps) {
  const { 
    children, 
    direction = 'row', 
    align = 'stretch', 
    justify = 'start', 
    gap = 0, 
    wrap = false, 
    className = "",
    as: Tag = 'div',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    padding: _padding, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    bg: _bg, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    border: _border, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    rounded: _rounded, 
    minHeight,
    style,
    ...rest
  } = props;

  const layoutClasses = useLayoutStyles(props);

  const directionStyles = {
    row: 'flex-row',
    col: 'flex-col',
  };

  const alignStyles = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    baseline: 'items-baseline',
    stretch: 'items-stretch',
  };

  const justifyStyles = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
  };

  const gapStyles = {
    0: 'gap-0',
    1: 'gap-1',
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    5: 'gap-5',
    6: 'gap-6',
    8: 'gap-8',
    10: 'gap-10',
    12: 'gap-12',
  };

  return (
    <Tag 
      {...rest}
      style={{ ...style, minHeight }}
      className={`
        flex 
        ${directionStyles[direction]} 
        ${alignStyles[align]} 
        ${justifyStyles[justify]} 
        ${gapStyles[gap as keyof typeof gapStyles]} 
        ${wrap ? 'flex-wrap' : 'flex-nowrap'} 
        ${layoutClasses}
        ${className}
      `}
    >
      {children}
    </Tag>
  );
}
