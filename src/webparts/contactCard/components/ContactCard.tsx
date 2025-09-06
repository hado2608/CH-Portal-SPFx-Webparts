import * as React from 'react';
import styles from './ContactCard.module.scss';

export interface IContactCardProps {
  layout: 'small' | 'large';
  contactEmail?: string;
  contactPhone?: string;
  contactLink?: string;
  description?: string;
}
const ContactCard: React.FC<IContactCardProps> = ({
  layout,
  contactEmail,
  contactPhone,
  contactLink,
  description
}) => {
  return (
    <div className={`${styles.contactCard} ${layout === 'large' ? styles.large : styles.small}`}>
      <div className={styles.leftCol}>
        {contactEmail && (
          <div className={styles.item}>
            <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
          </div>
        )}
        {contactPhone && (
          <div className={styles.item}>
            <a href={`tel:${contactPhone}`}>{contactPhone}</a>
          </div>
        )}
        {contactLink && (
          <div className={styles.item}>
            <a href={contactLink} target="_blank"data-interception="off" rel="noreferrer">{contactLink}</a>
          </div>
        )}
      </div>

      {layout === 'large' && <div className={styles.divider} />}

      {description && (
        <div className={styles.rightCol}>
          <p>{description}</p>
        </div>
      )}
    </div>
  );
};

export default ContactCard;
