import React from 'react';
import { LucideIcon, Eye, EyeOff } from 'lucide-react';
import { Box } from './Box';
import { Flex } from './Flex';
import { Text } from './Text';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  error?: string;
  rightElement?: React.ReactNode;
  className?: string;
}

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(({
  label,
  icon: Icon,
  error,
  rightElement,
  className = "",
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const isPassword = props.type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : props.type;

  return (
    <Flex direction="col" gap={2} className={`w-full ${className}`}>
      {label && <Text variant="label" color="primary" className=" uppercase italic font-black tracking-widest">{label}</Text>}
      <Box padding={0} className="relative group">
        {Icon && (
          <Box className="absolute left-5 top-1/2 -translate-y-1/2 text-foreground/30 group-focus-within:text-primary-light transition-colors">
            <Icon size={18} />
          </Box>
        )}
        <input
          {...props}
          ref={ref}
          type={inputType}
          className={`input-field w-full ${Icon ? 'pl-14' : ''} ${isPassword || rightElement ? 'pr-14' : ''} ${error ? '!border-error/50 !bg-error/5' : ''}`}
        />

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
