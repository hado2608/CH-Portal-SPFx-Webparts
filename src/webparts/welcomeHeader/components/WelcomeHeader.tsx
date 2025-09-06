import * as React from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import styles from './WelcomeHeader.module.scss';

import {
  SkinKey,
  getUserPref,
  ensureList
} from '../shared/userEmojiPrefApi';
import { SPHttpClientResponse, SPHttpClient } from '@microsoft/sp-http';

const SKIN_MOD: Record<SkinKey, string> = {
  default: '',
  light: '\u{1F3FB}',
  mediumLight: '\u{1F3FC}',
  medium: '\u{1F3FD}',
  mediumDark: '\u{1F3FE}',
  dark: '\u{1F3FF}'
};

export interface IWelcomeHeaderProps {
  context: WebPartContext;
  userName: string;   // empty string = no name appended
  title: string;      // greeting prefix (e.g., "Welcome", "Hi there")
  subtitle: string;
  showWave?: boolean
}

export const WelcomeHeader: React.FC<IWelcomeHeaderProps> = (props: IWelcomeHeaderProps): JSX.Element => {
  const { context, userName, title, subtitle, showWave = true } = props;

  const firstName: string = userName?.split(' ')[0] ?? '';
  const login: string =
    context.pageContext.user.loginName ||
    context.pageContext.user.email ||
    context.pageContext.user.displayName;

  const [loading, setLoading] = React.useState<boolean>(true);
  const [open, setOpen] = React.useState<boolean>(false);
  const [tone, setTone] = React.useState<SkinKey>('default');
  const [itemId, setItemId] = React.useState<number | undefined>(undefined);

  React.useEffect(() => {
    const run = async (): Promise<void> => {
      try {
        try {
          await ensureList(context);
        } catch {
          // ignore perms errors
        }
        const res = await getUserPref(context, login);
        if (res.tone !== undefined) setTone(res.tone);
        setItemId(res.id);
      } catch (err) {
        console.error('Error loading user preference:', err);
      } finally {
        setLoading(false);
      }
    };
    run().catch(() => {});
  }, [context, login]);

  const onPick = async (t: SkinKey): Promise<void> => {
    setTone(t); // optimistic
    try {
      const newId = await upsertUserPref(context, login, t, itemId);
      setItemId(newId);
    } catch (error) {
      console.error('Error saving user preference:', error);
    } finally {
      setOpen(false);
    }
  };

  const toggleMenu = (): void => setOpen((o) => !o);
  const wave: string = `👋${SKIN_MOD[tone]}`;

  return (
    <>
      <div className={styles.welcomeHeader}>
        <h1 className={styles.header}>
          {title}{firstName ? `, ${firstName}` : ''}
          {showWave && (
            <button
              className={styles.waveBtn}
              onClick={toggleMenu}
              disabled={loading}
              aria-haspopup="menu"
              aria-expanded={open}
              aria-label="Choose emoji skin tone"
              title="Choose emoji skin tone"
              type="button"
            >
              <span className={styles.wave} aria-hidden>{wave}</span>
            </button>
          )}
        </h1>
      </div>

      <div className={styles.subtitle}>{subtitle}</div>

      {open && showWave && (
        <div className={styles.toneMenu} role="menu">
          {(
            [
              ['default', '👋'],
              ['light', '👋🏻'],
              ['mediumLight', '👋🏼'],
              ['medium', '👋🏽'],
              ['mediumDark', '👋🏾'],
              ['dark', '👋🏿']
            ] as Array<[SkinKey, string]>
          ).map(([key, emoji]) => (
            <button
              key={key}
              className={`${styles.toneItem} ${tone === key ? styles.active : ''}`}
              onClick={(): Promise<void> => onPick(key as SkinKey)}
              role="menuitemradio"
              aria-checked={tone === key}
              title={key}
              type="button"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </>
  );
};

async function upsertUserPref(
  context: WebPartContext,
  login: string,
  tone: SkinKey,
  itemId?: number
): Promise<number> {
  const url = `${context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('UserEmojiPreference')/items${itemId ? `(${itemId})` : ''}`;
  const method = itemId ? 'MERGE' : 'POST';

  const response: SPHttpClientResponse = await context.spHttpClient.post(url, SPHttpClient.configurations.v1, {
    headers: {
      Accept: 'application/json;odata=nometadata',
      'Content-Type': 'application/json;odata=nometadata',
      'IF-MATCH': '*',
      'X-HTTP-Method': method
    },
    body: JSON.stringify({
      UserLogin: login,
      UserPreference: tone
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to ${method} user preference: ${response.statusText} - ${errorText}`);
  }

  const json = await response.json().catch(() => null);
  return json?.Id ?? itemId!;
}

export default WelcomeHeader;
