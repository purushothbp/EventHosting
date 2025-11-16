declare module 'react-day-picker' {
  export interface DayPickerSingleProps {
    mode?: 'single';
    selected?: Date;
    onSelect?: (date?: Date) => void;
    showOutsideDays?: boolean;
    className?: string;
    classNames?: Record<string, string>;
    disabled?: {
      before?: Date;
      after?: Date;
    };
    defaultMonth?: Date;
    id?: string;
    components?: {
      IconLeft?: React.ComponentType<any>;
      IconRight?: React.ComponentType<any>;
    };
  }

  export interface ClassNames {
    [key: string]: string;
  }

  export const DayPicker: React.FC<DayPickerSingleProps>;
}
