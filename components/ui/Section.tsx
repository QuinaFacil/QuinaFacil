import React from 'react';
import { Stack } from './Stack';
import { Flex } from './Flex';
import { Box } from './Box';

import { Text } from "@/components/ui/Text";
import { Heading } from "@/components/ui/Heading";

interface SectionProps {
  num?: string;
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Section({ num, title, action, children, className = "" }: SectionProps) {
  return (
    <section className={`relative flex flex-col w-full max-w-full overflow-hidden gap-[30px] md:gap-[50px] animate-in fade-in slide-in-from-bottom-4 duration-700 ${className}`}>
      {title && (
        <Stack gap={4}>
          <Flex direction="col" gap={4} className="md:flex-row md:items-center md:justify-between">
            <Flex gap={4} align="center">
              {num && <Text color="primary" className="italic font-black text-xl" as="span">{num}.</Text>}
              <Heading level={2} size="xl">{title}</Heading>
            </Flex>
            {action && (
              <Box className="w-full md:w-auto">
                {action}
              </Box>
            )}
          </Flex>
          <Box className="ui-divider-line" />
        </Stack>
      )}
      <Stack gap={5}>
        {children}
      </Stack>
    </section>
  );
}
