import React from 'react';
import { LucideIcon, Eye, EyeOff } from 'lucide-react';
import { Box } from './Box';
import { Flex } from './Flex';
import { Text } from './Text';

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  error?: string;
  rightElement?: React.ReactNode;
  className?: string;
  as?: 'input' | 'textarea';
  rows?: number;
}

export const InputField = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, InputFieldProps>(({
  label,
  icon: Icon,
  error,
  rightElement,
  className = "",
  as = 'input',
  ...props
}, ref) => {
  const internalRef = React.useRef<HTMLTextAreaElement | HTMLInputElement>(null);
  const combinedRef = (node: HTMLTextAreaElement | HTMLInputElement) => {
    if (internalRef) (internalRef as React.MutableRefObject<HTMLTextAreaElement | HTMLInputElement>).current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | HTMLInputElement>).current = node;
  };

  const [showPassword, setShowPassword] = React.useState(false);
  const isPassword = props.type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : props.type;

  React.useLayoutEffect(() => {
    if (as === 'textarea' && internalRef.current) {
      const element = internalRef.current as HTMLTextAreaElement;
      element.style.height = 'auto';
      element.style.height = `${element.scrollHeight}px`;
    }
  }, [as, props.value]);

  return (
    <Flex direction="col" gap={2} className={`w-full min-w-0 ${className}`}>
      {label && <Text variant="label" color="primary" className=" uppercase italic font-black tracking-widest">{label}</Text>}
      <Box padding={0} className="relative group">
        {as === 'textarea' ? (
          <textarea
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            ref={combinedRef as React.Ref<HTMLTextAreaElement>}
            className={`input-field w-full py-4 resize-none overflow-hidden ${Icon ? 'pl-14' : ''} ${rightElement ? 'pr-14' : ''} ${error ? '!border-error/50 !bg-error/5' : ''}`}
          />
        ) : (
          <input
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
            ref={combinedRef as React.Ref<HTMLInputElement>}
            type={inputType}
            className={`input-field w-full ${Icon ? 'pl-14' : ''} ${isPassword || rightElement ? 'pr-14' : ''} ${error ? '!border-error/50 !bg-error/5' : ''}`}
          />
        )}

        {Icon && (
          <Box className={`absolute left-5 z-10 text-foreground/30 group-focus-within:text-primary-light transition-colors ${as === 'textarea' ? 'top-6' : 'top-1/2 -translate-y-1/2'}`}>
            <Icon size={18} />
          </Box>
        )}

        {isPassword && !rightElement && (
          <Flex
            as="button"
            type="button"
            align="center"
            justify="center"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-foreground/20 hover:text-primary-light transition-colors bg-transparent border-none cursor-pointer p-0"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </Flex>
        )}

        {rightElement && (
          <Box className="absolute right-5 top-1/2 -translate-y-1/2">
            {rightElement}
          </Box>
        )}
      </Box>
      {error && (
        <Text variant="error" color="error" className="animate-in fade-in slide-in-from-top-1">
          {error}
        </Text>
      )}
    </Flex>
  );
});

InputField.displayName = 'InputField';
