import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneCheckbox,
  PropertyPaneTextField,
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import WelcomeHeader from './components/WelcomeHeader';
import { IWelcomeHeaderProps } from './components/WelcomeHeader';

export interface IWelcomeHeaderWebPartProps {
  title?: string;           // greeting prefix
  subtitle?: string;
  useCurrentUser?: boolean; 
  showWave?: boolean;// append current user's name if true
}

export default class WelcomeHeaderWebPart extends BaseClientSideWebPart<IWelcomeHeaderWebPartProps> {
  public render(): void {
    const includeName = this.properties.useCurrentUser === true;

    const element: React.ReactElement<IWelcomeHeaderProps> = React.createElement(WelcomeHeader, {
      context: this.context,
      title: this.properties.title || 'Welcome',                        // greeting
      userName: includeName ? (this.context.pageContext.user.displayName || '') : '', // name or blank
      subtitle: this.properties.subtitle || 'to your City Harvest Portal!',
      showWave: this.properties.showWave ?? true
    });

    ReactDom.render(element, this.domElement);
  }

  public onInit(): Promise<void> {
    const fontLinkId = 'google-font-bitter';
    if (!document.getElementById(fontLinkId)) {
      const link = document.createElement('link');
      link.id = fontLinkId;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Bitter:wght@700&display=swap';
      document.head.appendChild(link);
    }
    return Promise.resolve();
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
          header: { description: 'Welcome Header' },
          groups: [
            {
              groupName: 'Text',
              groupFields: [
                PropertyPaneTextField('title', {
                  label: 'Greeting (e.g., Welcome, Hi there)',
                  placeholder: 'Enter greeting text'
                }),
                PropertyPaneCheckbox('useCurrentUser', {
                  text: 'Append current user’s name'
                }),
                PropertyPaneCheckbox('showWave', {
                  text: 'Show wave hand'
                }),
                PropertyPaneTextField('subtitle', {
                  label: 'Subtitle',
                  placeholder: 'to your City Harvest Portal!'
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
