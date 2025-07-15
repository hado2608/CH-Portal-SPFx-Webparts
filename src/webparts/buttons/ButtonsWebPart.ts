import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart
} from '@microsoft/sp-webpart-base';
import {
  IPropertyPaneConfiguration,
  PropertyPaneDropdown
} from '@microsoft/sp-property-pane'; // <-- CORRECT IMPORT
import Buttons from './components/Buttons';
import { PropertyFieldCollectionData, CustomCollectionFieldType } from '@pnp/spfx-property-controls/lib/PropertyFieldCollectionData';

export interface IButtonItem {
  title: string;
  description?: string;
  link: string;
  type: string;
}

export interface IButtonsWebPartProps {
  buttons: IButtonItem[];
  layout: 'horizontal' | 'vertical';
}

export default class ButtonsWebPart extends BaseClientSideWebPart<IButtonsWebPartProps> {

  public render(): void {
    const element: React.ReactElement<IButtonsWebPartProps> = React.createElement(
      Buttons,
      {
        buttons: this.properties.buttons || [],
        layout: this.properties.layout || 'horizontal'
      }
    );
    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
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
                  value: this.properties.buttons,
                  fields: [
                    { id: 'title', title: 'Button Title', type: CustomCollectionFieldType.string, required: true },
                    { id: 'description', title: 'Description', type: CustomCollectionFieldType.string },
                    { id: 'link', title: 'Link', type: CustomCollectionFieldType.string, required: true },
                    { id: 'type', title: 'Type', type: CustomCollectionFieldType.dropdown, options: [
                      { key: 'berry', text: 'Berry' },
                      { key: 'kale', text: 'Kale' },
                      { key: 'kiwi', text: 'Kiwi' },
                      { key: 'blueberry', text: 'Blueberry' }
                    ], required: true }
                  ],
                  disabled: false
                  // REMOVED: context: this.context
                }),
                PropertyPaneDropdown('layout', {
                  label: 'Layout',
                  options: [
                    { key: 'horizontal', text: 'Horizontal' },
                    { key: 'vertical', text: 'Vertical' }
                  ]
                })
              ]
            }
          ]
        }
      ]
    };
  }
}