import * as React from 'react';
import styles from './Buttons.module.scss';

type ButtonType = 'kale' | 'berry' | 'kiwi' | 'blueberry';
type IconMode = 'fluent' | 'image';

interface IButtonItem {
  title: string;
  description?: string;
  link: string;
  type: string;

  // NEW (optional)
  iconMode?: IconMode;        // 'fluent' | 'image'
  fluentIconName?: string;    // e.g. 'Page', 'Link', 'Phone'
  iconUrl?: string;           // uploaded image URL
}

interface IButtonsGroupProps {
  buttons: IButtonItem[];
  layout: 'horizontal' | 'vertical';
}

const typeClass: Record<ButtonType, string> = {
  berry: styles.berry,
  kale: styles.kale,
  kiwi: styles.kiwi,
  blueberry: styles.blueberry
};

const typeShadowClass: Record<ButtonType, string> = {
  kale: styles.kaleShadow,
  berry: styles.berryShadow,
  kiwi: styles.kiwiShadow,
  blueberry: styles.blueberryShadow
};

const Buttons = (props: IButtonsGroupProps): React.ReactElement => {
  const { buttons, layout } = props;

  return (
    <div
      className={styles.buttons}
      style={{
        display: 'flex',
        flexDirection: layout === 'horizontal' ? 'row' : 'column',
        gap: '1.5em',
        flexWrap: 'wrap'
      }}
    >
      {buttons && buttons.map((btn, idx) => {
        const bType = (btn.type as ButtonType) || 'berry';
        const mainCls = typeClass[bType] || styles.berry;
        const shadowCls = typeShadowClass[bType] || styles.berryShadow;

        const iconEl =
          btn.iconMode === 'image' && btn.iconUrl ? (
            <img className={styles.icon} src={btn.iconUrl} alt="" aria-hidden="true" />
          ) : btn.iconMode === 'fluent' && btn.fluentIconName ? (
            <i className={`ms-Icon ms-Icon--${btn.fluentIconName} ${styles.iconFluent}`} aria-hidden="true" />
          ) : null;

        return (
          <div className={styles.buttonWrapper} key={idx}>
            <a
              href={btn.link}
              className={`${styles.button3D} ${mainCls}`}
              target="_blank"
              data-interception="off"
              rel="noopener noreferrer"
              style={{ minWidth: 220, maxWidth: 350 }}
            >
              <div className={`${styles.buttonShadow} ${shadowCls}`} />

              {/* NEW: lightweight wrapper so icon sits to the left of text */}
              <div className={styles.content}>
                {iconEl}
                <div className={styles.textBlock}>
                  <div className={styles.title}>{btn.title}</div>
                  {btn.description && <div className={styles.description}>{btn.description}</div>}
                </div>
              </div>
            </a>
          </div>
        );
      })}
    </div>
  );
};

export default Buttons;
