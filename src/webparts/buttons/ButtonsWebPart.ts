import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart, WebPartContext } from '@microsoft/sp-webpart-base';
import {
  IPropertyPaneConfiguration,
  PropertyPaneDropdown
} from '@microsoft/sp-property-pane';

import Buttons from './components/Buttons';

import {
  PropertyFieldCollectionData,
  CustomCollectionFieldType
} from '@pnp/spfx-property-controls/lib/PropertyFieldCollectionData';

import {
  PropertyFieldFilePicker,
  IFilePickerResult
} from '@pnp/spfx-property-controls/lib/PropertyFieldFilePicker';

export interface IButtonItem {
  title: string;
  description?: string;
  link: string;
  type: string;

  // optional per row
  iconMode?: 'fluent' | 'image';
  fluentIconName?: string;
  iconUrl?: string;
}

export interface IButtonsWebPartProps {
  buttons: IButtonItem[];
  layout: 'horizontal' | 'vertical';

  // helper fields for uploading icon to a selected row
  editItemIndex?: number;
  iconPicker?: unknown;
}

export default class ButtonsWebPart extends BaseClientSideWebPart<IButtonsWebPartProps> {
  // ensure the picker control re-renders (and never disappears)
  private _pickerVersion = 0;

  public render(): void {
    const element = React.createElement(Buttons, {
      buttons: this.properties.buttons || [],
      layout: this.properties.layout || 'horizontal'
    });
    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected onPropertyPaneFieldChanged(propertyPath: string): void {
    // whenever the rows change or the selected row changes,
    // bump the picker key to force a fresh control instance
    if (propertyPath === 'buttons' || propertyPath === 'editItemIndex') {
      this._pickerVersion++;
      this.context.propertyPane.refresh();
    }
    this.render();
  }

  private _rowLabel(idx: number, item?: IButtonItem): string {
    const t = item?.title?.trim();
    return `${idx + 1}${t ? ` — ${t}` : ''}`;
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    const items = this.properties.buttons || [];
    const editIdx = typeof this.properties.editItemIndex === 'number' ? this.properties.editItemIndex! : 0;
    const safeIdx = Math.min(Math.max(editIdx, 0), Math.max(items.length - 1, 0));

    return {
      pages: [
        {
          header: { description: "Button Group Settings" },
          groups: [
            {
              groupName: "Buttons",
              groupFields: [
                PropertyFieldCollectionData('buttons', {
                  key: 'buttons',
                  label: 'Buttons',
                  panelHeader: 'Configure buttons',
                  manageBtnLabel: 'Manage buttons',
                  value: items,
                  fields: [
                    { id: 'title', title: 'Button Title', type: CustomCollectionFieldType.string, required: true },
                    { id: 'description', title: 'Description', type: CustomCollectionFieldType.string },
                    { id: 'link', title: 'Link', type: CustomCollectionFieldType.string, required: true },
                    {
                      id: 'type',
                      title: 'Type',
                      type: CustomCollectionFieldType.dropdown,
                      options: [
                        { key: 'berry', text: 'Berry' },
                        { key: 'kale', text: 'Kale' },
                        { key: 'kiwi', text: 'Kiwi' },
                        { key: 'blueberry', text: 'Blueberry' }
                      ],
                      required: true
                    },
                    // Icon columns (optional per row)
                    {
                      id: 'iconMode',
                      title: 'Icon Type',
                      type: CustomCollectionFieldType.dropdown,
                      options: [
                        { key: 'image', text: 'Uploaded image' },
                        { key: 'fluent', text: 'Fluent UI icon' }
                      ]
                    },
                    { id: 'fluentIconName', title: 'Fluent icon name (e.g., Page, Link, Phone)', type: CustomCollectionFieldType.string },
                    { id: 'iconUrl', title: 'Icon URL (auto-filled when you upload below)', type: CustomCollectionFieldType.string }
                  ],
                  disabled: false
                }),
                PropertyPaneDropdown('layout', {
                  label: 'Layout',
                  options: [
                    { key: 'horizontal', text: 'Horizontal' },
                    { key: 'vertical', text: 'Vertical' }
                  ]
                })
              ]
            },
            // Icon upload for a selected row (always visible)
            {
              groupName: 'Icon upload (choose a row)',
              groupFields: [
                PropertyPaneDropdown('editItemIndex', {
                  label: 'Select a button to upload icon',
                  options: items.length
                    ? items.map((it, i) => ({ key: i, text: this._rowLabel(i, it) }))
                    : [{ key: 0, text: '1' }],
                  selectedKey: safeIdx
                }),
                PropertyFieldFilePicker('iconPicker', {
                  key: `buttons-icon-picker-${this._pickerVersion}-${safeIdx}`, // unique per change
                  context: this.context as WebPartContext,
                  filePickerResult: {
                    fileAbsoluteUrl:
                      items[safeIdx]?.iconUrl && typeof items[safeIdx].iconUrl === 'string'
                        ? items[safeIdx].iconUrl!
                        : ''
                  } as IFilePickerResult,
                  onSave: (result: IFilePickerResult): void => {
                    const url = result?.fileAbsoluteUrl || '';
                    if (items[safeIdx]) {
                      items[safeIdx].iconUrl = url;
                      items[safeIdx].iconMode = 'image'; // ensure image mode after upload
                      this.properties.buttons = [...items];
                    }
                    this._pickerVersion++;                 // force new instance next render
                    this.context.propertyPane.refresh();   // update UI immediately
                    this.render();
                  },
                  onChanged: (result: IFilePickerResult): void => {
                    const url = result?.fileAbsoluteUrl || '';
                    if (items[safeIdx]) {
                      items[safeIdx].iconUrl = url;
                      items[safeIdx].iconMode = 'image';
                      this.properties.buttons = [...items];
                    }
                    this.render();
                  },
                  properties: this.properties,
                  onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
                  accepts: ['.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp'],
                  hideStockImages: true,
                  allowExternalLinks: false,
                  buttonLabel: 'Choose or upload icon image'
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
