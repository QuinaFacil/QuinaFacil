import React from 'react';
import { Heading } from './Heading';
import { Text } from './Text';
import { Stack } from './Stack';
import { Flex } from './Flex';

interface PageHeaderProps {
  title: React.ReactNode;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  gap?: 0 | 0.5 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl';
}

export function PageHeader({ title, description, children, className = "", gap = 4, size }: PageHeaderProps) {
  let renderTitle = title;
  
  // Se o título for string e tiver mais de uma palavra, divide automaticamente em duas cores
  if (typeof title === 'string') {
    const words = title.split(' ');
    if (words.length > 1) {
      const lastWord = words.pop();
      renderTitle = (
        <>
          {words.join(' ')}{' '}
          <Heading as="span" variant="brand" size={size}>{lastWord}</Heading>
        </>
      );
    }
  }

  return (
    <Stack gap={gap} className={className}>
      <Flex align="center" justify="between" className="w-full">
        <Heading level={1} size={size} className="uppercase">{renderTitle}</Heading>
        {children && (
          <Flex align="center" gap={3}>
            {children}
          </Flex>
        )}
      </Flex>
      {description && <Text variant="body" color="muted" className="max-w-2xl text-lg">{description}</Text>}
    </Stack>
  );
}
