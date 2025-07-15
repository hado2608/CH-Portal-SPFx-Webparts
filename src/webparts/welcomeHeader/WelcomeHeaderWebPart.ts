import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import * as strings from 'WelcomeHeaderWebPartStrings';
import WelcomeHeader from './components/WelcomeHeader';
import { IWelcomeHeaderProps } from './components/IWelcomeHeaderProps';

export interface IWelcomeHeaderWebPartProps {
  welcomeMessage: string;
  subtitle: string;
}

export default class WelcomeHeaderWebPart extends BaseClientSideWebPart<IWelcomeHeaderWebPartProps> {

  public render(): void {
    const element: React.ReactElement<IWelcomeHeaderProps> = React.createElement(
      WelcomeHeader,
      {
        welcomeMessage: this.properties.welcomeMessage,
        subtitle: this.properties.subtitle,
        userName: this.context.pageContext.user.displayName
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
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('welcomeMessage', { label: 'Welcome Message' }),
                PropertyPaneTextField('subtitle', { label: 'Subtitle' }),
              ]
            }
          ]
        }
      ]
    };
  }
}
