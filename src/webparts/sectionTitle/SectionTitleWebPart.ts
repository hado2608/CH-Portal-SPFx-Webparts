// src/webparts/sectionTitle/SectionTitleWebPart.ts
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart, WebPartContext } from '@microsoft/sp-webpart-base';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneDropdown,
  IPropertyPaneDropdownOption
} from '@microsoft/sp-property-pane';
import { escape } from '@microsoft/sp-lodash-subset';
import styles from './SectionTitleWebPart.module.scss';

import {
  PropertyFieldFilePicker,
  IFilePickerResult
} from '@pnp/spfx-property-controls/lib/PropertyFieldFilePicker';

type IconMode = 'fluent' | 'image';

export interface ISectionTitleWebPartProps {
  title: string;
  iconMode?: IconMode;
  fluentIconName?: string;
  iconUrl?: string;     // keep as string ONLY
  iconPicker?: unknown; // bound only to picker; not used in render
}

export default class SectionTitleWebPart extends BaseClientSideWebPart<ISectionTitleWebPartProps> {
  // force fresh picker instance when props change
  private _pickerVersion = 0;

  public render(): void {
    const title =
      typeof this.properties.title === 'string' ? escape(this.properties.title) : 'Key Resources';

    const mode: IconMode = (this.properties.iconMode || 'fluent') as IconMode;

    const fluentName =
      typeof this.properties.fluentIconName === 'string'
        ? this.properties.fluentIconName.trim()
        : '';

    const iconUrl =
      typeof this.properties.iconUrl === 'string' ? this.properties.iconUrl.trim() : '';

    let iconHtml = '';
    if (mode === 'fluent' && fluentName) {
      iconHtml = `<i class="ms-Icon ms-Icon--${escape(fluentName)} ${styles.iconFluent}" aria-hidden="true"></i>`;
    } else if (mode === 'image' && iconUrl) {
      iconHtml = `<img class="${styles.icon}" src="${escape(iconUrl)}" alt="" aria-hidden="true" />`;
    }

    this.domElement.innerHTML = `
      <div class="${styles.sectionTitle}">
        <div class="${styles.left}">
          ${iconHtml}
          <span class="${styles.titleText}">${title}</span>
        </div>
      </div>
    `;
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected onPropertyPaneFieldChanged(propertyPath: string): void {
    if (propertyPath === 'iconMode' || propertyPath === 'iconUrl') {
      this._pickerVersion++;                 // force new picker instance
      this.context.propertyPane.refresh();   // re-evaluate disabled states
    }
    this.render();
  }

  private _iconModeOptions: IPropertyPaneDropdownOption[] = [
    { key: 'fluent', text: 'Fluent UI icon' },
    { key: 'image',  text: 'Uploaded image' }
  ];

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    const isFluent = (this.properties.iconMode || 'fluent') === 'fluent';

    const filePicker = PropertyFieldFilePicker('iconPicker', {
      key: `sectionTitle-icon-picker-${this._pickerVersion}`, // unique each time
      context: this.context as WebPartContext,
      filePickerResult: {
        fileAbsoluteUrl: typeof this.properties.iconUrl === 'string' ? this.properties.iconUrl : ''
      } as IFilePickerResult,
      onSave: (result: IFilePickerResult): void => {
        this.properties.iconUrl = result?.fileAbsoluteUrl || '';
        this.properties.iconMode = 'image';   // ensure image mode after upload
        this._pickerVersion++;
        this.context.propertyPane.refresh();
        this.render();
      },
      onChanged: (result: IFilePickerResult): void => {
        this.properties.iconUrl = result?.fileAbsoluteUrl || '';
        this.properties.iconMode = 'image';
        this.render();
      },
      properties: this.properties,
      onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
      accepts: ['.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp'],
      buttonLabel: 'Choose or upload icon image',
      hideStockImages: true,
      allowExternalLinks: false,
      // keep it available all the time
      disabled: false
    });

    return {
      pages: [
        {
          header: { description: 'Section Title Settings' },
          groups: [
            {
              groupName: 'Title',
              groupFields: [
                PropertyPaneTextField('title', {
                  label: 'Section Title',
                  placeholder: 'Key Resources'
                })
              ]
            },
            {
              groupName: 'Icon',
              groupFields: [
                PropertyPaneDropdown('iconMode', {
                  label: 'Icon type',
                  options: this._iconModeOptions,
                  selectedKey: this.properties.iconMode || 'fluent'
                }),
                PropertyPaneTextField('fluentIconName', {
                  label: 'Fluent UI icon name (e.g., Page, FileImage, PDF)',
                  placeholder: 'Page',
                  disabled: !isFluent
                }),
                // Always render picker so you can re-upload any time
                filePicker
              ]
            }
          ]
        }
      ]
    };
  }
}
