import React from 'react';
import { StandardEditorProps, FieldType, SelectableValue } from '@grafana/data';
import { MultiSelect } from '@grafana/ui';

interface Settings {
  filterByType: FieldType;
}

interface Props extends StandardEditorProps<string[], Settings> {}

export const FieldMultiSelectEditor: React.FC<Props> = ({ item, value, onChange, context }) => {
  if (context.data && context.data.length > 0) {
    const options = context.data
      .flatMap((frame) => frame.fields)
      .filter((field) => (item.settings?.filterByType ? field.type === item.settings?.filterByType : true))
      .map((field: SelectableValue<string[]>) => ({
        label: field.name,
        value: field.name,
      }));

    return <MultiSelect value={value} onChange={(v) => onChange(v.map((_) => _.value!))} options={options} />;
  }

  return <MultiSelect onChange={() => {}} disabled={true} />;
};
