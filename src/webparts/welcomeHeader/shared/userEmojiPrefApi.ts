import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

export type SkinKey =
  | 'default'
  | 'light'
  | 'mediumLight'
  | 'medium'
  | 'mediumDark'
  | 'dark';

export const LIST_TITLE = 'UserEmojiPreference';
export const FIELD_USER = 'UserLogin';
export const FIELD_TONE = 'UserPreference';

function odataEscape(value: string): string {
  return value.replace(/'/g, "''");
}

export interface IUserPrefResult {
  id: number | undefined;
  tone: SkinKey | undefined;
}

type PrefItem = { Id: number } & Record<string, unknown>;

export async function getUserPref(
  ctx: WebPartContext,
  login: string
): Promise<IUserPrefResult> {
  const webUrl = ctx.pageContext.web.absoluteUrl;
  const url =
    `${webUrl}/_api/web/lists/getbytitle('${encodeURIComponent(LIST_TITLE)}')/items` +
    `?$select=Id,${FIELD_TONE}&$filter=${FIELD_USER} eq '${odataEscape(login)}'`;

  const res = await ctx.spHttpClient.get(url, SPHttpClient.configurations.v1);
  if (!res.ok) return { id: undefined, tone: undefined };

  const data = (await res.json()) as { value?: PrefItem[] };
  const item = data.value?.[0];
  if (!item) return { id: undefined, tone: undefined };

  const tone = item[FIELD_TONE] as SkinKey | undefined;
  return { id: item.Id, tone };
}


export async function upsertUserPref(
  ctx: WebPartContext,
  login: string,
  tone: SkinKey,
  existingId: number | undefined
): Promise<number> {
  const webUrl: string = ctx.pageContext.web.absoluteUrl;

  if (existingId === undefined) {
    const createUrl: string = `${webUrl}/_api/web/lists/getbytitle('${encodeURIComponent(LIST_TITLE)}')/items`;
    const createRes: SPHttpClientResponse = await ctx.spHttpClient.post(
      createUrl,
      SPHttpClient.configurations.v1,
      {
        headers: {
          Accept: 'application/json;odata=nometadata',
          'Content-Type': 'application/json;odata=nometadata'
        },
        body: JSON.stringify({
          [FIELD_USER]: login,
          [FIELD_TONE]: tone
        })
      }
    );
    if (!createRes.ok) {
      throw new Error('Create failed');
    }
    const created: { Id: number } = await createRes.json();
    return created.Id;
  }

  const updateUrl: string =
    `${webUrl}/_api/web/lists/getbytitle('${encodeURIComponent(LIST_TITLE)}')/items(${existingId})`;
  const updateRes: SPHttpClientResponse = await ctx.spHttpClient.fetch(
    updateUrl,
    SPHttpClient.configurations.v1,
    {
      method: 'MERGE',
      headers: {
        Accept: 'application/json;odata=nometadata',
        'Content-Type': 'application/json;odata=nometadata',
        'IF-MATCH': '*'
      },
      body: JSON.stringify({ [FIELD_TONE]: tone })
    }
  );
  if (!updateRes.ok) {
    throw new Error('Update failed');
  }
  return existingId;
}

/** Optional: call once to auto-create list+fields if missing (ignore errors if perms are locked down) */
export async function ensureList(ctx: WebPartContext): Promise<void> {
  const webUrl: string = ctx.pageContext.web.absoluteUrl;

  // Check if list exists
  const check = await ctx.spHttpClient.get(
    `${webUrl}/_api/web/lists/getbytitle('${encodeURIComponent(LIST_TITLE)}')?$select=Id`,
    SPHttpClient.configurations.v1
  );
  if (check.ok) {
    return;
  }

  // Create list
  const createList = await ctx.spHttpClient.post(
    `${webUrl}/_api/web/lists`,
    SPHttpClient.configurations.v1,
    {
      headers: {
        Accept: 'application/json;odata=nometadata',
        'Content-Type': 'application/json;odata=nometadata'
      },
      body: JSON.stringify({
        BaseTemplate: 100,
        Description: 'Stores per-user emoji skin tone preference.',
        Title: LIST_TITLE
      })
    }
  );
  if (!createList.ok) {
    throw new Error('Failed to create list');
  }

  // Add fields
  const addField = async (title: string, required: boolean): Promise<void> => {
    const res = await ctx.spHttpClient.post(
      `${webUrl}/_api/web/lists/getbytitle('${encodeURIComponent(LIST_TITLE)}')/fields/addfield`,
      SPHttpClient.configurations.v1,
      {
        headers: {
          Accept: 'application/json;odata=nometadata',
          'Content-Type': 'application/json;odata=nometadata'
        },
        body: JSON.stringify({
          parameters: {
            '@odata.type': '#Microsoft.SharePoint.SPFieldText',
            Title: title,
            FieldTypeKind: 2,
            Required: required
          }
        })
      }
    );
    if (!res.ok) {
      throw new Error(`Failed to add field ${title}`);
    }
  };

  await addField(FIELD_USER, true);
  await addField(FIELD_TONE, false);
}
