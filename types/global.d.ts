declare global {
  var self: typeof globalThis
  var window: typeof globalThis
  var WorkerGlobalScope: undefined
  var importScripts: undefined
}

declare module '@radix-ui/react-select' {
  import * as React from 'react';
  
  type PrimitiveButtonProps = React.ComponentProps<'button'>;
  type PrimitiveDivProps = React.ComponentProps<'div'>;
  
  export interface SelectProps extends PrimitiveDivProps {
    defaultValue?: string;
    value?: string;
    onValueChange?(value: string): void;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?(open: boolean): void;
    dir?: 'ltr' | 'rtl';
    name?: string;
    autoComplete?: string;
    disabled?: boolean;
    required?: boolean;
  }

  export interface SelectTriggerProps extends PrimitiveButtonProps {}
  export interface SelectValueProps extends PrimitiveDivProps {}
  export interface SelectIconProps extends PrimitiveDivProps {
    asChild?: boolean;
  }
  export interface SelectPortalProps extends PrimitiveDivProps {}
  export interface SelectContentProps extends PrimitiveDivProps {
    position?: 'item' | 'popper';
    side?: 'top' | 'right' | 'bottom' | 'left';
    sideOffset?: number;
    align?: 'start' | 'center' | 'end';
    alignOffset?: number;
    avoidCollisions?: boolean;
    collisionBoundary?: Element | null | Array<Element | null>;
    collisionPadding?: number | Partial<Record<'top' | 'right' | 'bottom' | 'left', number>>;
    arrowPadding?: number;
    sticky?: 'partial' | 'always';
    hideWhenDetached?: boolean;
  }
  export interface SelectViewportProps extends PrimitiveDivProps {}
  export interface SelectGroupProps extends PrimitiveDivProps {}
  export interface SelectLabelProps extends PrimitiveDivProps {}
  export interface SelectItemProps extends PrimitiveButtonProps {
    value: string;
    disabled?: boolean;
    textValue?: string;
    asChild?: boolean;
  }
  export interface SelectItemTextProps extends PrimitiveDivProps {}
  export interface SelectItemIndicatorProps extends PrimitiveDivProps {}
  export interface SelectScrollUpButtonProps extends PrimitiveButtonProps {}
  export interface SelectScrollDownButtonProps extends PrimitiveButtonProps {}
  export interface SelectSeparatorProps extends PrimitiveDivProps {}

  export const Root: React.FC<SelectProps>;
  export const Trigger: React.ForwardRefExoticComponent<SelectTriggerProps>;
  export const Value: React.ForwardRefExoticComponent<SelectValueProps>;
  export const Icon: React.ForwardRefExoticComponent<SelectIconProps>;
  export const Portal: React.ForwardRefExoticComponent<SelectPortalProps>;
  export const Content: React.ForwardRefExoticComponent<SelectContentProps>;
  export const Viewport: React.ForwardRefExoticComponent<SelectViewportProps>;
  export const Group: React.ForwardRefExoticComponent<SelectGroupProps>;
  export const Label: React.ForwardRefExoticComponent<SelectLabelProps>;
  export const Item: React.ForwardRefExoticComponent<SelectItemProps>;
  export const ItemText: React.ForwardRefExoticComponent<SelectItemTextProps>;
  export const ItemIndicator: React.ForwardRefExoticComponent<SelectItemIndicatorProps>;
  export const ScrollUpButton: React.ForwardRefExoticComponent<SelectScrollUpButtonProps>;
  export const ScrollDownButton: React.ForwardRefExoticComponent<SelectScrollDownButtonProps>;
  export const Separator: React.ForwardRefExoticComponent<SelectSeparatorProps>;
}

export {} 