import * as React from 'react';
import styles from './Buttons.module.scss';

interface IButtonItem {
  title: string;
  description?: string;
  link: string;
  type: string;
}

interface IButtonsGroupProps {
  buttons: IButtonItem[];
  layout: 'horizontal' | 'vertical';
}

const typeClass: Record<string, string> = {
  berry: styles.berry,
  kale: styles.kale,
  kiwi: styles.kiwi,
  blueberry: styles.blueberry
};

const Buttons = (props: IButtonsGroupProps): React.ReactElement => {
  const { buttons, layout } = props;
  return (
    <div style={{
      display: 'flex',
      flexDirection: layout === 'horizontal' ? 'row' : 'column',
      gap: '16px',
      flexWrap: 'wrap'
    }}>
      {buttons && buttons.map((btn, idx) => (
        <a
          key={idx}
          href={btn.link}
          className={`${styles.button} ${typeClass[btn.type] || styles.berry}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ minWidth: 220, maxWidth: 350 }}
        >
          <div className={styles.title}>{btn.title}</div>
          {btn.description && <div className={styles.description}>{btn.description}</div>}
        </a>
      ))}
    </div>
  );
};

export default Buttons;