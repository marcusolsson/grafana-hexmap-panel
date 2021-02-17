import { FieldType, PanelPlugin } from '@grafana/data';
import { SimpleOptions } from './types';
import { HexmapPanel } from './HexmapPanel';
import { FieldSelectEditor, getPanelPluginOrFallback } from 'grafana-plugin-support';

export const plugin = getPanelPluginOrFallback(
  'marcusolsson-hexmap-panel',
  new PanelPlugin<SimpleOptions>(HexmapPanel).useFieldConfig().setPanelOptions((builder) => {
    return builder
      .addCustomEditor({
        id: 'valueFieldName',
        path: 'valueFieldName',
        name: 'Value',
        description: 'Defaults to the first numeric field.',
        category: ['Dimensions'],
        editor: FieldSelectEditor,
        settings: {
          filterByType: [FieldType.number],
        },
      })
      .addCustomEditor({
        id: 'colorByField',
        path: 'colorByField',
        name: 'Color by',
        description: 'Field to use for color. Defaults to the value field. Set the color scheme under the Fields tab.',
        editor: FieldSelectEditor,
        category: ['Dimensions'],
        settings: {
          filterByType: [FieldType.number],
        },
      })
      .addCustomEditor({
        id: 'sizeByField',
        path: 'sizeByField',
        name: 'Size by',
        description: 'Field to use for size. If empty, all hexagons will be the same size.',
        category: ['Dimensions'],
        editor: FieldSelectEditor,
        settings: {
          filterByType: [FieldType.number],
        },
      })
      .addCustomEditor({
        id: 'groupByField',
        path: 'groupByField',
        name: 'Group by',
        description: 'Field to group by. Select fields to group by.',
        editor: FieldSelectEditor,
        category: ['Dimensions'],
      })
      .addSelect({
        path: 'padding',
        name: 'Padding',
        description: 'Percentage of the hexagon size',
        settings: {
          options: Array.from({ length: 10 })
            .map((_, i) => i / 10)
            .map((_) => ({ label: `${_ * 100}%`, value: _ })),
        },
        defaultValue: 0.1,
      })
      .addBooleanSwitch({
        path: 'background',
        name: 'Background',
        description:
          'Display a background for hexagons. Currently, this doubles the hexagons on screen and can make the panel slow for large number of hexagons',
        defaultValue: true,
      })
      .addBooleanSwitch({
        path: 'guides',
        name: 'Draw guides',
        category: ['Development'],
        description: 'Displays bounding boxes to find layout issues while developing',
        defaultValue: false,
      });
  })
);
