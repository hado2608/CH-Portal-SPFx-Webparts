// ContactCardWebPart.ts
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import ContactCard from './components/ContactCard';
import { IContactCardProps } from './components/ContactCard';
import {
  IPropertyPaneConfiguration,
  PropertyPaneDropdown,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';

export interface IContactCardWebPartProps {
  layout: 'small' | 'large';
  contactEmail?: string;
  contactPhone?: string;
  contactLink?: string;
  description: string;
}

export default class ContactCardWebPart extends BaseClientSideWebPart<IContactCardWebPartProps> {
  public render(): void {
    const props: IContactCardProps = {
      layout: this.properties.layout,
      contactEmail: this.properties.contactEmail || '',
      contactPhone: this.properties.contactPhone || '',
      contactLink: this.properties.contactLink || '',
      description: this.properties.description || ''
    };

    const element: React.ReactElement<IContactCardProps> = React.createElement(ContactCard, props);

    try {
      ReactDom.render(element, this.domElement);
    } catch (error) {
      console.warn('Error rendering ContactCard web part:', error);
    }
  }
  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: "Contact Card Settings" },
          groups: [
            {
              groupName: "Layout",
              groupFields: [
                PropertyPaneDropdown('layout', {
                  label: 'Layout',
                  options: [
                    { key: 'small', text: 'Small' },
                    { key: 'large', text: 'Large' }
                  ]
                })
              ]
            },
            {
              groupName: "Contact Info",
              groupFields: [
                PropertyPaneTextField('contactEmail', { label: 'Email (optional)' }),
                PropertyPaneTextField('contactPhone', { label: 'Phone (optional)' }),
                PropertyPaneTextField('contactLink', { label: 'Link (optional)' }),
                PropertyPaneTextField('description', { label: 'Description' })
              ]
            }
          ]
        }
      ]
    };
  }
}
