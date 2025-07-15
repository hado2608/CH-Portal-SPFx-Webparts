import * as React from 'react';
import styles from './WelcomeHeader.module.scss'; 

export interface IWelcomeHeaderProps {
  welcomeMessage: string;
  subtitle: string;
  userName: string;
}

const WelcomeHeader: React.FC<IWelcomeHeaderProps> = ({ welcomeMessage, subtitle, userName }) => (
  <div>
    <h1>
      Welcome, {userName}
    </h1>
    <div className={styles.subtitle}>to your City Harvest Portal!</div>
  </div>
);

export default WelcomeHeader;