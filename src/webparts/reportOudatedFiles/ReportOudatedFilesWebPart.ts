import * as React from 'react';
import * as ReactDom from 'react-dom';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import ReportOutdatedFiles from './components/ReportOudatedFiles';
import { ListViewCommandSetContext } from '@microsoft/sp-listview-extensibility';

export default class ReportOutdatedFilesWebPart extends BaseClientSideWebPart<{}> {
  private isMarkingMode: boolean = true;

  public render(): void {
    const setIsMarkingMode = (val: boolean): void => {
      this.isMarkingMode = val;
      this.render(); // re-render to reflect state change
    };

    const onClose = (): void => {
      console.log("✅ Modal closed");
      this.isMarkingMode = false;
      this.render(); // re-render after closing
    };

    const element = React.createElement(
      ReportOutdatedFiles,
      {
        context: this.context as unknown as ListViewCommandSetContext,
        isMarkingMode: this.isMarkingMode,
        setIsMarkingMode,
        onClose
      }
    );

    ReactDom.render(element, this.domElement);
  }

  public onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }
}
