import * as React from 'react';
import * as ReactDom from 'react-dom';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IPropertyPaneConfiguration, PropertyPaneTextField } from '@microsoft/sp-property-pane';

import PopularFiles from './components/PopularFiles';

export interface IPopularFilesWebPartProps {
  item1FileName: string; item1Department: string; item1Url: string;
  item2FileName: string; item2Department: string; item2Url: string;
  item3FileName: string; item3Department: string; item3Url: string;
  item4FileName: string; item4Department: string; item4Url: string;
  item5FileName: string; item5Department: string; item5Url: string;
}

export default class PopularFilesWebPart extends BaseClientSideWebPart<IPopularFilesWebPartProps> {
  public render(): void {
    const items = [
      { FileName: this.properties.item1FileName, Department: this.properties.item1Department, URL: { Description: this.properties.item1FileName, Url: this.properties.item1Url } },
      { FileName: this.properties.item2FileName, Department: this.properties.item2Department, URL: { Description: this.properties.item2FileName, Url: this.properties.item2Url } },
      { FileName: this.properties.item3FileName, Department: this.properties.item3Department, URL: { Description: this.properties.item3FileName, Url: this.properties.item3Url } },
      { FileName: this.properties.item4FileName, Department: this.properties.item4Department, URL: { Description: this.properties.item4FileName, Url: this.properties.item4Url } },
      { FileName: this.properties.item5FileName, Department: this.properties.item5Department, URL: { Description: this.properties.item5FileName, Url: this.properties.item5Url } }
    ].filter(i => i.FileName && i.URL.Url);

    const element = React.createElement(PopularFiles, { items });
    ReactDom.render(element, this.domElement);
  }
   // ✅ fixes: @microsoft/spfx/pair-react-dom-render-unmount
   public onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [{
        header: { description: 'Configure up to 5 featured files' },
        groups: [
          { groupName: 'Item 1', groupFields: [
            PropertyPaneTextField('item1FileName', { label: 'File name' }),
            PropertyPaneTextField('item1Department', { label: 'Department' }),
            PropertyPaneTextField('item1Url', { label: 'Link (URL)' })
          ]},
          { groupName: 'Item 2', groupFields: [
            PropertyPaneTextField('item2FileName', { label: 'File name' }),
            PropertyPaneTextField('item2Department', { label: 'Department' }),
            PropertyPaneTextField('item2Url', { label: 'Link (URL)' })
          ]},
          { groupName: 'Item 3', groupFields: [
            PropertyPaneTextField('item3FileName', { label: 'File name' }),
            PropertyPaneTextField('item3Department', { label: 'Department' }),
            PropertyPaneTextField('item3Url', { label: 'Link (URL)' })
          ]},
          { groupName: 'Item 4', groupFields: [
            PropertyPaneTextField('item4FileName', { label: 'File name' }),
            PropertyPaneTextField('item4Department', { label: 'Department' }),
            PropertyPaneTextField('item4Url', { label: 'Link (URL)' })
          ]},
          { groupName: 'Item 5', groupFields: [
            PropertyPaneTextField('item5FileName', { label: 'File name' }),
            PropertyPaneTextField('item5Department', { label: 'Department' }),
            PropertyPaneTextField('item5Url', { label: 'Link (URL)' })
          ]}
        ]
      }]
    };
  }
}
