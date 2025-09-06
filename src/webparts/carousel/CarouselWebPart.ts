import * as React from 'react';
import * as ReactDom from 'react-dom';
import {
  IPropertyPaneConfiguration
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'CarouselWebPartStrings';
import Carousel from './components/Carousel';
import { ICarouselItem } from './components/ICarouselItem';
import { PropertyFieldCollectionData, CustomCollectionFieldType } from '@pnp/spfx-property-controls/lib/PropertyFieldCollectionData';

export interface ICarouselWebPartProps {
  items: ICarouselItem[];
}

export default class CarouselWebPart extends BaseClientSideWebPart<ICarouselWebPartProps> {
  public render(): void {
    const element: React.ReactElement = React.createElement(Carousel, {
      items: this.properties.items
    });

    ReactDom.render(element, this.domElement);
  }

  public onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: strings.PropertyPaneDescription },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyFieldCollectionData("items", {
                  key: "items",
                  label: "Slides",
                  panelHeader: "Configure Slides",
                  manageBtnLabel: "Edit Slides",
                  value: this.properties.items,
                  fields: [
                    {
                      id: "title",
                      title: "Title",
                      type: CustomCollectionFieldType.string,
                    },
                    {
                      id: "description",
                      title: "Description",
                      type: CustomCollectionFieldType.string,
                    },
                    {
                      id: "imageUrl",
                      title: "Image URL",
                      type: CustomCollectionFieldType.string,
                    },
                    {
                      id: "linkUrl",
                      title: "Slide Link (optional)",
                      type: CustomCollectionFieldType.string,
                    },
                    {
                      id: "date",
                      title: "Date (e.g. May 8)",
                      type: CustomCollectionFieldType.string,
                    },
                    {
                      id: "day",
                      title: "Day (e.g. Today)",
                      type: CustomCollectionFieldType.string,
                    },
                    {
                      id: "time",
                      title: "Time",
                      type: CustomCollectionFieldType.string,
                    },
                    {
                      id: "location",
                      title: "Location",
                      type: CustomCollectionFieldType.string,
                    }
                  ],
                  disabled: false
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
