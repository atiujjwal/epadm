// EPADM UI Components - Barrel Exports
// Re-export all UI components from a single entry point

import { ButtonStyles } from "./button";
import { BadgeStyles } from "./badge";
import { CardStyles } from "./card";
import { InputStyles } from "./input";
import { LabelStyles } from "./label";
import { SelectStyles } from "./select";
import { TextareaStyles } from "./textarea";
import { FormStyles } from "./form";
import { TableStyles } from "./table";

// Buttons
export { Button, ButtonStyles } from "./button";
export type { ButtonProps, ButtonAnchorProps } from "./button";

// Badges
export { Badge, BadgeStyles } from "./badge";
export type { BadgeProps } from "./badge";

// Cards
export { Card, CardStyles, CardHeader, CardBody, CardFooter } from "./card";
export type { CardProps, CardHeaderProps, CardBodyProps, CardFooterProps } from "./card";

// Forms
export { Input, InputStyles } from "./input";
export type { InputProps } from "./input";

export { Label, LabelStyles } from "./label";
export type { LabelProps } from "./label";

export { Select, SelectStyles } from "./select";
export type { SelectProps } from "./select";

export { Textarea, TextareaStyles } from "./textarea";
export type { TextareaProps } from "./textarea";

export {
  Form,
  FormStyles,
  FormItem,
  FormError,
  FormSuccess,
  FormDescription,
  FormGroup,
} from "./form";
export type {
  FormProps,
  FormItemProps,
  FormErrorProps,
  FormSuccessProps,
  FormDescriptionProps,
  FormGroupProps,
} from "./form";

// Tables
export {
  Table,
  TableStyles,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
} from "./table";
export type {
  TableProps,
  TableHeaderProps,
  TableBodyProps,
  TableFooterProps,
  TableRowProps,
  TableHeadProps,
  TableCellProps,
} from "./table";

// Helper to render all component styles globally (call once in root layout)
export function renderUIStyles() {
  return (
    <>
      <ButtonStyles />
      <BadgeStyles />
      <CardStyles />
      <InputStyles />
      <LabelStyles />
      <SelectStyles />
      <TextareaStyles />
      <FormStyles />
      <TableStyles />
    </>
  );
}