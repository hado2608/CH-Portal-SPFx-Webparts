import { override } from '@microsoft/decorators';
import { BaseListViewCommandSet } from '@microsoft/sp-listview-extensibility';
import { IListViewCommandSetExecuteEventParameters } from '@microsoft/sp-listview-extensibility';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import ReportOutdatedFiles from '../../webparts/reportOudatedFiles/components/ReportOudatedFiles';
import { ListViewCommandSetContext } from '@microsoft/sp-listview-extensibility';
import styles from './MarkAsOutdatedCommandCommandSet.module.scss';


export default class MarkAsOutdatedCommandCommandSet extends BaseListViewCommandSet<{}> {
  private isMarkingMode: boolean = false;
  private _modalContainer: HTMLElement | null = null;

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    if (event.itemId === 'MARK_AS_OUTDATED') {
      this.toggleMarkingMode();
    }
  }

  private toggleMarkingMode(): void {
    this.isMarkingMode = !this.isMarkingMode;
    this.renderModal();
  }

  private renderModal(): void {
    const setIsMarkingMode: (val: boolean) => void = (val: boolean): void => {
      this.isMarkingMode = val;
      this.renderModal();
    };

    const onClose: () => void = (): void => {
      this.isMarkingMode = false;
      this.renderModal();
    };

    const element = React.createElement(ReportOutdatedFiles, {
      context: this.context as ListViewCommandSetContext,
      isMarkingMode: this.isMarkingMode,
      setIsMarkingMode,
      onClose
    });

    if (!this._modalContainer) {
      this._modalContainer = document.createElement('div');
      document.body.appendChild(this._modalContainer);
    }

    ReactDom.render(element, this._modalContainer);
  }

  public onDispose(): void {
    if (this._modalContainer) {
      ReactDom.unmountComponentAtNode(this._modalContainer);
      this._modalContainer.remove();
      this._modalContainer = null;
    }
  }

  public onListViewUpdated(): void {
    const command = this.tryGetCommand('MARK_AS_OUTDATED');
    if (command) {
      command.visible = true;
  
      // Wait a moment for DOM to render then patch class
      setTimeout(() => {
        const buttons = document.querySelectorAll('[data-automationid="commandBarButton"]');
        buttons.forEach((btn: Element) => {
          const label = btn.querySelector('.msButtonLabel');
          if (label?.textContent === 'Mark Files As Outdated') {
            btn.classList.add(styles.ribbonButton);
          }
        });
      }, 100); // Give it some time to render
    }
  }
  
}
