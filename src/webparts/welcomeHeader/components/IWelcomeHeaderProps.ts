import { WebPartContext } from '@microsoft/sp-webpart-base';

export interface IWelcomeHeaderProps {
  context: WebPartContext;
  userName: string;
  title: string;
  subtitle: string;
}
