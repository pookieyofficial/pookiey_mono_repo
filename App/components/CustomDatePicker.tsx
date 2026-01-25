import React from 'react';
import { DatePickerModal } from 'react-native-paper-dates';

interface CustomDatePickerProps {
  visible: boolean;
  value: Date;
  maximumDate?: Date;
  minimumDate?: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
}

export default function CustomDatePicker({
  visible,
  value,
  maximumDate = new Date(),
  minimumDate,
  onConfirm,
  onCancel,
}: CustomDatePickerProps) {
  const handleConfirm = (params: { date: Date }) => {
    onConfirm(params.date);
  };

  return (
    <DatePickerModal
      locale="en"
      mode="single"
      visible={visible}
      date={value}
      onDismiss={onCancel}
      onConfirm={handleConfirm}
      validRange={{
        startDate: minimumDate,
        endDate: maximumDate,
      }}
      label="Select Birthday"
      saveLabel="Confirm"
      cancelLabel="Cancel"
    />
  );
}
