import React from 'react';
import { BaseProps, useLayoutStyles } from './Box';

interface StackProps extends BaseProps {
  gap?: 0 | 0.5 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | "section";
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  direction?: 'col' | 'row';
  onSubmit?: React.FormEventHandler;
}

export function Stack(props: StackProps) {
  const { 
    children, 
    gap = 4, 
    align = 'stretch',
    justify = 'start',
    className = "", 
    direction = 'col',
    as: Component = 'div',
    id,
    onClick,
    style,
    onSubmit
  } = props;

  const layoutClasses = useLayoutStyles(props);

  const gapStyles = {
    0: 'gap-0',
    0.5: 'gap-0.5',
    1: 'gap-1',
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    5: 'gap-5',
    6: 'gap-6',
    8: 'gap-8',
    10: 'gap-10',
    12: 'gap-12',
    "section": 'gap-12 lg:gap-16',
  };

  const alignStyles = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  const justifyStyles = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
  };

  const directionStyles = {
    col: 'flex-col',
    row: 'flex-row items-center',
  };

  return (
    <Component 
      id={id}
      onClick={onClick}
      style={style}
      onSubmit={onSubmit}
      className={`
        flex 
        ${directionStyles[direction]} 
        ${alignStyles[align]} 
        ${justifyStyles[justify]} 
        ${gapStyles[gap as keyof typeof gapStyles]} 
        ${layoutClasses}
        ${className}
      `}
    >
      {children}
    </Component>
  );
}
